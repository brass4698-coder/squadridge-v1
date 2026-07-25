/** Public-site copy constants. See docs/design/full-site-visual-direction.md */

export const SITE_THESIS =
  'Privacy-first deliberation infrastructure for verified small-group problem-solving — a limited number of approved participants work through sensitive issues inside a facilitator-governed room, and only approved outcomes become a record that can be trusted outside the room.';

export const SITE_THESIS_SHORT =
  'The room is private. The process is governed. The released outcome is credible.';

/** Niche positioning — one line; do not restate the full room→gate→record spine beside it. */
export const SITE_NICHE =
  'Built for the narrow class of matters where email is too exposed, chat is too loose, and institutions still need an outcome they can cite.';

export const SITE_NOT = [
  'Not a collaboration app or open chat platform',
  'Not surveillance, predictive policing, or early-warning monitoring',
  'Not a legal instrument or operator-proof E2E encryption (today)',
] as const;

/** Ordered by go-to-market priority. */
export const TARGET_AUDIENCES = [
  'Foundations and philanthropic program teams',
  'NGO and peacebuilding facilitators',
  'Boards and executive teams',
  'HR, compliance, and ombuds offices',
  'Professional mediators and dispute-resolution practitioners',
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
  /** Sole primary conversion label — use everywhere a request CTA appears. */
  primaryLabel: 'Request pilot access',
  primaryHref: '/request-access',
  /** Sole secondary request label — diligence / briefing path. */
  secondaryBriefingLabel: 'Request briefing',
  secondaryBriefingHref: '/contact',
  /** Exploration CTAs (not request synonyms). */
  secondaryExploreLabel: 'See how release controls work',
  secondaryExploreHref: '#stage-gate',
  secondarySecurity: 'Inspect security boundary',
  secondarySecurityHref: '/security',
  secondaryProcess: 'See how it works',
  secondaryProcessHref: '/how-it-works',
  secondaryUseCases: 'Operational use cases',
  secondaryUseCasesHref: '/use-cases',
  secondaryLedger: 'Browse the ledger',
  secondaryLedgerHref: '/ledger',
  pilotHeadline: 'Request pilot access',
  /** Default close — prefer route-scoped bodies below when closing a page. */
  pilotBody:
    'We review applications manually and respond with an honest fit assessment, typically within 5–7 business days.',
  /** Route-scoped closes — same button, different reason to act. */
  closeHowItWorks:
    'Ready to run Configure → Release on a real matter? Apply for a scoped private pilot — not open signup.',
  closeSecurity:
    'For diligence, security review, or partnership exploration before a formal application.',
  closeUseCases:
    'If one of these tracks matches your matter, request a private pilot briefing. Manual review. Invite-only.',
  closeAbout:
    'Early pilots are invite-only. Tell us the matter class and facilitation context — we respond with fit, not automation.',
  closeFaq:
    'Still evaluating fit? Submit a pilot intake — we answer with scope and honesty, typically within 5–7 business days.',
  closeContact:
    'Prefer a conversation first? After briefing, most partners continue through pilot intake for role-scoped access.',
  closeLedger:
    'Seen how an approved outcome looks in the archive? Request a pilot when you are ready to run the room that produces one.',
  pilotValueLine:
    'For foundations, NGOs, and facilitators handling high-stakes matters — not open signup.',
  briefingHeadline: 'Request briefing',
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
