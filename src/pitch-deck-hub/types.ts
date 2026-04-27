/** Labels for unknown or modeled figures (never presented as factual traction). */
export type DataIntegrityLabel =
  | 'input_required'
  | 'assumption'
  | 'scenario_model'
  | 'pending_validation'
  | 'illustrative_only';

export type DeckStatus = 'draft' | 'internal' | 'external_ready' | 'needs_review';

export type ConfidenceBadge = 'verified' | 'assumption_based' | 'mixed';

export type DeckAudience =
  | 'investors'
  | 'pilots_partners'
  | 'policy_government'
  | 'technical_diligence'
  | 'facilitators_demos'
  | 'financial_appendix';

export interface PitchDeck {
  id: string;
  name: string;
  audience: DeckAudience;
  /** Same deck design system as other variants; describes how content density, angle, and slide emphasis differ for this audience. */
  narrativeEmphasis: string;
  purpose: string;
  status: DeckStatus;
  lastUpdatedISO: string;
  confidence: ConfidenceBadge;
  slideCount: number;
  owner: string;
  sectionsOutline: string[];
}

export interface MessagingLayer {
  masterPositioning: string;
  conflictPreventionThesis: string;
  oneLine: string;
  threeLine: string;
  mission: string;
  problemStatement: string;
  solutionStatement: string;
  detectionMechanism: string;
  interventionProtocol: string;
  impactMeasurement: string;
  whyNow: string;
  trustModel: string;
  coreDifferentiators: string;
  proofPoints: string;
  toneRules: string;
  bannedPhrases: string;
}

export type EvidenceCategory =
  | 'screenshot'
  | 'security_note'
  | 'pilot_assumption'
  | 'ux_rationale'
  | 'market_research'
  | 'cited_metric'
  | 'founder_note'
  | 'financial_assumption'
  | 'competitive'
  | 'risk';

export interface EvidenceItem {
  id: string;
  title: string;
  category: EvidenceCategory;
  summary: string;
  sourceUrl?: string;
  sourceDate?: string;
  confidence: ConfidenceBadge;
  approvedForExternal: boolean;
  dataLabel: DataIntegrityLabel;
  owner: string;
}

export interface ContentClaim {
  id: string;
  claim: string;
  context?: string;
  source?: string;
  sourceDate?: string;
  confidence: ConfidenceBadge;
  approvedForExternal: boolean;
  owner: string;
}

export interface ReadinessChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface DeckReadiness {
  deckId: string;
  items: ReadinessChecklistItem[];
}

export type FinancialScenario = 'base' | 'conservative' | 'aggressive';

export interface FinancialAssumptions {
  /** ISO date — model start */
  modelStartISO: string;
  /** Months to show in monthly detail */
  monthlyHorizonMonths: number;
  /** Starting cash on hand (USD) — planning figure */
  startingCashUsd: number;
  /** Priced per active pilot cohort / room-month (illustrative) */
  pricePerPilotSeatMonthUsd: number;
  /** Assumed active paying seats by end of month 12 (scenario applied separately) */
  targetPayingSeatsMonth12: number;
  /** Linear seat ramp: 0 at month 0 → target at month 12 */
  seatRampMonths: number;
  /** Headcount (FTE) at month 0 / 12 / 24 — assumptions */
  headcountFteMonth0: number;
  headcountFteMonth12: number;
  headcountFteMonth24: number;
  /** Fully loaded annual cost per FTE (USD) */
  fullyLoadedCostPerFteAnnualUsd: number;
  /** Monthly infrastructure (hosting, tooling) */
  monthlyInfrastructureUsd: number;
  /** Monthly legal & compliance */
  monthlyLegalComplianceUsd: number;
  /** Monthly sales & marketing */
  monthlySalesMarketingUsd: number;
  /** Monthly contractors (avg) */
  monthlyContractorsUsd: number;
  /** Contingency as fraction of (non-payroll opex + payroll) */
  contingencyRate: number;
  /** Fundraising ask (USD) — must align with deck; scenario only */
  fundraisingAskUsd: number;
  /** Narrative: what unlocks first tranche */
  milestoneFirstTranche: string;
}

export interface MonthlyFinancialRow {
  monthIndex: number;
  label: string;
  payingSeats: number;
  revenueUsd: number;
  payrollUsd: number;
  nonPayrollOpexUsd: number;
  contingencyUsd: number;
  totalOpexUsd: number;
  operatingIncomeUsd: number;
  cashEndUsd: number;
  /** Assumption keys that drove this row */
  lineage: string[];
}

export interface AnnualFinancialRow {
  year: number;
  revenueUsd: number;
  totalOpexUsd: number;
  operatingIncomeUsd: number;
  lineage: string[];
}

export interface FinancialModelOutput {
  scenario: FinancialScenario;
  multiplierRevenue: number;
  multiplierOpex: number;
  monthly: MonthlyFinancialRow[];
  annual: AnnualFinancialRow[];
  runwayMonthsFromStart: number | null;
  cashZeroMonthIndex: number | null;
  breakEvenMonthIndex: number | null;
  labels: { revenue: DataIntegrityLabel; costs: DataIntegrityLabel; runway: DataIntegrityLabel };
}

export interface ConsistencyIssue {
  severity: 'warning' | 'error';
  code: string;
  message: string;
  hint?: string;
}

export interface PitchDeckHubState {
  version: number;
  decks: PitchDeck[];
  messaging: MessagingLayer;
  evidence: EvidenceItem[];
  claims: ContentClaim[];
  assumptions: FinancialAssumptions;
  activeScenario: FinancialScenario;
  readiness: DeckReadiness[];
}
