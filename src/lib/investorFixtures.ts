/**
 * Investor-readable product proof — deterministic fixtures used by the
 * Mission landing surface, the public Insights prototype, and the Partners
 * skeleton in Phase 1. Values are representative samples, not production
 * telemetry or audited pilot outcomes.
 *
 * Phase 3 replaces these with Supabase reads (see plan §3); the shape here
 * is the contract those reads will fulfill.
 *
 * Gating
 * ------
 * `areInvestorFixturesEnabled()` returns `true` when:
 *   - `import.meta.env.DEV` is true (always on locally), OR
 *   - `import.meta.env.VITE_ENABLE_INVESTOR_FIXTURES === 'true'`
 *
 * Surfaces consult the gate before rendering KPI bands, partner cards,
 * incident strips, etc. so a production deploy without the flag does not
 * accidentally publish representative sample metrics.
 */

export type OperatingMetric = {
  /** Stable id for keys/anchors. */
  id: string;
  /** Short visible label (sentence case, no trailing punctuation). */
  label: string;
  /** Representative display value (caller decides formatting). */
  value: string;
  /** One-line explanation for sample reporting copy. */
  context: string;
};

export const OPERATING_METRICS: ReadonlyArray<OperatingMetric> = [
  {
    id: 'active-dialogues',
    label: 'Active dialogues',
    value: '10-15',
    context: 'Representative count of sealed rooms with recent facilitator-led activity.',
  },
  {
    id: 'completion-rate',
    label: 'Completion rate',
    value: 'About 80%',
    context: 'Share of cohorts that reach a facilitator-approved release in the sample model.',
  },
  {
    id: 'mod-interventions',
    label: 'Moderation interventions',
    value: '30-40',
    context: 'Illustrative range of pause, slow-down, or escalation actions across rooms.',
  },
  {
    id: 'retention',
    label: 'Participant retention',
    value: 'About 75%',
    context: 'Modeled share of participants returning for a second session.',
  },
  {
    id: 'incidents',
    label: 'Trust & safety incidents',
    value: 'Low single digits',
    context: 'Representative count of severity-2-or-above events a partner would review.',
  },
  {
    id: 'cross-border',
    label: 'Cross-border sessions',
    value: 'About 40%',
    context: 'Modeled share of sessions spanning two or more jurisdictions.',
  },
];

export type IncidentSeverity = 'sev1' | 'sev2' | 'sev3';

/** Last 30 days, severity bucket counts for the mini stacked-bar. */
export const INCIDENT_SEVERITY_LAST_30D: Readonly<Record<IncidentSeverity, number>> = {
  sev1: 17,
  sev2: 3,
  sev3: 0,
};

export type PartnerCaseStudy = {
  id: string;
  sector: string;
  /** Deployment scope the template fits — not a count of real partners. */
  scale: string;
  /** The shape of what gets released — not a measured outcome from a real partner. */
  outcome: string;
  body: string;
  templateLabel: string;
};

/**
 * Illustrative deployment **shapes** the platform is designed to support.
 * These are program archetypes, not real partner outcomes — the homepage
 * and `/partners` surface label them as "shapes the platform is designed
 * for" so they cannot be read as case studies of existing partners.
 *
 * When real partners are active, the `/partners` route swaps these for
 * an authenticated, partner-approved list with actual numbers.
 */
export const PARTNER_CASE_STUDIES: ReadonlyArray<PartnerCaseStudy> = [
  {
    id: 'reconciliation-fund',
    sector: 'Reconciliation funder',
    scale: 'Multi-program, multiple jurisdictions',
    outcome: 'Evaluable program proof without exposing participants',
    body: 'For funders that need to evaluate a program without identifying participants. SquadRidge is built to produce anonymous timestamped outcomes for funder review while session logs stay sealed for facilitator audit.',
    templateLabel: 'Funder evaluation template',
  },
  {
    id: 'workplace-mediation',
    sector: 'Workplace mediation',
    scale: 'Single enterprise, mid-size workforce',
    outcome: 'Accountability with witness protection',
    body: 'For leadership that needs accountability while protecting witnesses. SquadRidge is built to hold the room without recording and release only the consensus, structured for HR and compliance use.',
    templateLabel: 'Workplace mediation template',
  },
  {
    id: 'cross-border-veterans',
    sector: 'Cross-border veterans dialogue',
    scale: 'Cohorts spanning two or more countries',
    outcome: 'Verified eligibility without attribution',
    body: 'For programs where career and security cost make attribution dangerous. SquadRidge is built for verified-eligibility pseudonymous rooms with facilitator-approved releases to a shared institutional record.',
    templateLabel: 'Veterans dialogue template',
  },
];

/**
 * Page-level fixture disclosure for sample reporting surfaces.
 */
export const INSIGHTS_PROTOTYPE_DISCLOSURE =
  'Representative sample data. Not live telemetry, audited pilot results, or production reporting.';

/**
 * Single source of truth for whether the fixture-backed surfaces should
 * render. False in production unless the env flag is explicitly set.
 */
export function areInvestorFixturesEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  return import.meta.env.VITE_ENABLE_INVESTOR_FIXTURES === 'true';
}
