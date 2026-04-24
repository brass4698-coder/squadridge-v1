/**
 * Generates JSON + embeddable JS for the static investor HTML deck from
 * Pitch Deck Hub defaults (single source of truth).
 *
 * Run: npx tsx scripts/generate-investor-deck-model.ts
 * (Committed outputs: public/pitch-deck-hub/investor-deck-model.json + .embed.js)
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildFinancialModel } from '../src/pitch-deck-hub/financialEngine';
import { DEFAULT_ASSUMPTIONS } from '../src/pitch-deck-hub/initialState';
import type { FinancialScenario } from '../src/pitch-deck-hub/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/pitch-deck-hub');

const scenarios: FinancialScenario[] = ['base', 'conservative', 'aggressive'];

function sensitizePrice(mult: number) {
  return buildFinancialModel(
    {
      ...DEFAULT_ASSUMPTIONS,
      pricePerPilotSeatMonthUsd: DEFAULT_ASSUMPTIONS.pricePerPilotSeatMonthUsd * mult,
    },
    'base',
  );
}

function main() {
  const assumptions = { ...DEFAULT_ASSUMPTIONS };
  const models = Object.fromEntries(
    scenarios.map((s) => [s, buildFinancialModel(assumptions, s)]),
  ) as Record<FinancialScenario, ReturnType<typeof buildFinancialModel>>;

  const base = models.base;
  const aggressive = models.aggressive;

  const sensitivitySeatMinus10 = sensitizePrice(0.9);
  const sensitivitySeatPlus10 = sensitizePrice(1.1);

  /** Month labels for chart axes (month 1 = index 0) */
  const monthlyRows = base.monthly.map((r) => ({
    monthIndex: r.monthIndex,
    label: r.label,
    cashEndUsd: r.cashEndUsd,
    revenueUsd: r.revenueUsd,
    totalOpexUsd: r.totalOpexUsd,
    operatingIncomeUsd: r.operatingIncomeUsd,
    payingSeats: r.payingSeats,
  }));

  const aggMonthly = aggressive.monthly.map((r) => ({
    monthIndex: r.monthIndex,
    revenueUsd: r.revenueUsd,
  }));

  const fmtUsd = (n: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  const fmtUsdShort = (n: number) => {
    const sign = n < 0 ? '−' : '';
    const v = Math.abs(n);
    if (v >= 1_000_000) return `${sign}$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000) return `${sign}$${Math.round(v / 1_000)}k`;
    return `${sign}$${Math.round(v)}`;
  };

  const lastIdx = base.monthly.length - 1;
  const modelDate = assumptions.modelStartISO.slice(0, 10);

  const rc = base.cashZeroMonthIndex;
  const runwayCopy =
    rc != null
      ? `~${rc} mo to first modeled month-end cash below zero (base; month index ${rc})`
      : `No cash-out in ${assumptions.monthlyHorizonMonths}-month horizon (base)`;

  const payload = {
    generatedAt: new Date().toISOString(),
    chartFooter: `Scenario model · not audited actuals · assumptions from Pitch Deck Hub · model start ${modelDate} · regenerate: npm run gen:investor-deck`,
    kpi: {
      fundraisingAskUsd: assumptions.fundraisingAskUsd,
      fundraisingAskLabel: fmtUsd(assumptions.fundraisingAskUsd),
      /** Base scenario */
      base: {
        runwayMonthsToCashRisk: base.cashZeroMonthIndex,
        runwayCopy,
        cashEndMonth18: base.monthly[17]?.cashEndUsd ?? null,
        cashEndMonth18Label: base.monthly[17] ? fmtUsdShort(base.monthly[17].cashEndUsd) : '—',
        cashEndLastMonth: base.monthly[lastIdx]?.cashEndUsd ?? null,
        cashEndLastMonthLabel: base.monthly[lastIdx]
          ? fmtUsd(base.monthly[lastIdx].cashEndUsd)
          : '—',
        breakEvenMonthLabel:
          base.breakEvenMonthIndex != null
            ? `M${base.breakEvenMonthIndex + 1}`
            : 'Not in 24-mo horizon (modeled)',
      },
      /** Aggressive scenario — used for revenue ramp illustration */
      aggressive: {
        runwayMonthsToCashRisk: aggressive.cashZeroMonthIndex,
        revenueAtMonths: [1, 6, 12, 18].map((m) => {
          const i = m - 1;
          return { month: m, revenueUsd: aggressive.monthly[i]?.revenueUsd ?? 0 };
        }),
      },
    },
    sensitivity: {
      label: 'Seat price ±10% (base opex/revenue stack otherwise)',
      seatMinus10Runway: sensitivitySeatMinus10.cashZeroMonthIndex,
      seatPlus10Runway: sensitivitySeatPlus10.cashZeroMonthIndex,
    },
    assumptions: {
      modelStartISO: assumptions.modelStartISO,
      monthlyHorizonMonths: assumptions.monthlyHorizonMonths,
      startingCashUsd: assumptions.startingCashUsd,
      pricePerPilotSeatMonthUsd: assumptions.pricePerPilotSeatMonthUsd,
      targetPayingSeatsMonth12: assumptions.targetPayingSeatsMonth12,
      seatRampMonths: assumptions.seatRampMonths,
      headcountFteMonth0: assumptions.headcountFteMonth0,
      headcountFteMonth12: assumptions.headcountFteMonth12,
      headcountFteMonth24: assumptions.headcountFteMonth24,
      fullyLoadedCostPerFteAnnualUsd: assumptions.fullyLoadedCostPerFteAnnualUsd,
      contingencyRate: assumptions.contingencyRate,
      milestoneFirstTranche: assumptions.milestoneFirstTranche,
    },
    monthly: monthlyRows,
    aggressiveMonthly: aggMonthly,
    scenarios: scenarios.reduce(
      (acc, s) => {
        const m = models[s];
        acc[s] = {
          runwayMonthsFromStart: m.runwayMonthsFromStart,
          cashZeroMonthIndex: m.cashZeroMonthIndex,
          breakEvenMonthIndex: m.breakEvenMonthIndex,
        };
        return acc;
      },
      {} as Record<string, unknown>,
    ),
  };

  const jsonPath = join(OUT_DIR, 'investor-deck-model.json');
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const embed = `window.__INVESTOR_DECK_MODEL=${JSON.stringify(payload)};`;

  const embedPath = join(OUT_DIR, 'investor-deck-model.embed.js');
  writeFileSync(embedPath, embed, 'utf8');

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${embedPath}`);
  console.log(
    `Base runway (months to first negative month-end cash): ${base.cashZeroMonthIndex}; ask ${fmtUsd(assumptions.fundraisingAskUsd)}`,
  );
}

main();
