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
}

export type Strategy = 'Buyout' | 'Growth' | 'Venture' | 'Credit' | 'Other';

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
  seederTotalCF: number;
  cumulativeCF: number;
}

export interface ModelOutput {
  rows: YearRow[];
  totals: {
    totalFeeCF: number;
    totalCarryCF: number;
    totalTerminalCF: number;
    totalInflows: number;
    totalInvested: number;
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
  };
}
