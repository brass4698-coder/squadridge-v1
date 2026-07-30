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
      'Security language alignment',
      'Readiness comparison',
      'Messaging principle',
      'Contact & next step',
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
      'Title & positioning',
      'Problem framing (conflict prevention)',
      'Structured dialogue model',
      'Records, ledgers, and transparency boundaries',
      'Security & operator visibility (current release)',
      'Ethics & facilitation',
      'Evidence & evaluation (input required)',
      'Deployment constraints',
      'Governance posture',
      'Risk & escalation',
      'Next steps',
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
      'MENDguild wedge',
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
    'MENDguild detects and prevents violence by listening to communities across conflict lines in real time. When tensions escalate, we activate rapid de-escalation to intervene before violence becomes inevitable.',
  conflictPreventionThesis:
    'Strategic direction: infrastructure for timely, structured contact and de-escalation across conflict lines—not generic social connection. Shipped today: verified access, small squads, facilitator-led session surfaces, moderation, and ledger-style public outcomes where appropriate. Not yet product-complete: population-scale “real-time” listening, automated Conflict Severity Index (CSI) dashboards, or guaranteed sub-hour rapid response—those are pilot design and roadmap under explicit methodology and privacy review. External copy must pair bold lines with cohort scope and the security disclosure.',
  oneLine:
    'Conflict prevention and early-warning posture: verified squads and facilitator-led de-escalation when tensions rise—bounded pilots, honest security limits.',
  threeLine:
    'MENDguild aims to spot escalation early and move groups into structured, verified-anonymous dialogue before violence hardens—built on small squads, facilitator discipline, and citable outputs. Today’s product delivers verification, matching, rooms, moderation, and accountability surfaces; broader listening networks, CSI-style signal products, and rapid-response SLOs are targets for partners to define with us—not implied as global live infrastructure without evidence.',
  mission:
    'Make timely, trustworthy de-escalation the default when communities face rising tension: conflict prevention is the highest-ROI investment in peace at the margin—delivered first through institution-led pilots with clear ethics, metrics, and operator-visible boundaries where the current release requires them.',
  problemStatement:
    'When tensions spike across lines, the gap is not “more chat”—it is trusted, fast-enough structure before threats become kinetic. Unverified rooms lack credibility; fully public identity is unsafe. Escalation often wins by default when there is no accountable, human-governed path to a bounded, timely conversation.',
  solutionStatement:
    'Verified pseudonymous access, small squads, facilitator-led sessions, and durable outcomes (including ledger-style public proposals) so cohorts can de-escalate with a record institutions can use—scoped explicitly to what we ship, with roadmap concepts labeled as such.',
  detectionMechanism:
    'Pillar — Detection: We detect when conflict is about to turn violent by listening to grassroots voices across conflict lines. Caveat (defensible): at pilot scale this means structured intake, cohort patterns, and facilitator context—not unqualified claims of real-time, jurisdiction-wide open-web listening. A future Conflict Severity Index and broader signal fusion are roadmap; see docs/product/csi-spec.md (draft) and do not present as live product.',
  interventionProtocol:
    'Pillar — Intervention: When we detect escalation, we trigger rapid de-escalation dialogue within hours. Caveat: “within hours” is a pilot/response-design target with facilitators, not a guaranteed global SLA. Shipped: structured room flows, matching, and facilitation hooks—activation speed depends on program design and human availability.',
  impactMeasurement:
    'Pillar — Measurement: We measure lives saved with third-party validation. Caveat: that sentence describes our evaluation discipline and goal, not a claim of realized, audited “lives saved at scale” today. We pre-register cohort metrics where possible, separate pilot evidence from production assertions, and require arm’s-length review before strong causal claims—see docs/business/impact-metrics.md for approach.',
  whyNow:
    'Cross-border and civic stress is rising; institutions need both prevention-minded posture and product realism—structured contact at the right moment, with transparent limits, not hype about omniscient early warning or operator-proof encryption.',
  trustModel:
    'Participants use verified pseudonymous accounts; message payloads are encrypted for storage; squad-level keys gate content in-product. Current message confidentiality is operator-readable for safety and policy reasons—this is not Signal-grade, server-blind E2EE. Describe exactly as in /security and the threat model; do not use “operator-proof” or “full anonymity” for the dialogue surface.',
  coreDifferentiators:
    'Not broadcast social or generic DMs. Facilitator-governed squads; cross-line relevance; citable outcomes. Conflict prevention is the highest-ROI investment in peace when dollars target escalation windows rather than only post-crisis spend. Differentiation is in governance, verification discipline, and evidence hygiene—not in claiming a shipped global early-warning network or CSI as live infrastructure.',
  proofPoints:
    'Honest references: product flows (e.g. Match, session, ledger where enabled), Security disclosure at /security, CURRENT_STATUS.md for shipped vs not shipped. For pilots: name only what is on record. Roadmap: CSI, rapid response, and broad listening—design and partner alignment, not current delivery until listed under “Shipped” in CURRENT_STATUS.md.',
  toneRules:
    'Calm, institutional, precise. Every slide: say what is shipped, pilot-bounded, or roadmap/scenario. Never upgrade roadmap to production fact. Cite security limits when discussing confidentiality. Prefer pre-registered metrics and “hypothesis, not claim” for impact. Pair strategic ambition with explicit cohort scope and ethics.',
  bannedPhrases:
    'Avoid empty hype: revolutionizing, game-changing, world-class (unqualified), disrupting, AI-powered (unless the specific subsystem is shown), best-in-class without evidence, invented pilot logos, user counts, or ARR. Overclaim / accuracy bans (aligned with CURRENT_STATUS.md): "full anonymity," "operator-proof encryption" or "server-blind E2EE" as a description of the current release, "proven peace impact at scale," unqualified "global early-warning" or "CSI" as shipped, "lives saved" with implied validation without a cited methodology, "real time" for population-scale community listening as if live today, Signal-grade or comparable implied against the current operator-readable model. Do not assert lives saved, detection at scale, or sub-hour response as realized outcomes without third-party or pre-registered study language.',
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
