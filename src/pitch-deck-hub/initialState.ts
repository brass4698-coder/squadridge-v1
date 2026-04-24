import type {
  ContentClaim,
  DataIntegrityLabel,
  DeckReadiness,
  EvidenceItem,
  FinancialAssumptions,
  PitchDeck,
  PitchDeckHubState,
} from './types';

const STANDARD_INVESTOR_SECTIONS = [
  'Problem',
  'Why now',
  'Product',
  'How it works',
  'Market',
  'Business model',
  'Go-to-market',
  'Moat',
  'Competition',
  'Financial projections (scenario model)',
  'Use of funds',
  'Team',
  'Ask',
] as const;

function placeholderLabel(kind: DataIntegrityLabel): string {
  switch (kind) {
    case 'scenario_model':
      return 'Scenario model — not historical actuals.';
    case 'assumption':
      return 'Assumption — replace with sourced inputs.';
    case 'input_required':
      return 'Input required before external use.';
    case 'pending_validation':
      return 'Pending validation.';
    case 'illustrative_only':
      return 'Illustrative only — not for external use.';
    default:
      return '';
  }
}

/** Prefilled structure: product-accurate framing + explicitly labeled gaps. */
export const INITIAL_DECKS: PitchDeck[] = [
  {
    id: 'core-investor',
    name: 'Core Investor Deck',
    audience: 'investors',
    narrativeEmphasis:
      'Heavier market, model, and ask slides — same layout system as other decks; narrative tuned to diligence and use of funds.',
    purpose:
      'Standard fundraising narrative for verified-anonymous strategy rooms, facilitator-led cohorts, and ledger-grade outcomes.',
    status: 'draft',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'assumption_based',
    slideCount: 13,
    owner: 'Founder',
    sectionsOutline: [...STANDARD_INVESTOR_SECTIONS],
  },
  {
    id: 'company-overview',
    name: 'Company Overview',
    audience: 'investors',
    narrativeEmphasis:
      'High-level who / what / why before deep diligence — lighter than the full investor deck; same visual system.',
    purpose:
      'A concise narrative arc: mission, problem structure, product shape, proof surfaces to point to honestly, and how the team frames risk.',
    status: 'draft',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'mixed',
    slideCount: 10,
    owner: 'Founder',
    sectionsOutline: [
      'Title & positioning',
      'Mission & thesis',
      'Problem structure',
      'Solution shape',
      'Who it serves',
      'What exists today (honest)',
      'Differentiation',
      'Operating principles',
      'Near-term focus',
      'Contact & next step',
    ],
  },
  {
    id: 'pilot-partner',
    name: 'Pilot / Partner Deck',
    audience: 'pilots_partners',
    narrativeEmphasis:
      'More operations, cadence, and risk-control slides; lighter market/fundraising density — same components, partner-first story.',
    purpose:
      'Workflow, trust boundaries, facilitator-led operations, risk controls, and practical implementation for mission-aligned pilots.',
    status: 'internal',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'mixed',
    slideCount: 12,
    owner: 'Founder',
    sectionsOutline: [
      'Partner fit',
      'Session flow (Match → room → ledger)',
      'Trust model & anonymity boundaries',
      'Facilitator-led cohort pattern',
      'Operational risks & mitigations',
      'Pilot cadence & success criteria (to define with partner)',
      'Sample outputs',
      'Implementation checklist',
    ],
  },
  {
    id: 'problem-solution',
    name: 'Problem + Solution Deep Dive',
    audience: 'investors',
    narrativeEmphasis:
      'Problem mechanics and failure modes first; solution mapped to product primitives — minimal market or fundraising content.',
    purpose:
      'Explains why public identity and pure anonymity both break coordination, and how verified pseudonymous strategy rooms answer that gap.',
    status: 'draft',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'assumption_based',
    slideCount: 8,
    owner: 'Founder',
    sectionsOutline: [
      'Framing',
      'Failure mode: public identity',
      'Failure mode: unverified anonymity',
      'What decision-makers need',
      'Solution primitives',
      'Trust boundaries',
      'Outputs & artifacts',
      'What we do not claim',
    ],
  },
  {
    id: 'product-demo',
    name: 'Product / Demo Walkthrough',
    audience: 'facilitators_demos',
    narrativeEmphasis:
      'Step-by-step flows, UI placeholders, and facilitator-safe language — replaces separate facilitator-only stub variants.',
    purpose:
      'Walkthrough: intent, match routing, room posture, demo session surfaces, ledger-style outputs — captions note UI under active development.',
    status: 'draft',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'mixed',
    slideCount: 8,
    owner: 'Founder',
    sectionsOutline: [
      'Audience',
      'Intent capture',
      'Match routing',
      'Room experience',
      'Facilitation hooks',
      'Ledger / proposals',
      'Demo script',
      'What to cite externally',
    ],
  },
  {
    id: 'policy-government',
    name: 'Government / Policy / Peacebuilding Deck',
    audience: 'policy_government',
    narrativeEmphasis:
      'Emphasis on governance, records, ethics, and evaluation framing — restrained slide density; same brand surfaces, policy-appropriate tone.',
    purpose:
      'Structured dialogue, de-escalation posture, record-keeping boundaries, security model, and measurable outcomes — without overclaiming certifications.',
    status: 'needs_review',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'assumption_based',
    slideCount: 11,
    owner: 'Founder',
    sectionsOutline: [
      'Problem framing (conflict prevention)',
      'Structured dialogue model',
      'Records, ledgers, and transparency boundaries',
      'Security & operator visibility (current release)',
      'Ethics & facilitation',
      'Evidence & evaluation (input required)',
      'Deployment constraints',
    ],
  },
  {
    id: 'market-competition',
    name: 'Market + Competition',
    audience: 'investors',
    narrativeEmphasis:
      'Segments and positioning with explicit illustrative labeling on sizing; competitor matrix using product facts, not vanity scores.',
    purpose:
      'TAM/SAM/SOM as scenario/illustrative ranges, buyer segments, and honest comparison vs generic chat, social broadcast, and pure anon tools.',
    status: 'draft',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'assumption_based',
    slideCount: 8,
    owner: 'Founder',
    sectionsOutline: [
      'What we are optimizing for',
      'Buyer / user segments (illustrative)',
      'TAM / SAM / SOM (scenario model)',
      'Landscape map',
      'Competitor comparison',
      'SquadRidge wedge',
      'Risks to the thesis',
      'What diligence should validate',
    ],
  },
  {
    id: 'business-pricing',
    name: 'Business Model + Pricing',
    audience: 'investors',
    narrativeEmphasis:
      'Pilot economics and seat-month logic aligned to the scenario model in the hub — not presented as realized revenue.',
    purpose:
      'How pilots could be packaged, pricing posture, cohort billing patterns, and linkage to financial appendix assumptions.',
    status: 'internal',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'assumption_based',
    slideCount: 8,
    owner: 'Founder',
    sectionsOutline: [
      'Value chain',
      'Pilot packaging',
      'Seat / room-month framing',
      'Illustrative unit economics',
      'Services vs software',
      'Expansion paths (target)',
      'Alignment to scenario model',
      'Risks & open questions',
    ],
  },
  {
    id: 'traction-roadmap',
    name: 'Traction + Roadmap',
    audience: 'investors',
    narrativeEmphasis:
      'Strict split between Current (2026) signals and Target (12–24 months) milestones — no invented logos or revenue.',
    purpose:
      'Honest stage framing, waitlist / pilot language, product milestones, and a roadmap that mirrors shipped vs planned separation.',
    status: 'draft',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'mixed',
    slideCount: 8,
    owner: 'Founder',
    sectionsOutline: [
      'Stage',
      'Current (2026): product',
      'Current (2026): GTM signals',
      'What we measure next',
      'Roadmap — near term',
      'Roadmap — mid term',
      'Dependencies & risks',
      'How we will report progress',
    ],
  },
  {
    id: 'gtm-distribution',
    name: 'Go-To-Market + Distribution',
    audience: 'pilots_partners',
    narrativeEmphasis:
      'Channels, partner motion, and facilitator-led adoption — conservative about scale; playbook over splash.',
    purpose:
      'Distribution thesis: facilitator networks, mission-aligned orgs, technical eval channels, and what “landing a pilot” means operationally.',
    status: 'internal',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'assumption_based',
    slideCount: 8,
    owner: 'Founder',
    sectionsOutline: [
      'Who carries the story',
      'Channels',
      'Pilot acquisition loop',
      'Enablement',
      'Messaging assets',
      'Measurement',
      'Constraints',
      'Next experiments',
    ],
  },
  {
    id: 'team-advisors',
    name: 'Team + Advisors',
    audience: 'investors',
    narrativeEmphasis:
      'Roles and gaps called out explicitly; advisors listed generically if names are not approved for external use.',
    purpose:
      'Founder and team structure, hiring plan shape, advisor involvement model — placeholder-friendly, no fabricated pedigrees.',
    status: 'internal',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'mixed',
    slideCount: 7,
    owner: 'Founder',
    sectionsOutline: [
      'Why this team',
      'Core roles',
      'Hiring plan (shape)',
      'Advisors',
      'Gaps we are filling',
      'Culture & operating norms',
      'Contact',
    ],
  },
  {
    id: 'technical-security',
    name: 'Technical / Security Deck',
    audience: 'technical_diligence',
    narrativeEmphasis:
      'Highest depth on architecture, limits, and threat-relevant facts; minimal growth narrative — identical visual system, engineering-forward weighting.',
    purpose:
      'Technical diligence: identity, verification posture, ciphertext storage, squad keys, moderator visibility, gaps vs roadmap — aligned to /security disclosure.',
    status: 'internal',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'verified',
    slideCount: 12,
    owner: 'Founder',
    sectionsOutline: [
      'Scope of this deck',
      'Logical architecture',
      'Identity & verification',
      'Data paths (transit & rest)',
      'Squad keys & access control',
      'Operator visibility',
      'Moderation & legal process',
      'Ledger / proposals handling',
      'Logging & retention (posture)',
      'Known limitations',
      'Roadmap (engineering)',
      'References',
    ],
  },
  {
    id: 'financial-appendix',
    name: 'Financial Appendix Deck',
    audience: 'financial_appendix',
    narrativeEmphasis:
      'Maximum table and assumption density; scenario labeling and rollups drive the deck — same typography and components, finance-first emphasis.',
    purpose:
      'Bottom-up founder planning model: assumptions, pricing logic, cost stack, scenarios, sensitivity — all labeled as modeled, not actuals.',
    status: 'internal',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'assumption_based',
    slideCount: 12,
    owner: 'Founder',
    sectionsOutline: [
      'Model purpose & limitations',
      'Assumptions table',
      'Pricing logic',
      'Seat / pilot ramp',
      'Cost structure',
      'Headcount plan',
      'Monthly bridge (illustrative)',
      'Annual view',
      'Scenarios (base / conservative / aggressive)',
      'Sensitivity',
      'Runway & capital needs',
      'Use of funds',
    ],
  },
  {
    id: 'appendix-faq',
    name: 'Appendix + FAQ',
    audience: 'financial_appendix',
    narrativeEmphasis:
      'Operational FAQ, diligence shortcuts, and pointers to /security and the financial hub — not a substitute for counsel.',
    purpose:
      'Recurring questions on anonymity, encryption scope, roadmaps, pilots, and how to describe limits without overclaiming.',
    status: 'internal',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'mixed',
    slideCount: 8,
    owner: 'Founder',
    sectionsOutline: [
      'How to read these materials',
      'Anonymity & identity',
      'Encryption & operators',
      'Product surfaces',
      'Pilots & success criteria',
      'Financial model linkage',
      'Legal / export compliance posture',
      'Contact',
    ],
  },
];

