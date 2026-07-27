/** Public-site copy constants. See docs/design/full-site-visual-direction.md */

/**
 * One-line mission — optimize public copy around this sentence.
 * Private room for hard issues; public clarity without the conversation.
 */
export const SITE_MISSION =
  'People need a private room to work through hard issues. When resolution is reached, the public can see a clear approved outcome — not the conversation.';

export const SITE_THESIS =
  'SquadRidge is facilitator-led infrastructure for structured private deliberation: a small group of relevant people works through a sensitive issue in a controlled written room, and only an approved outcome can leave as a public record.';

export const SITE_THESIS_SHORT = 'Private room. Structured participation. Approved outcomes only.';

/** Canonical category — repeat sparingly as the product noun, not as a slogan. */
export const SITE_CATEGORY = 'Private deliberation infrastructure';

/** Plain-English companion under the category noun for first-time visitors. */
export const SITE_CATEGORY_PLAIN =
  'A governed written room for sensitive matters — and a citable public outcome only when release is deliberate.';

/** Hero / category lead — prefer SITE_MISSION; keep alias for existing imports. */
export const SITE_CATEGORY_PROMISE = SITE_MISSION;

/** Market gap — one line; do not restate the full room→gate→record spine beside it. */
export const SITE_NICHE =
  'Built for foundations, NGOs, boards, HR/ombuds, and facilitation teams who need a private written room and a citable record — without treating chat as the archive.';

/** Why this category matters now — precise, non-speculative. */
export const SITE_WHY_NOW =
  'Institutions still need decisions they can cite — even when publishing the deliberation would damage the process that produced them.';

/**
 * What a serious pilot partner can evaluate in the product today.
 * Keep aligned with `src/data/implementationStatus.ts` — never list scaffolded items as live.
 */
export const PARTNER_EVALUATION = [
  'Facilitator-controlled entry and release',
  'Recorded approval chain before publication',
  'Metadata-only audit export after close',
  'Approved record with SHA-256 integrity anchor — tamper-evident, recomputable today (LIVE).',
  'RFC 3161 trusted timestamping — SCAFFOLDED only; not live until a verified TSA path stores a token.',
] as const;

export const SITE_NOT = [
  'Not a collaboration app or open chat platform',
  'Not surveillance, predictive policing, or early-warning monitoring',
  'Not a legal instrument or operator-proof E2E encryption (today)',
] as const;

/** Ordered by go-to-market priority — same spine as homepage; peacebuilding is a track, not the category. */
export const TARGET_AUDIENCES = [
  'Foundations and philanthropic program teams',
  'NGO and facilitation teams (including peacebuilding contexts)',
  'Boards and executive teams',
  'HR, compliance, and ombuds offices',
  'Professional mediators and dispute-resolution practitioners',
  'Track II dialogue facilitators (later)',
] as const;

/**
 * Honest intake timing for a human-reviewed, invite-only funnel.
 * Prefer this over hard SLAs that overpromise solo-founder bandwidth.
 */
export const INTAKE_REVIEW_TIMING = {
  /** Short chip / status rail */
  short: 'Human review · target about one week',
  /** Sentence for intake and CTAs */
  sentence:
    'We review applications manually and aim to reply with an honest fit assessment within about one week — not an automated approval.',
  /** Compact clause for embedding in longer copy */
  clause: 'aim to reply within about one week',
} as const;

