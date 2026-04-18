import { irr, runModel } from './model';
import type { Deal, ModelOutput } from '@/types';

export interface DealResult {
  deal: Deal;
  output: ModelOutput;
}

export interface PortfolioRow {
  year: number;
  byDeal: Record<string, number>;
  total: number;
  cumulative: number;
}

export interface PortfolioContribution {
  dealId: string;
  name: string;
  strategy: string;
  invested: number;
  totalValue: number;
  moic: number;
  irr: number;
  pctOfValue: number;
}

export interface VintagePoint {
  year: number;
  capitalDeployedM: number;
  dealCount: number;
}

export interface PortfolioOutput {
  results: DealResult[];
  rows: PortfolioRow[];
  kpis: {
    irr: number;
    moic: number;
    totalInvested: number;
    totalValueM: number;
    netProfit: number;
    paybackYear: number | null;
    activeDealCount: number;
  };
  contributions: PortfolioContribution[];
  vintages: VintagePoint[];
}

function emptyPortfolio(): PortfolioOutput {
  return {
    results: [],
    rows: [],
    kpis: {
      irr: NaN,
      moic: 0,
      totalInvested: 0,
      totalValueM: 0,
      netProfit: 0,
      paybackYear: null,
      activeDealCount: 0,
    },
    contributions: [],
    vintages: [],
  };
}

export function runPortfolio(deals: Deal[]): PortfolioOutput {
  const active = deals.filter((d) => d.enabled);
  if (active.length === 0) return emptyPortfolio();

  const results: DealResult[] = active.map((d) => ({
    deal: d,
    output: runModel(d.assumptions),
  }));

  const minYear = Math.min(...active.map((d) => d.dealStartYear));
  const maxYear = Math.max(
    ...active.map((d) => d.dealStartYear + d.assumptions.exitYear),
  );

  const rows: PortfolioRow[] = [];
  let cumulative = 0;

  for (let year = minYear; year <= maxYear; year++) {
    const byDeal: Record<string, number> = {};
    let total = 0;

    for (const { deal, output } of results) {
      const localYear = year - deal.dealStartYear;
      const row = output.rows.find((r) => r.year === localYear);
      const cf = row ? row.seederTotalCF : 0;
      byDeal[deal.id] = cf;
      total += cf;
    }

    cumulative += total;
    rows.push({ year, byDeal, total, cumulative });
  }

  const portfolioCFs = rows.map((r) => r.total);
  const totalInvested = active.reduce(
    (s, d) => s + d.assumptions.seedInvestmentM,
    0,
  );
  const totalValueM = results.reduce((s, r) => s + r.output.kpis.totalValueM, 0);
  const portfolioIrr = irr(portfolioCFs);
  const paybackYear = rows.find((r) => r.cumulative >= 0)?.year ?? null;

  const contributions: PortfolioContribution[] = results.map(
    ({ deal, output }) => ({
      dealId: deal.id,
      name: deal.name,
      strategy: deal.strategy,
      invested: deal.assumptions.seedInvestmentM,
      totalValue: output.kpis.totalValueM,
      moic: output.kpis.moic,
      irr: output.kpis.irr,
      pctOfValue: totalValueM > 0 ? output.kpis.totalValueM / totalValueM : 0,
    }),
  );

  const vintageMap = new Map<
    number,
    { capitalDeployedM: number; deals: Set<string> }
  >();
  for (const { deal } of results) {
    for (const fund of deal.assumptions.funds) {
      if (!fund.enabled) continue;
      const absVintage = deal.dealStartYear + fund.vintageYear;
      const existing = vintageMap.get(absVintage) ?? {
        capitalDeployedM: 0,
        deals: new Set(),
      };
      existing.capitalDeployedM += fund.sizeM;
      existing.deals.add(deal.id);
      vintageMap.set(absVintage, existing);
    }
  }
  const vintages: VintagePoint[] = [...vintageMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, v]) => ({
      year,
      capitalDeployedM: v.capitalDeployedM,
      dealCount: v.deals.size,
    }));

  return {
    results,
    rows,
    kpis: {
      irr: portfolioIrr,
      moic: totalInvested > 0 ? totalValueM / totalInvested : 0,
      totalInvested,
      totalValueM,
      netProfit: totalValueM - totalInvested,
      paybackYear,
      activeDealCount: active.length,
    },
    contributions,
    vintages,
  };
}