export const INITIAL_MESSAGING = {
  masterPositioning:
    'SquadRidge is a verified-anonymous platform for small-group, facilitator-led strategy rooms — structured dialogue, proposal flows, and ledger-grade outputs for sensitive cross-border contexts.',
  oneLine:
    'Verified-anonymous strategy rooms for sensitive, facilitator-led dialogue — with citable room outputs.',
  threeLine:
    'In constrained group settings, verified pseudonymous accounts anchor trust without real-name identity in the room. Facilitator-led cohorts use structured dialogue, Match routing, and ledger-style outputs suitable for briefings — with explicit security boundaries in the current release.',
  mission:
    'Reduce escalatory misunderstanding in constrained dialogue settings by combining verification discipline, clear anonymity boundaries, and durable records where appropriate.',
  problemStatement:
    'Sensitive coordination often fails when identity is either fully public (unsafe) or fully unverified (not credible). Cross-border and pre-conflict settings need bounded trust, structured facilitation, and outputs stakeholders can cite without exposing participants.',
  solutionStatement:
    'Strategy rooms pair verification discipline with pseudonymity in-session, facilitator-led structure, and LedgerPage-style artifacts so groups can converge on testable proposals and documented outcomes.',
  whyNow:
    'Geopolitical and civic stress tests are increasing demand for small-group dialogue infrastructure that is technically serious and operationally sober — not consumer chat rebranded as “peace tech.”',
  trustModel:
    'Participants use verified pseudonymous accounts; message payloads are encrypted for storage; squad-level keys gate content in-product. Operator visibility matches the current disclosure — do not describe as server-blind E2EE unless/until implemented.',
  coreDifferentiators:
    'Facilitator-led strategy rooms (not broadcast social); proposal and ledger outputs; Match/intent flows; explicit security posture vs roadmap; peacebuilding-adjacent framing without hype.',
  proofPoints:
    'Product surfaces to reference honestly: Match flow, DemoSessionPage, LedgerPage sample output (`/ledger` demo proposal where enabled), Security disclosure at `/security`. Do not imply pilots, revenue, or certifications not on record.',
  toneRules:
    'Institutional, calm, precise. Separate “shipping today” from “roadmap.” Prefer “scenario model” over implied actuals. Name limits (ZK path, E2EE) exactly as implemented.',
  bannedPhrases:
    'Avoid: revolutionizing, game-changing, world-class (unqualified), disrupting, AI-powered (unless the specific subsystem is shown), best-in-class without evidence. Avoid invented pilot logos, user counts, or ARR.',
};

