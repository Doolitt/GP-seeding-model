export interface Fund {
  id: string;
  name: string;
  enabled: boolean;
  sizeM: number;
  vintageYear: number;              // relative to deal start (year 0)
  investmentPeriodYrs: number;
  fundLifeYrs: number;
  mgmtFeeRate: number;              // e.g. 0.02
  feeStepDownRate: number;          // post-investment-period fee
  carryRate: number;                // e.g. 0.20
  moic: number;                     // gross MOIC on invested capital
  realizationStartYr: number;
  realizationEndYr: number;
  // LP economics (seeder commits capital as an LP in addition to buying the GP stake)
  lpCommitment: number;             // $M committed as LP; 0 = no LP position
  callYears: number;                // years over which capital is called
  distYears: number;                // years over which distributions are paid
  netMoic: number;                  // net MOIC to LP, after fund fees & carry
}

export interface CoInvest {
  id: string;
  name: string;
  commitment: number;               // $M deployed
  vintageYear: number;              // relative year of capital call
  exitYear: number;                 // relative year of exit distribution
  moic: number;                     // gross MOIC (no fees/carry on co-invests)
}

export interface OwnershipStep {
  year: number;
  gpOwnership: number;              // seeder's share of GP mgmt co
  carryShare: number;               // seeder's share of GP carry
}

export interface Assumptions {
  seedInvestmentM: number;
  funds: Fund[];
  ownershipSchedule: OwnershipStep[];
  gpFirmMargin: number;             // FRE margin on mgmt fees
  terminalMultiple: number;         // multiple of FRE at exit
  exitYear: number;
  discountRate: number;
  coInvests: CoInvest[];
}

export type Strategy = 'Buyout' | 'Growth' | 'Venture' | 'Credit' | 'Other';
export type GrowthProfile = 'Conservative' | 'Base' | 'Aggressive';
export type StepDownPace = 'Slow' | 'Standard' | 'Fast';

export interface IntakeAnswers {
  name: string;
  strategy: Strategy;
  dealStartYear: number;
  totalCommitmentM: number;       // total capital across GP stake + LP funds + co-invest
  gpStakeAllocationPct: number;   // % of total → GP stake purchase price
  lpFundAllocationPct: number;    // % of total → LP commitments across fund family
  // co-invest slice = 100 - gpStake - lpFund (derived, never stored)
  fundISizeM: number;             // Fund I AUM at launch
  growthProfile: GrowthProfile;   // fund-to-fund growth trajectory
  netFundMoic: number;            // net MOIC to LP after fund fees & carry
  initialOwnershipPct: number;    // seeder's opening % in GP mgmt co
  stepDownPace: StepDownPace;     // how fast GP ownership steps down
}

export interface Deal {
  id: string;
  name: string;
  strategy: Strategy;
  createdAt: string;
  enabled: boolean;
  dealStartYear: number;            // absolute calendar year
  assumptions: Assumptions;
}

export interface WizardAnswers {
  name: string;
  strategy: Strategy;
  seedInvestmentM: number;
  firmAum: number;
  expectedMoic: number;
  initialOwnership: number;
  dealStartYear: number;
}

export interface YearRow {
  year: number;
  mgmtFeeRevenue: number;
  fre: number;
  grossCarry: number;
  gpOwnership: number;
  carryShare: number;
  seederFeeCF: number;
  seederCarryCF: number;
  seederTerminalCF: number;
  seederInvestment: number;
  lpCapitalCalls: number;           // negative: seeder paying into funds as LP
  lpDistributions: number;          // positive: fund distributions back to seeder
  coInvestCF: number;               // negative at call, positive at exit
  seederTotalCF: number;
  cumulativeCF: number;
}

export interface ModelOutput {
  rows: YearRow[];
  totals: {
    totalFeeCF: number;
    totalCarryCF: number;
    totalTerminalCF: number;
    totalLpDistributions: number;
    totalLpCalls: number;           // negative
    totalCoInvestNet: number;       // net of calls + exits
    totalInflows: number;           // sum of all positive seederTotalCF
    totalInvested: number;          // |sum of all negative seederTotalCF|
    netProfit: number;
  };
  kpis: {
    moic: number;
    irr: number;
    paybackYear: number | null;
    totalValueM: number;
  };
  breakdown: {
    feesPct: number;
    carryPct: number;
    terminalPct: number;
    lpFundPct: number;
    coInvestPct: number;
  };
}