export const PILOT_FIT_STRONG = [
  'Philanthropy / foundations: board or grant-committee deliberation (typically 5–8 principals; hard ceiling 12)',
  'Peacebuilding / mediation: facilitator-led internal or cross-party rooms (recommended 4–8 parties; hard ceiling 12)',
  'HR / compliance / ombuds: inquiry or fact-finding rooms (typically 4–7 contributors + facilitator; hard ceiling 12)',
  'Need for a private anchored decision memo — public ledger optional',
  'High attribution sensitivity — parties need a protected written room',
  'Willingness to operate within documented security boundaries (app-layer encryption; operator-readable keys today)',
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
  pilotBody: INTAKE_REVIEW_TIMING.sentence,
  /** Route-scoped closes — same button, different reason to act. */
  closeHowItWorks:
    'If Configure → Release fits your matter class, request a scoped pilot evaluation — process walkthrough and security review, not open signup.',
  closeSecurity:
    'For diligence, security review, or partnership exploration before a formal application.',
  closeUseCases:
    'If one of these tracks matches your matter, request a private pilot briefing. Manual review. Invite-only.',
  closeAbout:
    'Early pilots are invite-only. Tell us the matter class and facilitation context — we respond with fit, not automation.',
  closeFaq: `Still evaluating fit? Submit a pilot intake — we ${INTAKE_REVIEW_TIMING.clause} with scope and honesty.`,
  closeContact:
    'Prefer a conversation first? After briefing, most partners continue through pilot intake for role-scoped access.',
  closeLedger:
    'Seen how an approved outcome looks in the archive? Request a pilot when you are ready to run the room that produces one.',
  closeBriefings:
    'Need deck access for diligence? Request briefing access — materials stay gated until there is a clear review reason.',
  closeRoadmap:
    'If the launch plan and pilot profile match your matter class, request a scoped pilot evaluation — manual review, not open signup.',
  closePricing: `Pricing is invite-only and scoped with each partner. Start with pilot intake or a briefing — we ${INTAKE_REVIEW_TIMING.clause} with fit and commercial posture.`,
  closePipeline:
    'No live pilots yet. If you are evaluating partnership or diligence fit, request intake or a briefing — we publish pipeline numbers only when sourced.',
  /** Honest status — never invent organisation counts. */
  pilotStatusLine: 'Invite-only · scoped private pilots · manual fit review',
  /** Shorter status for pages that already state fit-review elsewhere. */
  pilotStatusLineShort: 'Invite-only · scoped private pilots',
  pilotValueLine:
    'For foundations, NGOs, boards, and HR/compliance teams running private deliberation — not open signup.',
  briefingHeadline: 'Request briefing',
  briefingBody:
    'For diligence conversations, security review, or partnership exploration with facilitation teams before a formal application.',
} as const;

/**
 * Capabilities that ship today — aligned with How it Works / Security.
 * Do not add planned items here; keep the live-vs-planned split on /security.
 */
export const READINESS_LIVE_TODAY = [
  {
    title: 'Private facilitator-governed rooms',
    body: 'Invite-only written sessions with staged facilitation, capacity limits, and pacing controls. Dialogue stays inside the room.',
  },
  {
    title: 'Facilitator-gated release',
    body: 'Nothing leaves as a public or anchored record without designated approvals and an explicit facilitator release action.',
  },
  {
    title: 'SHA-256 integrity anchor',
    body: 'Released text is hashed and stored with the record. Anyone holding the approved wording can recompute the anchor.',
  },
  {
    title: 'Documented security limits',
    body: 'Clear operator and encryption bounds for diligence — full detail on Security and in the threat model.',
  },
] as const;

/**
 * Ideal first-pilot profiles — org shape and pain only; no named logos or customers.
 * Primary tracks mirror Use Cases; adjacent rows are secondary expansion contexts.
 */
export const TARGET_PILOT_PROFILES = [
  {
    tier: 'primary' as const,
    sector: 'Philanthropy & foundations',
    orgSize: 'Program or board teams (typically small deliberation circles)',
    pain: 'Contested funding or governance decisions where email and chat become the discoverable story.',
  },
  {
    tier: 'primary' as const,
    sector: 'Peacebuilding & mediation',
    orgSize: 'Facilitator-led cohorts of roughly 4–8 parties (hard ceiling 12)',
    pain: 'Attribution-sensitive deliberation that still needs a citable approved instrument — same private-room / release-gate model as other tracks.',
  },
  {
    tier: 'primary' as const,
    sector: 'HR, compliance & ombuds',
    orgSize: 'Institutional inquiry teams with a designated facilitator',
    pain: 'Fact-finding without a sprawling transcript that invites retaliation or oversharing.',
  },
  {
    tier: 'adjacent' as const,
    sector: 'NGOs & civil society',
    orgSize: 'Advocacy or partner-decision teams under leak risk',
    pain: 'Sensitive internal deliberation without putting staff or community members at risk if notes escape.',
  },
  {
    tier: 'adjacent' as const,
    sector: 'Corporations & executive teams',
    orgSize: 'Board / C-suite conflict under confidentiality',
    pain: 'High-stakes disputes where CC chains create liability about what was decided.',
  },
] as const;

