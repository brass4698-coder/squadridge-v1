/**
 * financialProjections.ts
 * TypeScript types for the financial_projections Supabase table (Issue #48).
 */

/** The three forecast scenarios defined in Issue #48 acceptance criteria */
export type ProjectionScenario = 'baseline' | 'optimistic' | 'conservative';

/**
 * Row shape returned from `financial_projections` Supabase table.
 * Maps 1-to-1 with the SQL schema in the RLS migration.
 */
export interface ProjectionRow {
  id: string;                      // uuid PK
  scenario: ProjectionScenario;
  period_label: string;            // e.g. "Q1 2026", "Jan 2027"
  period_start: string;            // ISO date
  period_end: string;              // ISO date
  arr_usd: number;                 // Annual Recurring Revenue in USD
  mau: number;                     // Monthly Active Users
  revenue_usd: number;             // Actual / projected monthly revenue
  runway_months: number | null;    // Runway at current burn; null if not applicable
  burn_rate_usd: number | null;    // Monthly burn rate
  notes: string | null;            // Analyst notes
  created_at: string;              // timestamptz
  updated_at: string;              // timestamptz
}

/** Derived KPI summary computed from a set of ProjectionRows */
export interface KpiSummary {
  projected_arr: number;    // ARR from the final row of the selected scenario
  total_revenue: number;    // Sum of revenue_usd across all rows in period
  peak_mau: number;         // Max MAU value in the set
  runway_months: number | null; // Runway from the final row
}

/** Supabase insert shape (omits generated fields) */
export type ProjectionInsert = Omit<ProjectionRow, 'id' | 'created_at' | 'updated_at'>;
