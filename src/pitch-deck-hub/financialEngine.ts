import type {
  AnnualFinancialRow,
  FinancialAssumptions,
  FinancialModelOutput,
  FinancialScenario,
  MonthlyFinancialRow,
} from './types';

const SCENARIO_MULTIPLIERS: Record<FinancialScenario, { revenue: number; opex: number }> = {
  base: { revenue: 1, opex: 1 },
  conservative: { revenue: 0.65, opex: 1.15 },
  aggressive: { revenue: 1.35, opex: 0.92 },
};

function interpolateFte(
  monthIndex: number,
  a: FinancialAssumptions,
): { fte: number; lineage: string[] } {
  const { headcountFteMonth0: m0, headcountFteMonth12: m12, headcountFteMonth24: m24 } = a;
  if (monthIndex <= 0) return { fte: m0, lineage: ['headcountFteMonth0'] };
  if (monthIndex <= 12) {
    const t = monthIndex / 12;
    const fte = m0 + (m12 - m0) * t;
    return { fte, lineage: ['headcountFteMonth0', 'headcountFteMonth12'] };
  }
  const t2 = Math.min(1, (monthIndex - 12) / 12);
  const fte = m12 + (m24 - m12) * t2;
  return { fte, lineage: ['headcountFteMonth12', 'headcountFteMonth24'] };
}

function payingSeatsAtMonth(
  monthIndex: number,
  a: FinancialAssumptions,
): { seats: number; lineage: string[] } {
  if (monthIndex <= 0) return { seats: 0, lineage: ['seat ramp starts at 0'] };
  const cap = Math.max(1, a.seatRampMonths);
  const rawTarget = a.targetPayingSeatsMonth12;
  const t = Math.min(1, monthIndex / cap);
  const seats = rawTarget * t;
  return {
    seats,
    lineage: ['targetPayingSeatsMonth12', 'seatRampMonths', 'pricePerPilotSeatMonthUsd'],
  };
}

/** Monthly fully-loaded payroll from interpolated FTE. */
function payrollUsd(fte: number, a: FinancialAssumptions): { amount: number; lineage: string[] } {
  const monthly = (a.fullyLoadedCostPerFteAnnualUsd / 12) * fte;
  return {
    amount: monthly,
    lineage: ['fullyLoadedCostPerFteAnnualUsd', 'headcount (interpolated)'],
  };
}

function nonPayrollOpex(a: FinancialAssumptions): { amount: number; lineage: string[] } {
  const amount =
    a.monthlyInfrastructureUsd +
    a.monthlyLegalComplianceUsd +
    a.monthlySalesMarketingUsd +
    a.monthlyContractorsUsd;
  return {
    amount,
    lineage: [
      'monthlyInfrastructureUsd',
      'monthlyLegalComplianceUsd',
      'monthlySalesMarketingUsd',
      'monthlyContractorsUsd',
    ],
  };
}

/**
 * Traceable monthly model. All figures are scenario / planning unless user enters audited actuals.
 */