export const INITIAL_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-security-page',
    title: 'Public security disclosure (current release)',
    category: 'security_note',
    summary: 'Authoritative copy on encryption scope, squad keys, and operator visibility.',
    sourceUrl: '/security',
    confidence: 'verified',
    approvedForExternal: true,
    dataLabel: 'pending_validation',
    owner: 'Founder',
  },
  {
    id: 'ev-sample-ledger',
    title: 'Sample ledger output (when demo proposal enabled)',
    category: 'screenshot',
    summary: 'Illustrates proposal/ledger presentation — not evidence of adoption.',
    sourceUrl: '/ledger',
    confidence: 'verified',
    approvedForExternal: true,
    dataLabel: 'illustrative_only',
    owner: 'Founder',
  },
  {
    id: 'ev-pilot-criteria-tbd',
    title: 'Pilot success criteria',
    category: 'pilot_assumption',
    summary: placeholderLabel('input_required'),
    confidence: 'assumption_based',
    approvedForExternal: false,
    dataLabel: 'input_required',
    owner: 'Founder',
  },
  {
    id: 'ev-tam-note',
    title: 'Market sizing',
    category: 'market_research',
    summary:
      'Any TAM/SAM figures must be sourced or explicitly labeled scenario model — not included here as fact.',
    confidence: 'assumption_based',
    approvedForExternal: false,
    dataLabel: 'scenario_model',
    owner: 'Founder',
  },
];

