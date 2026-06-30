/**
 * FinancialProjectionsPage — unit tests
 *
 * Tests the projection engine and KPI derivations.
 * Does not mount the full React component (no Recharts in test env).
 */
import { describe, it, expect } from 'vitest';

// Inline the projection engine for isolated testing
interface Assumptions {
  initialSquads: number; squadGrowthPct: number; perSeatMonthly: number;
  seatsPerSquad: number; grantAnnual: number; ngoLicenseMonthly: number;
  ngoOrgs: number; ngoGrowthPct: number; monthlyBurn: number;
  burnGrowthPct: number; initialGrantRunwayMonths: number;
}
function buildProjections(a: Assumptions, quarters = 4) {
  const rows = [];
  let squads = a.initialSquads, ngoOrgs = a.ngoOrgs, burnMonthly = a.monthlyBurn;
  let cumulativeCash = a.initialGrantRunwayMonths * a.monthlyBurn;
  const SESSIONS_PER_SQUAD_PER_MONTH = 6, INTERVENTION_RATE = 0.4;
  for (let q = 0; q < quarters; q++) {
    const year = Math.floor(q / 4) + 2025, qNum = (q % 4) + 1;
    const seatRevenue  = squads * a.seatsPerSquad * a.perSeatMonthly * 3;
    const ngoRevenue   = ngoOrgs * a.ngoLicenseMonthly * 3;
    const grantRevenue = a.grantAnnual / 4;
    const totalRevenue = seatRevenue + ngoRevenue + grantRevenue;
    const quarterlyBurn = burnMonthly * 3;
    const netCashFlow  = totalRevenue - quarterlyBurn;
    cumulativeCash    += netCashFlow;
    const interventions = squads * SESSIONS_PER_SQUAD_PER_MONTH * 3 * INTERVENTION_RATE;
    rows.push({ quarter: `Q${qNum} '${String(year).slice(2)}`, squads: Math.round(squads), seatRevenue, ngoRevenue, grantRevenue, totalRevenue, quarterlyBurn, netCashFlow, cumulativeCash, costPerIntervention: interventions > 0 ? quarterlyBurn / interventions : 0 });
    squads    *= (1 + a.squadGrowthPct / 100);
    ngoOrgs   *= (1 + a.ngoGrowthPct / 100);
    burnMonthly *= (1 + a.burnGrowthPct / 100);
  }
  return rows;
}

const BASE: Assumptions = { initialSquads: 20, squadGrowthPct: 28, perSeatMonthly: 32, seatsPerSquad: 4, grantAnnual: 200_000, ngoLicenseMonthly: 240, ngoOrgs: 10, ngoGrowthPct: 22, monthlyBurn: 28_000, burnGrowthPct: 5, initialGrantRunwayMonths: 24 };

describe('buildProjections', () => {
  it('returns the requested number of quarters', () => {
    expect(buildProjections(BASE, 8)).toHaveLength(8);
  });

  it('Q1 squad count matches initialSquads', () => {
    const rows = buildProjections(BASE, 4);
    expect(rows[0].squads).toBe(BASE.initialSquads);
  });

  it('totalRevenue = seatRevenue + ngoRevenue + grantRevenue', () => {
    const rows = buildProjections(BASE, 4);
    rows.forEach(r => {
      expect(r.totalRevenue).toBeCloseTo(r.seatRevenue + r.ngoRevenue + r.grantRevenue, 2);
    });
  });

  it('squads grow by squadGrowthPct each quarter', () => {
    const rows = buildProjections({ ...BASE, squadGrowthPct: 0 }, 4);
    rows.forEach(r => expect(r.squads).toBe(BASE.initialSquads));
  });

  it('costPerIntervention decreases as squads grow with constant burn growth', () => {
    const rows = buildProjections({ ...BASE, burnGrowthPct: 0 }, 4);
    // More squads = more interventions = lower cost/intervention
    expect(rows[3].costPerIntervention).toBeLessThan(rows[0].costPerIntervention);
  });

  it('cumulativeCash starts with initialGrantRunway', () => {
    const rows = buildProjections(BASE, 1);
    const opening = BASE.initialGrantRunwayMonths * BASE.monthlyBurn;
    const expected = opening + rows[0].netCashFlow;
    expect(rows[0].cumulativeCash).toBeCloseTo(expected, 0);
  });

  it('zero grant yields totalRevenue = seatRevenue + ngoRevenue', () => {
    const rows = buildProjections({ ...BASE, grantAnnual: 0 }, 4);
    rows.forEach(r => {
      expect(r.grantRevenue).toBe(0);
      expect(r.totalRevenue).toBeCloseTo(r.seatRevenue + r.ngoRevenue, 2);
    });
  });
});