/** Go-to-market stages — hopeful plan language; status banner on /roadmap carries honesty once. */
export const LAUNCH_PLAN_STAGES = [
  {
    id: 'now',
    label: 'Now',
    title: 'Invite-only access open',
    body: `Manual fit review is open. We assess matter class and facilitation context before granting scoped access — we ${INTAKE_REVIEW_TIMING.clause}.`,
  },
  {
    id: 'next-90',
    label: 'Next 90 days',
    title: 'First pilot cohort',
    body: 'We hope to begin a small first cohort of facilitator-led private pilots. Timing depends on partner fit and readiness.',
  },
  {
    id: 'expand',
    label: '6–12 months',
    title: 'Sector expansion',
    body: 'Looking ahead, we plan to grow beyond the first matter classes into adjacent NGO and institutional contexts once early pilots prove operational fit.',
  },
] as const;

/**
 * Founder first-person note for About (/about#who) and Roadmap.
 * Honest pre-pilot posture — no invented biography or traction.
 */
export const FOUNDER_NOTE =
  'I built SquadRidge for situations where conflict and sensitive conversations can’t be handled casually, especially when identities are fragile and the stakes are personal. A facilitator gathers a group of participants, each representing a different sector or perspective within the topic, to create a structured conversation that encourages balance, understanding, and de-escalation. SquadRidge gives people a careful, anonymous way to navigate hard issues across companies, universities, institutions, and community settings. We’re pre-pilot and moving intentionally, because this kind of work only matters if people trust it.';

export function isFounderNotePlaceholder(note: string = FOUNDER_NOTE): boolean {
  return !note.trim() || note.includes('{{FOUNDER_NOTE}}');
}

/** Pricing tiers — no invented dollar amounts. Validate with partners before publishing numbers. */
export const PRICING_TIERS = [
  {
    id: 'pilot',
    name: 'Pilot',
    posture: 'Time-boxed · low or no cost · manual review',
    body: 'Scoped private pilots for facilitators evaluating fit. Access is invite-only after human review — not self-serve signup.',
  },
  {
    id: 'team',
    name: 'Team / Institutional',
    posture: 'Scoped with each partner',
    body: 'For organisations running recurring deliberation rooms under institutional governance. Commercial terms are discussed in briefing — not published as list prices today.',
  },
  {
    id: 'enterprise',
    name: 'Enterprise / Government',
    posture: 'Custom',
    body: 'Custom scope for larger institutions, multi-team deployments, or government contexts. Diligence, security review, and commercial structure are partner-specific.',
  },
] as const;

/**
 * Pipeline metrics for /pipeline.
 * Keep `{{PLACEHOLDER}}` tokens (or empty) until real, sourced figures exist.
 * The page renders unpublished values as "—" / "Not published yet" — never invent counts.
 */
export const PIPELINE_METRICS = {
  /** {{ACTIVE_CONVERSATIONS}} — diligence or partnership conversations in flight */
  activeConversations: '{{ACTIVE_CONVERSATIONS}}',
  /** {{LOI_COUNT}} — signed or draft LOIs; publish only with citation */
  loiCount: '{{LOI_COUNT}}',
  /** {{WAITLIST_SIZE}} — waitlist or interest list size; publish only when accurate */
  waitlistSize: '{{WAITLIST_SIZE}}',
  /** Live pilots — hard-coded honesty until the first real pilot is live */
  livePilots: '0',
} as const;

export type PipelineMetricKey = keyof typeof PIPELINE_METRICS;

/** True when a metric still holds an unfilled `{{TOKEN}}` or empty string. */
export function isPipelineMetricUnpublished(raw: string): boolean {
  const trimmed = raw.trim();
  return !trimmed || /^\{\{[A-Z0-9_]+\}\}$/.test(trimmed);
}

export function formatPipelineMetric(raw: string): {
  display: string;
  unpublished: boolean;
} {
  if (isPipelineMetricUnpublished(raw)) {
    return { display: '—', unpublished: true };
  }
  return { display: raw.trim(), unpublished: false };
}

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
