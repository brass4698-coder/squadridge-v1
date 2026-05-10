import { describe, expect, it } from 'vitest';
import { buildFinancialModel } from './financialEngine';
import { DEFAULT_ASSUMPTIONS } from './initialState';
import type { FinancialAssumptions } from './types';

const baseA: FinancialAssumptions = {
  modelStartISO: '2026-01-01',
  monthlyHorizonMonths: 6,
  startingCashUsd: 500_000,
  pricePerPilotSeatMonthUsd: 1000,
  targetPayingSeatsMonth12: 10,
  seatRampMonths: 12,
  headcountFteMonth0: 2,
  headcountFteMonth12: 3,
  headcountFteMonth24: 4,
  fullyLoadedCostPerFteAnnualUsd: 180_000,
  monthlyInfrastructureUsd: 2000,
  monthlyLegalComplianceUsd: 3000,
  monthlySalesMarketingUsd: 4000,
  monthlyContractorsUsd: 5000,
  contingencyRate: 0.1,
  fundraisingAskUsd: 1_000_000,
  milestoneFirstTranche: 'Test milestone',
};

describe('buildFinancialModel', () => {
  it('computes strictly increasing revenue ramp via seats', () => {
    const m = buildFinancialModel(baseA, 'base');
    expect(m.monthly[0].revenueUsd).toBe(0);
    expect(m.monthly[1].revenueUsd).toBeGreaterThan(0);
    expect(m.monthly[3].revenueUsd).toBeGreaterThan(m.monthly[1].revenueUsd);
  });

  it('applies conservative scenario multipliers', () => {
    const b = buildFinancialModel(baseA, 'base');
    const c = buildFinancialModel(baseA, 'conservative');
    const mIdx = 3;
    expect(c.monthly[mIdx].revenueUsd).toBeLessThanOrEqual(b.monthly[mIdx].revenueUsd + 0.01);
    expect(c.monthly[mIdx].totalOpexUsd).toBeGreaterThanOrEqual(
      b.monthly[mIdx].totalOpexUsd - 0.01,
    );
  });

  it('tracks cash from starting balance', () => {
    const m = buildFinancialModel(baseA, 'base');
    expect(m.monthly[0].cashEndUsd).toBeCloseTo(
      baseA.startingCashUsd + m.monthly[0].operatingIncomeUsd,
      1,
    );
  });

  it('$750k raise: modeled cash, runway, revenue, and payroll match static investor deck + model export', () => {
    // These pinned values depend on DEFAULT_ASSUMPTIONS:
    //   startingCashUsd: 750_000, pricePerPilotSeatMonthUsd: 1_200,
    //   targetPayingSeatsMonth12: 12, seatRampMonths: 12,
    //   headcountFteMonth0: 2, headcountFteMonth12: 5, headcountFteMonth24: 9,
    //   fullyLoadedCostPerFteAnnualUsd: 185_000,
    //   monthlyInfrastructureUsd: 3_500, monthlyLegalComplianceUsd: 8_000,
    //   monthlySalesMarketingUsd: 6_000, monthlyContractorsUsd: 12_000,
    //   contingencyRate: 0.08, monthlyHorizonMonths: 24.
    // If any of these assumption values change, update the expected figures below to match.
    const a = {
      ...DEFAULT_ASSUMPTIONS,
      modelStartISO: '2026-03-01',
      startingCashUsd: 750_000,
      fundraisingAskUsd: 750_000,
    };
    const base = buildFinancialModel(a, 'base');
    const aggressive = buildFinancialModel(a, 'aggressive');
    expect(base.monthly[23].cashEndUsd).toBeCloseTo(-1_802_265, 0);
    expect(aggressive.monthly[23].cashEndUsd).toBeCloseTo(-1_474_435, 0);
    expect(aggressive.cashZeroMonthIndex).toBe(10);
    expect(aggressive.monthly[5].revenueUsd).toBeCloseTo(8_100, 0);
    expect(aggressive.monthly[11].revenueUsd).toBeCloseTo(17_820, 0);
    expect(aggressive.monthly[17].revenueUsd).toBeCloseTo(19_440, 0);
    expect(aggressive.monthly[0].payrollUsd).toBeCloseTo(28_367, 0);
    expect(aggressive.monthly[23].payrollUsd).toBeCloseTo(122_922, 0);
    expect(base.cashZeroMonthIndex).toBe(9);
  });
});
