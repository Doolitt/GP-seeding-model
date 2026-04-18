import type {
  Assumptions,
  Fund,
  ModelOutput,
  OwnershipStep,
  YearRow,
} from '@/types';

// --- helpers ---------------------------------------------------------------

function ownershipAt(schedule: OwnershipStep[], year: number): OwnershipStep {
  const sorted = [...schedule].sort((a, b) => a.year - b.year);
  let current = sorted[0] ?? { year: 0, gpOwnership: 0, carryShare: 0 };
  for (const step of sorted) {
    if (step.year <= year) current = step;
    else break;
  }
  return current;
}

function fundMgmtFee(fund: Fund, year: number): number {
  if (!fund.enabled) return 0;
  const t = year - fund.vintageYear;
  if (t < 0 || t >= fund.fundLifeYrs) return 0;
  const rate =
    t < fund.investmentPeriodYrs ? fund.mgmtFeeRate : fund.feeStepDownRate;
  return fund.sizeM * rate;
}

function fundCarry(fund: Fund, year: number): number {
  if (!fund.enabled) return 0;
  if (year < fund.realizationStartYr || year > fund.realizationEndYr) return 0;
  const profit = fund.sizeM * (fund.moic - 1);
  const totalCarry = Math.max(0, profit) * fund.carryRate;
  const windowYrs = fund.realizationEndYr - fund.realizationStartYr + 1;
  return windowYrs > 0 ? totalCarry / windowYrs : 0;
}

// Newton-Raphson IRR with bisection fallback
export function irr(cashflows: number[], guess = 0.1): number {
  if (cashflows.length === 0) return NaN;
  const hasPos = cashflows.some((cf) => cf > 0);
  const hasNeg = cashflows.some((cf) => cf < 0);
  if (!hasPos || !hasNeg) return NaN;

  const npv = (r: number) =>
    cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + r, i), 0);
  const dnpv = (r: number) =>
    cashflows.reduce(
      (acc, cf, i) => acc - (i * cf) / Math.pow(1 + r, i + 1),
      0,
    );

  let r = guess;
  for (let i = 0; i < 100; i++) {
    const f = npv(r);
    const df = dnpv(r);
    if (Math.abs(f) < 1e-7) return r;
    if (df === 0) break;
    const next = r - f / df;
    if (!isFinite(next)) break;
    if (Math.abs(next - r) < 1e-9) return next;
    r = next;
  }

  let lo = -0.99;
  let hi = 10;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const v = npv(mid);
    if (Math.abs(v) < 1e-6) return mid;
    if (v > 0) lo = mid;
    else hi = mid;
  }
  return NaN;
}

// --- main model ------------------------------------------------------------

export function runModel(a: Assumptions): ModelOutput {
  const horizon = a.exitYear;
  const rows: YearRow[] = [];

  for (let year = 0; year <= horizon; year++) {
    const { gpOwnership, carryShare } = ownershipAt(a.ownershipSchedule, year);

    const mgmtFeeRevenue = a.funds.reduce(
      (s, f) => s + fundMgmtFee(f, year),
      0,
    );
    const fre = mgmtFeeRevenue * a.gpFirmMargin;
    const grossCarry = a.funds.reduce((s, f) => s + fundCarry(f, year), 0);

    const seederFeeCF = fre * gpOwnership;
    const seederCarryCF = grossCarry * carryShare;

    let seederTerminalCF = 0;
    if (year === a.exitYear) {
      const exitOwn = ownershipAt(a.ownershipSchedule, a.exitYear).gpOwnership;
      seederTerminalCF = fre * a.terminalMultiple * exitOwn;
    }

    const seederInvestment = year === 0 ? -a.seedInvestmentM : 0;
    const seederTotalCF =
      seederFeeCF + seederCarryCF + seederTerminalCF + seederInvestment;

    const prevCum = year === 0 ? 0 : rows[year - 1].cumulativeCF;

    rows.push({
      year,
      mgmtFeeRevenue,
      fre,
      grossCarry,
      gpOwnership,
      carryShare,
      seederFeeCF,
      seederCarryCF,
      seederTerminalCF,
      seederInvestment,
      seederTotalCF,
      cumulativeCF: prevCum + seederTotalCF,
    });
  }

  const totalFeeCF = rows.reduce((s, r) => s + r.seederFeeCF, 0);
  const totalCarryCF = rows.reduce((s, r) => s + r.seederCarryCF, 0);
  const totalTerminalCF = rows.reduce((s, r) => s + r.seederTerminalCF, 0);
  const totalInflows = totalFeeCF + totalCarryCF + totalTerminalCF;
  const totalInvested = a.seedInvestmentM;

  const moic = totalInvested > 0 ? totalInflows / totalInvested : 0;
  const irrVal = irr(rows.map((r) => r.seederTotalCF));

  let paybackYear: number | null = null;
  for (const r of rows) {
    if (r.cumulativeCF >= 0) {
      paybackYear = r.year;
      break;
    }
  }

  const sum = totalInflows || 1;
  return {
    rows,
    totals: {
      totalFeeCF,
      totalCarryCF,
      totalTerminalCF,
      totalInflows,
      totalInvested,
      netProfit: totalInflows - totalInvested,
    },
    kpis: {
      moic,
      irr: irrVal,
      paybackYear,
      totalValueM: totalInflows,
    },
    breakdown: {
      feesPct: totalFeeCF / sum,
      carryPct: totalCarryCF / sum,
      terminalPct: totalTerminalCF / sum,
    },
  };
}
