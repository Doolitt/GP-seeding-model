import type {
  Assumptions,
  CoInvest,
  Deal,
  Fund,
  GrowthProfile,
  IntakeAnswers,
  OwnershipStep,
  StepDownPace,
  WizardAnswers,
} from '@/types';

// ─── Intake mapping tables ──────────────────────────────────────────────────

const GROWTH_FACTORS: Record<GrowthProfile, [number, number, number]> = {
  Conservative: [1.0, 1.5, 2.0],
  Base:         [1.0, 1.8, 2.8],
  Aggressive:   [1.0, 2.2, 3.5],
};

// [year, gpOwnershipFactor] — carry share always stays at initial value
const STEP_PACE: Record<StepDownPace, Array<[number, number]>> = {
  Slow:     [[0, 1.00], [7, 0.85], [12, 0.65], [18, 0.50]],
  Standard: [[0, 1.00], [5, 0.80], [8,  0.60], [12, 0.40]],
  Fast:     [[0, 1.00], [3, 0.70], [6,  0.45], [10, 0.25]],
};

export function makeOwnershipSchedule(initial: number): OwnershipStep[] {
  return [
    { year: 0, gpOwnership: initial, carryShare: initial },
    { year: 5, gpOwnership: +(initial * 0.8).toFixed(4), carryShare: initial },
    { year: 8, gpOwnership: +(initial * 0.6).toFixed(4), carryShare: initial },
    { year: 12, gpOwnership: +(initial * 0.4).toFixed(4), carryShare: initial },
  ];
}

export function makeFundsFromAum(firmAumM: number, moic: number): Fund[] {
  const sizes = [firmAumM * 0.5, firmAumM * 1.0, firmAumM * 1.7];
  const vintages = [0, 4, 8];
  const realizeStart = [5, 9, 13];
  const realizeEnd = [10, 14, 18];
  const names = ['Fund I', 'Fund II', 'Fund III'];

  return sizes.map((sizeM, i) => ({
    id: `fund-${i + 1}`,
    name: names[i],
    enabled: true,
    sizeM: Math.round(sizeM),
    vintageYear: vintages[i],
    investmentPeriodYrs: 5,
    fundLifeYrs: 10,
    mgmtFeeRate: 0.02,
    feeStepDownRate: 0.015,
    carryRate: 0.2,
    moic,
    realizationStartYr: realizeStart[i],
    realizationEndYr: realizeEnd[i],
    lpCommitment: 0,
    callYears: 4,
    distYears: 7,
    netMoic: 1.7,
  }));
}

export function buildAssumptions(a: WizardAnswers): Assumptions {
  return {
    seedInvestmentM: a.seedInvestmentM,
    funds: makeFundsFromAum(a.firmAum, a.expectedMoic),
    ownershipSchedule: makeOwnershipSchedule(a.initialOwnership),
    gpFirmMargin: 0.55,
    terminalMultiple: 15,
    exitYear: 15,
    discountRate: 0.1,
    coInvests: [],
  };
}

