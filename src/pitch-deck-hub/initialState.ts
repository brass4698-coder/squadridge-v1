import type {
  ContentClaim,
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
    status: 'external_ready',
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
    status: 'external_ready',
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
    status: 'external_ready',
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
    id: 'conflict-prevention-thesis',
    name: 'Conflict Prevention Thesis',
    audience: 'policy_government',
    narrativeEmphasis:
      'Institutional: detection/intervention/measurement pillars, honest shipped-vs-roadmap split, less financial density than investor decks.',
    purpose:
      'UN-adjacent and peacebuilding partners: early-warning posture, Conflict Severity Index as methodology (not a shipped public feed), rapid triage, and evidence discipline.',
    status: 'draft',
    lastUpdatedISO: new Date().toISOString(),
    confidence: 'assumption_based',
    slideCount: 10,
    owner: 'Founder',
    sectionsOutline: [
      'Title: conflict prevention infrastructure',
      'Problem: escalation and coordination under pressure',
      'Three pillars: detect · intervene · measure',
      'What ships today vs roadmap (CSI, rapid response)',
      'Trust, threat model, operator visibility',
      'Pilot and partner operating model',
      'Evidence and evaluation (input required)',
      'Deployment and governance constraints',
      'Ask: co-design pilots + validation',
      'Appendix: technical + security pointers',
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
    status: 'external_ready',
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
    status: 'external_ready',
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
    'SquadRidge is a pilot-stage platform for verified access, facilitator-led dialogue, and bounded cross-border cohorts where institutions need more trust structure than generic chat or meeting tools provide.',
  conflictPreventionThesis:
    'Long-term strategic lens: prevention-minded infrastructure for timely, structured contact across conflict lines. Shipped today: verified access, matching, sessions, moderation, ledger-style outputs where enabled, and a moderator-facing CSI read surface. Not shipped today: population-scale listening, automated CSI ingestion, public signal feeds, guaranteed rapid-response SLAs, or validated impact claims. Every external narrative must separate current product from roadmap and methodology work.',
  oneLine:
    'Pilot-stage trust and dialogue infrastructure: verified access, facilitator-led cohorts, and honest security boundaries.',
  threeLine:
    'SquadRidge helps institutions run structured, sensitive dialogue programs with verified access, bounded cohorts, moderation, and durable outputs. The current release is strongest in facilitator-led pilots and technical diligence: the repo already shows product surface, threat-model honesty, and operating materials. Broader early-warning infrastructure, CSI automation, and strong causal impact claims remain roadmap until separately demonstrated.',
  mission:
    'Help institutions run safer, more accountable dialogue programs before sensitive conversations collapse into silence, drift, or unmanaged escalation—starting with bounded pilots and explicit operator-visible boundaries where the current release requires them.',
  problemStatement:
    'In sensitive dialogue settings, public identity can silence participants while unverified anonymity can weaken credibility, moderation leverage, and downstream usability. Institutions need a middle path: enough verification to support accountable process, enough pseudonymity to reduce unnecessary exposure, and enough structure to produce usable outcomes.',
  solutionStatement:
    'SquadRidge combines verified access, small-group matching, facilitator-led sessions, moderation, and reportable outputs where enabled. It is best positioned today as an advanced MVP / pilot foundation for bounded institutional cohorts—not as mass-market social software or a fully operator-blind privacy product.',
  detectionMechanism:
    'Pillar — Detection: at pilot scale, detection means structured intake, verification state, queue and cohort patterns, moderator observations, and the current moderator-only CSI read surface. It does not mean population-scale real-time listening or public conflict feeds in the shipped product.',
  interventionProtocol:
    'Pillar — Intervention: intervention in the current release means facilitator-led routing, moderation support, incident handling, and partner-defined escalation paths. Timing depends on pilot design and human staffing; do not imply an unconditional rapid-response SLA.',
  impactMeasurement:
    'Pillar — Measurement: the current diligence-safe metrics are verification completion, time to match, session completion, repeat participation, incidents or moderator interventions, and facilitator feedback. Stronger peace-impact claims require external methodology, pre-registered evaluation, and evidence beyond the repo.',
  whyNow:
    'Institutions are under more pressure to explain identity, safety, and governance in digital programs, while privacy-preserving verification is finally practical enough to ship. The opportunity is not hype about omniscient early warning; it is serious program infrastructure with documented tradeoffs.',
  trustModel:
    'Participants use verified or verification-aware accounts; message payloads are encrypted before storage; squad-level keys govern in-product access. Current message confidentiality is operator-readable for moderators and privileged operator paths, so the product should not be described as Signal-grade, operator-proof, or fully anonymous.',
  coreDifferentiators:
    'The differentiation is operational: facilitator-governed cohorts, verification integrated into a real product flow, security honesty that survives diligence, and partner-ready artifacts such as runbooks, one-pagers, and data-room materials. The moat is not a slogan about global early warning.',
  proofPoints:
    'Anchor claims to CURRENT_STATUS.md, DILIGENCE_OVERVIEW.md, the threat model, pilot runbooks, partner one-pager, and demo flows such as the guided tour, /admin/health, and /admin/csi for rostered moderators. If a claim is not in those materials, label it roadmap, scenario, or internal only.',
  toneRules:
    'Calm, specific, and review-ready. Every deck should distinguish shipped product, pilot-ready operations, scenario-model assumptions, and roadmap items. Prefer named documents and bounded metrics over adjectives. When in doubt, tighten the claim instead of polishing the language.',
  bannedPhrases:
    'Avoid empty hype and banned overclaims: revolutionizing, game-changing, world-class, AI-powered without a shown subsystem, best-in-class without evidence, full anonymity, operator-proof encryption, server-blind E2EE for the current release, proven peace impact at scale, global early-warning infrastructure, public CSI feeds as shipped, lives saved without methodology, or named traction that is not explicitly on record.',
};

export const INITIAL_EVIDENCE: EvidenceItem[] = [
  {
    id: 'ev-security-page',
    title: 'Public security disclosure (current release)',
    category: 'security_note',
    summary:
      'Authoritative copy on encryption scope, squad keys, operator visibility, and current messaging limits.',
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
    title: 'Pilot metric template',
    category: 'pilot_assumption',
    summary:
      'Use verification completion, time to match, session completion, repeat participation, incident counts, and facilitator feedback before claiming broader impact.',
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
      'Use sourced budget categories or named partner pipeline notes; omit TAM slides entirely if you cannot cite them cleanly.',
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
    source: 'Pitch Deck Hub financial appendix — scenario model',
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
    'Pilot readiness pack, facilitator playbook, and first signed pilot or design-partner agreement.',
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
  version: 3,
  decks: INITIAL_DECKS,
  messaging: INITIAL_MESSAGING,
  evidence: INITIAL_EVIDENCE,
  claims: INITIAL_CLAIMS,
  assumptions: DEFAULT_ASSUMPTIONS,
  activeScenario: 'base',
  readiness: buildInitialReadiness(INITIAL_DECKS),
};