export const INITIAL_CLAIMS: ContentClaim[] = [
  {
    id: 'claim-encrypt-store',
    claim: 'Message payloads are encrypted before storage.',
    context: 'Security deck, technical diligence',
    source: 'Product security disclosure',
    confidence: 'verified',
    approvedForExternal: true,
    owner: 'Founder',
  },
  {
    id: 'claim-not-e2ee-server',
    claim: 'Per-user E2EE where the server never holds decryptable content is not current.',
    context: 'Technical diligence',
    source: 'Security disclosure',
    confidence: 'verified',
    approvedForExternal: true,
    owner: 'Founder',
  },
  {
    id: 'claim-raise-amount',
    claim: 'Fundraising ask in materials',
    context: 'Investor deck ask slide',
    source: 'Financial model — scenario',
    confidence: 'assumption_based',
    approvedForExternal: false,
    owner: 'Founder',
  },
];

export const DEFAULT_ASSUMPTIONS: FinancialAssumptions = {
  modelStartISO: '2026-03-01',
  monthlyHorizonMonths: 24,
  startingCashUsd: 750000,
  pricePerPilotSeatMonthUsd: 1200,
  targetPayingSeatsMonth12: 12,
  seatRampMonths: 12,
  headcountFteMonth0: 2,
  headcountFteMonth12: 5,
  headcountFteMonth24: 9,
  fullyLoadedCostPerFteAnnualUsd: 185000,
  monthlyInfrastructureUsd: 3500,
  monthlyLegalComplianceUsd: 8000,
  monthlySalesMarketingUsd: 6000,
  monthlyContractorsUsd: 12000,
  contingencyRate: 0.08,
  fundraisingAskUsd: 750000,
  milestoneFirstTranche:
    'Ship facilitator playbook + first paid pilot contract structure (input required).',
};

function defaultReadiness(deckId: string): DeckReadiness {
  return {
    deckId,
    items: [
      { id: 'r1', label: 'No unsupported claims in external variant', done: false },
      { id: 'r2', label: 'No fabricated metrics', done: false },
      { id: 'r3', label: 'Dates reviewed', done: false },
      { id: 'r4', label: 'Numbers sourced or labeled (assumption / scenario)', done: false },
      { id: 'r5', label: 'Roadmap vs current product language separated', done: false },
      { id: 'r6', label: 'Risk statements where needed', done: false },
      { id: 'r7', label: 'Audience-appropriate tone', done: false },
      { id: 'r8', label: 'Ask consistent with financial appendix', done: false },
      { id: 'r9', label: 'Financials tie to use of funds', done: false },
      { id: 'r10', label: 'Terminology aligned with messaging layer', done: false },
    ],
  };
}

export function buildInitialReadiness(decks: PitchDeck[]): DeckReadiness[] {
  return decks.map((d) => defaultReadiness(d.id));
}

export const INITIAL_STATE: PitchDeckHubState = {
  version: 2,
  decks: INITIAL_DECKS,
  messaging: INITIAL_MESSAGING,
  evidence: INITIAL_EVIDENCE,
  claims: INITIAL_CLAIMS,
  assumptions: DEFAULT_ASSUMPTIONS,
  activeScenario: 'base',
  readiness: buildInitialReadiness(INITIAL_DECKS),
};
