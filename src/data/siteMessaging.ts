/** Public-site copy constants. See docs/design/full-site-visual-direction.md */

export const SITE_THESIS =
  'Privacy-first deliberation infrastructure for verified small-group problem-solving — a limited number of approved participants work through sensitive issues inside a facilitator-governed room, and only approved outcomes become a record that can be trusted outside the room.';

export const SITE_THESIS_SHORT =
  'The room is private. The process is governed. The released outcome is credible.';

export const SITE_NOT = [
  'Not a collaboration app or open chat platform',
  'Not surveillance, predictive policing, or early-warning monitoring',
  'Not a legal instrument or operator-proof E2E encryption (today)',
] as const;

/** Ordered by go-to-market priority — mediation practice first. */
export const TARGET_AUDIENCES = [
  'Professional mediators and dispute-resolution practitioners (primary)',
  'Restorative and de-escalation facilitation teams',
  'NGO and peacebuilding program teams',
  'Ombuds and institutional governance teams',
  'Municipal, civic, and multi-agency coordination operators',
  'Track II dialogue facilitators (later)',
] as const;

export const PILOT_FIT_STRONG = [
  'NGO or peacebuilding facilitator-led internal deliberation (2–6 staff/partners)',
  'Need for a private anchored decision memo — public ledger optional',
  'High attribution sensitivity — parties need a protected written room',
  'Willingness to operate within documented security boundaries (operator-readable rooms today)',
] as const;

export const PILOT_FIT_WEAK = [
  'Open community forum or mass signup use cases',
  'Real-time voice/video mediation as the primary modality',
  'Continuous monitoring, risk scoring, or predictive analytics requirements',
  'Expectation of full anonymity from the operator or legal binding without counsel',
] as const;

export const CTA = {
  primaryLabel: 'Request pilot access',
  primaryHref: '/request-access',
  secondarySecurity: 'Read the security overview',
  secondarySecurityHref: '/security',
  secondaryProcess: 'See how it works',
  secondaryProcessHref: '/how-it-works',
  secondaryUseCases: 'Operational use cases',
  secondaryUseCasesHref: '/use-cases',
  secondaryLedger: 'Browse the ledger',
  secondaryLedgerHref: '/ledger',
  pilotHeadline: 'Request pilot access',
  pilotBody:
    'We review pilot applications manually and respond with an honest fit assessment, typically within 5–7 business days.',
  briefingHeadline: 'Request a practice briefing',
  briefingBody:
    'For diligence conversations, security review, or partnership exploration with mediators and facilitation teams before a formal application.',
} as const;

export const EVALUATOR_JOURNEY = [
  {
    id: 'understand',
    label: 'Understand the model',
    description: 'How protected sessions become credible public records',
    href: '/how-it-works',
  },
  {
    id: 'trust',
    label: 'Review trust boundaries',
    description: 'What is protected, what is verified, and what is explicitly not claimed',
    href: '/security',
  },
  {
    id: 'fit',
    label: 'Assess operational fit',
    description: 'Mediation, ombuds, and community safety contexts where this architecture applies',
    href: '/use-cases',
  },
  {
    id: 'apply',
    label: 'Submit pilot intake',
    description: 'Manual pilot review and limited early access',
    href: '/request-access',
  },
] as const;

export type EvaluatorStepId = (typeof EVALUATOR_JOURNEY)[number]['id'];