// RFC-compliant UUID v4 fallback (Safari < 15.4 + older browsers)
function uuid(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof (crypto as any).randomUUID === 'function'
  ) {
    return (crypto as any).randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function buildDeal(a: WizardAnswers): Deal {
  return {
    id: uuid(),
    name: a.name || 'Untitled Deal',
    strategy: a.strategy,
    createdAt: new Date().toISOString(),
    enabled: true,
    dealStartYear: a.dealStartYear,
    assumptions: buildAssumptions(a),
  };
}

export function newFund(name = 'New Fund'): Fund {
  return {
    id: `fund-${uuid().slice(0, 8)}`,
    name,
    enabled: true,
    sizeM: 500,
    vintageYear: 0,
    investmentPeriodYrs: 5,
    fundLifeYrs: 10,
    mgmtFeeRate: 0.02,
    feeStepDownRate: 0.015,
    carryRate: 0.2,
    moic: 2.0,
    realizationStartYr: 5,
    realizationEndYr: 10,
    lpCommitment: 0,
    callYears: 4,
    distYears: 7,
    netMoic: 1.7,
  };
}

export function newCoInvest(name = 'Co-Investment'): CoInvest {
  return {
    id: `co-${uuid().slice(0, 8)}`,
    name,
    commitment: 10,
    vintageYear: 3,
    exitYear: 8,
    moic: 2.5,
  };
}

export const WIZARD_DEFAULTS: WizardAnswers = {
  name: '',
  strategy: 'Buyout',
  seedInvestmentM: 50,
  firmAum: 600,
  expectedMoic: 2.0,
  initialOwnership: 0.25,
  dealStartYear: new Date().getFullYear(),
};

// ─── Intake defaults ────────────────────────────────────────────────────────

export const INTAKE_DEFAULTS: IntakeAnswers = {
  name: '',
  strategy: 'Buyout',
  dealStartYear: new Date().getFullYear(),
  totalCommitmentM: 100,
  gpStakeAllocationPct: 30,   // $30M GP stake
  lpFundAllocationPct: 50,    // $50M LP funds  →  co-invest = 20% = $20M auto
  fundISizeM: 500,
  growthProfile: 'Base',
  netFundMoic: 1.8,
  initialOwnershipPct: 20,
  stepDownPace: 'Standard',
};

export function buildAssumptionsFromIntake(a: IntakeAnswers): Assumptions {
  const gpStakeM    = a.totalCommitmentM * a.gpStakeAllocationPct / 100;
  const lpTotalM    = a.totalCommitmentM * a.lpFundAllocationPct  / 100;
  const coInvestPct = Math.max(0, 100 - a.gpStakeAllocationPct - a.lpFundAllocationPct);
  const coTotalM    = a.totalCommitmentM * coInvestPct / 100;

  // Fund family
  const factors      = GROWTH_FACTORS[a.growthProfile];
  const fundSizes    = factors.map((f) => Math.max(50, Math.round(a.fundISizeM * f / 25) * 25));
  const totalFundSz  = fundSizes.reduce((s, x) => s + x, 0);

  // Derive gross MOIC from net MOIC assuming 20% carry:
  //   net = gross - carry_on_profit = gross - (gross-1)*0.2
  //   → gross = 1 + (net-1)/0.8
  const grossMoic = +(1 + (a.netFundMoic - 1) / 0.8).toFixed(2);

  const vintages     = [0, 4, 8];
  const realizeStart = [5, 9, 13];
  const realizeEnd   = [10, 14, 18];
  const fundNames    = ['Fund I', 'Fund II', 'Fund III'];

  const funds: Fund[] = fundSizes.map((sizeM, i) => ({
    id:               `fund-${i + 1}`,
    name:             fundNames[i],
    enabled:          true,
    sizeM,
    vintageYear:      vintages[i],
    investmentPeriodYrs: 5,
    fundLifeYrs:      10,
    mgmtFeeRate:      0.02,
    feeStepDownRate:  0.015,
    carryRate:        0.20,
    moic:             grossMoic,
    realizationStartYr: realizeStart[i],
    realizationEndYr:   realizeEnd[i],
    lpCommitment: lpTotalM > 0
      ? +((sizeM / totalFundSz) * lpTotalM).toFixed(1)
      : 0,
    callYears: 4,
    distYears: 7,
    netMoic:   a.netFundMoic,
  }));

  // Ownership schedule
  const own = a.initialOwnershipPct / 100;
  const ownershipSchedule: OwnershipStep[] = STEP_PACE[a.stepDownPace].map(
    ([year, factor]) => ({
      year,
      gpOwnership: +(own * factor).toFixed(4),
      carryShare:  own,                          // carry share stays at initial
    }),
  );

  // Co-invest sleeve — split into 1–2 positions proportional to size
  const coInvests: CoInvest[] = [];
  if (coTotalM > 0) {
    const useSplit = coTotalM >= 15;
    coInvests.push({
      id:          'co-1',
      name:        'Co-Invest I',
      commitment:  Math.round(coTotalM * (useSplit ? 0.6 : 1.0)),
      vintageYear: 3,
      exitYear:    8,
      moic:        2.5,
    });
    if (useSplit) {
      coInvests.push({
        id:          'co-2',
        name:        'Co-Invest II',
        commitment:  Math.round(coTotalM * 0.4),
        vintageYear: 7,
        exitYear:    12,
        moic:        2.5,
      });
    }
  }

  return {
    seedInvestmentM:  gpStakeM,
    funds,
    ownershipSchedule,
    gpFirmMargin:     0.55,
    terminalMultiple: 15,
    exitYear:         15,
    discountRate:     0.10,
    coInvests,
  };
}

export function buildDealFromIntake(a: IntakeAnswers): Deal {
  return {
    id:            uuid(),
    name:          a.name || 'Untitled Deal',
    strategy:      a.strategy,
    createdAt:     new Date().toISOString(),
    enabled:       true,
    dealStartYear: a.dealStartYear,
    assumptions:   buildAssumptionsFromIntake(a),
  };
}

// Sample deals a user can load to see the app populated
export function sampleDeals(): Deal[] {
  const specs: WizardAnswers[] = [
    {
      name: 'Acme Growth Partners',
      strategy: 'Growth',
      seedInvestmentM: 50,
      firmAum: 600,
      expectedMoic: 2.0,
      initialOwnership: 0.25,
      dealStartYear: 2024,
    },
    {
      name: 'Meridian Buyout IV',
      strategy: 'Buyout',
      seedInvestmentM: 75,
      firmAum: 900,
      expectedMoic: 2.2,
      initialOwnership: 0.2,
      dealStartYear: 2025,
    },
    {
      name: 'Northwind Venture',
      strategy: 'Venture',
      seedInvestmentM: 30,
      firmAum: 350,
      expectedMoic: 2.8,
      initialOwnership: 0.3,
      dealStartYear: 2026,
    },
    {
      name: 'Keystone Credit',
      strategy: 'Credit',
      seedInvestmentM: 40,
      firmAum: 500,
      expectedMoic: 1.6,
      initialOwnership: 0.22,
      dealStartYear: 2026,
    },
    {
      name: 'Summit Mid-Market',
      strategy: 'Buyout',
      seedInvestmentM: 60,
      firmAum: 700,
      expectedMoic: 2.1,
      initialOwnership: 0.25,
      dealStartYear: 2027,
    },
  ];
  return specs.map(buildDeal);
}