export function buildFinancialModel(
  assumptions: FinancialAssumptions,
  scenario: FinancialScenario,
): FinancialModelOutput {
  const { revenue: revMult, opex: opexMult } = SCENARIO_MULTIPLIERS[scenario];
  const monthly: MonthlyFinancialRow[] = [];
  const nonPay = nonPayrollOpex(assumptions);
  let cash = assumptions.startingCashUsd;

  let runwayMonthsFromStart: number | null = null;
  let cashZeroMonthIndex: number | null = null;
  let breakEvenMonthIndex: number | null = null;

  for (let m = 0; m < assumptions.monthlyHorizonMonths; m++) {
    const { fte, lineage: fteLineage } = interpolateFte(m, assumptions);
    const seatInfo = payingSeatsAtMonth(m, assumptions);
    const rawRev = seatInfo.seats * assumptions.pricePerPilotSeatMonthUsd * revMult;
    const revLineage = [...seatInfo.lineage, `scenario revenue × ${revMult}`];

    const pay = payrollUsd(fte, assumptions);
    const payrollAdj = pay.amount * opexMult;

    const nonPayrollAdj = nonPay.amount * opexMult;
    const baseOpex = payrollAdj + nonPayrollAdj;
    const contingency = baseOpex * assumptions.contingencyRate * opexMult;
    const totalOpex = baseOpex + contingency;

    const operatingIncome = rawRev - totalOpex;
    cash += operatingIncome;

    const date = new Date(assumptions.modelStartISO + 'T12:00:00');
    date.setMonth(date.getMonth() + m);
    const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const lineage = [
      ...new Set([
        ...revLineage,
        ...fteLineage,
        ...pay.lineage.map((x) => `payroll:${x}`),
        ...nonPay.lineage.map((x) => `opex:${x}`),
        `contingencyRate (${assumptions.contingencyRate})`,
        `startingCashUsd`,
        `scenario opex × ${opexMult}`,
      ]),
    ];

    monthly.push({
      monthIndex: m,
      label,
      payingSeats: Math.round(seatInfo.seats * 100) / 100,
      revenueUsd: Math.round(rawRev * 100) / 100,
      payrollUsd: Math.round(payrollAdj * 100) / 100,
      nonPayrollOpexUsd: Math.round(nonPayrollAdj * 100) / 100,
      contingencyUsd: Math.round(contingency * 100) / 100,
      totalOpexUsd: Math.round(totalOpex * 100) / 100,
      operatingIncomeUsd: Math.round(operatingIncome * 100) / 100,
      cashEndUsd: Math.round(cash * 100) / 100,
      lineage,
    });

    if (cash < 0 && cashZeroMonthIndex === null) {
      cashZeroMonthIndex = m;
    }
    if (operatingIncome >= 0 && breakEvenMonthIndex === null && m > 0) {
      breakEvenMonthIndex = m;
    }
  }

  // Runway: months until cash < 0 from start (if ever in horizon)
  if (cashZeroMonthIndex !== null) {
    runwayMonthsFromStart = cashZeroMonthIndex;
  } else if (monthly.length > 0 && monthly[monthly.length - 1].cashEndUsd >= 0) {
    runwayMonthsFromStart = assumptions.monthlyHorizonMonths;
  }

  // Roll up annual (simple: sum months 0-11, 12-23, ...)
  const annual: AnnualFinancialRow[] = [];
  const byYear = new Map<number, MonthlyFinancialRow[]>();
  for (const row of monthly) {
    const start = new Date(assumptions.modelStartISO + 'T12:00:00');
    start.setMonth(start.getMonth() + row.monthIndex);
    const y = start.getFullYear();
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(row);
  }
  const years = [...byYear.keys()].sort();
  for (const y of years) {
    const rows = byYear.get(y)!;
    const revenueUsd = rows.reduce((s, r) => s + r.revenueUsd, 0);
    const totalOpexUsd = rows.reduce((s, r) => s + r.totalOpexUsd, 0);
    const operatingIncomeUsd = revenueUsd - totalOpexUsd;
    annual.push({
      year: y,
      revenueUsd: Math.round(revenueUsd * 100) / 100,
      totalOpexUsd: Math.round(totalOpexUsd * 100) / 100,
      operatingIncomeUsd: Math.round(operatingIncomeUsd * 100) / 100,
      lineage: ['sum of monthly rows', ...rows[0].lineage.slice(0, 3)],
    });
  }

  return {
    scenario,
    multiplierRevenue: revMult,
    multiplierOpex: opexMult,
    monthly,
    annual,
    runwayMonthsFromStart,
    cashZeroMonthIndex,
    breakEvenMonthIndex,
    labels: {
      revenue: 'scenario_model',
      costs: 'scenario_model',
      runway:
        assumptions.startingCashUsd > 0 || monthly.some((r) => r.cashEndUsd !== 0)
          ? 'scenario_model'
          : 'input_required',
    },
  };
}

export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}
