/**
 * Parallel manifest for static HTML decks in `public/pitch-deck-hub/`.
 * Rendering source-of-truth remains the `.html` files; manifests help outlines, diffs, and reviews.
 */
export type HubSlideLayout =
  | 'title'
  | 'body'
  | 'twoCol'
  | 'threeUp'
  | 'steps'
  | 'table'
  | 'timeline'
  | 'diagram'
  | 'metrics'
  | 'faq';

export interface HubSlide {
  id: string;
  title: string;
  eyebrow?: string;
  layout: HubSlideLayout;
  bullets?: string[];
  notes?: string;
  disclaimers?: string;
}

export interface PitchDeckSlideManifest {
  deckId: string;
  deckTitle: string;
  slides: HubSlide[];
}

function m(
  deckId: string,
  deckTitle: string,
  slides: Array<Pick<HubSlide, 'id' | 'title'> & Partial<Omit<HubSlide, 'id' | 'title'>>>,
): PitchDeckSlideManifest {
  return {
    deckId,
    deckTitle,
    slides: slides.map((s) => ({
      layout: 'body' as HubSlideLayout,
      ...s,
    })),
  };
}

export const coreInvestorManifest = m('core-investor', 'Core Investor Deck', [
  { id: 's1', title: 'Title', layout: 'title', eyebrow: 'Core investor deck' },
  { id: 's2', title: 'What the company is' },
  { id: 's3', title: 'Market gap — trust structure' },
  { id: 's4', title: 'Product in one glance' },
  { id: 's5', title: 'How it works' },
  { id: 's6', title: 'Market' },
  { id: 's7', title: 'Business model' },
  { id: 's8', title: 'Go-to-market' },
  { id: 's9', title: 'Competition' },
  { id: 's10', title: 'Financial outlook (scenario model)' },
  { id: 's11', title: 'Team' },
  { id: 's12', title: 'Use of funds & ask' },
  { id: 's13', title: 'Closing', layout: 'body' },
]);

export const companyOverviewManifest = m('company-overview', 'Company Overview', [
  { id: 's1', title: 'SquadRidge', layout: 'title', eyebrow: 'Company overview' },
  { id: 's2', title: 'Mission & thesis' },
  { id: 's3', title: 'Problem structure' },
  { id: 's4', title: 'Product shape' },
  { id: 's5', title: 'Who we serve' },
  { id: 's6', title: 'What exists today' },
  { id: 's7', title: 'Why this approach' },
  { id: 's8', title: 'Operating principles' },
  { id: 's9', title: 'Near-term focus' },
  { id: 's10', title: 'Next step', layout: 'body' },
]);

export const pilotPartnerManifest = m('pilot-partner', 'Pilot / Partner Deck', [
  { id: 's1', title: 'Title', layout: 'title' },
  { id: 's2', title: 'Who this deck is for' },
  { id: 's3', title: 'Match → room → ledger' },
  { id: 's4', title: 'Trust & anonymity boundaries' },
  { id: 's5', title: 'Operational risks & mitigations' },
  { id: 's6', title: 'Pilot cadence' },
  { id: 's7', title: 'Artifacts / sample outputs' },
  { id: 's8', title: 'Implementation checklist' },
  { id: 's9', title: 'Security language alignment' },
  { id: 's10', title: 'Readiness comparison' },
  { id: 's11', title: 'Messaging principle' },
  { id: 's12', title: 'Next step', layout: 'body' },
]);

export const problemSolutionManifest = m('problem-solution', 'Problem + Solution Deep Dive', [
  { id: 's1', title: 'Framing', layout: 'title' },
  { id: 's2', title: 'Failure mode: public identity' },
  { id: 's3', title: 'Failure mode: unverified anonymity' },
  { id: 's4', title: 'What decision-makers need' },
  { id: 's5', title: 'Solution primitives' },
  { id: 's6', title: 'Trust boundaries' },
  { id: 's7', title: 'Outputs & artifacts' },
  { id: 's8', title: 'What we do not claim' },
]);

export const productDemoManifest = m('product-demo', 'Product / Demo Walkthrough', [
  { id: 's1', title: 'Title', layout: 'title' },
  { id: 's2', title: 'Intent capture' },
  { id: 's3', title: 'Match routing' },
  { id: 's4', title: 'Room experience' },
  { id: 's5', title: 'Facilitation hooks' },
  { id: 's6', title: 'Ledger / proposals' },
  { id: 's7', title: 'Demo script' },
  { id: 's8', title: 'External citations' },
]);

export const policyGovernmentManifest = m(
  'policy-government',
  'Government / Policy / Peacebuilding',
  [
    { id: 's1', title: 'Title', layout: 'title' },
    { id: 's2', title: 'Problem framing' },
    { id: 's3', title: 'Structured dialogue model' },
    { id: 's4', title: 'Records & transparency' },
    { id: 's5', title: 'Security & operator visibility' },
    { id: 's6', title: 'Ethics & facilitation' },
    { id: 's7', title: 'Evidence & evaluation' },
    { id: 's8', title: 'Deployment constraints' },
    { id: 's9', title: 'Governance posture' },
    { id: 's10', title: 'Risk & escalation' },
    { id: 's11', title: 'Next steps' },
  ],
);

/** Static HTML: `public/pitch-deck-hub/conflict-prevention-thesis.html` — policy / prevention narrative with shipped-vs-roadmap split. */
export const conflictPreventionThesisManifest = m(
  'conflict-prevention-thesis',
  'Conflict Prevention Thesis',
  [
    {
      id: 's1',
      title: 'Conflict prevention thesis',
      layout: 'title',
      eyebrow: 'Policy · partners · early warning (design)',
    },
    { id: 's2', title: 'Escalation outruns coordination' },
    { id: 's3', title: 'Detect · Intervene · Measure' },
    { id: 's4', title: 'What ships today vs roadmap' },
    { id: 's5', title: 'Operator visibility is explicit' },
    { id: 's6', title: 'Partner and pilot model' },
    { id: 's7', title: 'Evaluation inputs required' },
    { id: 's8', title: 'Deployment and governance' },
    { id: 's9', title: 'Co-design pilots and validation' },
    { id: 's10', title: 'Technical and compliance pointers' },
  ],
);

export const marketCompetitionManifest = m('market-competition', 'Market + Competition', [
  { id: 's1', title: 'Title', layout: 'title' },
  { id: 's2', title: 'What we optimize for' },
  { id: 's3', title: 'Segments (illustrative)' },
  { id: 's4', title: 'TAM / SAM / SOM (scenario model)' },
  { id: 's5', title: 'Landscape' },
  { id: 's6', title: 'Competitor comparison' },
  { id: 's7', title: 'Wedge' },
  { id: 's8', title: 'Diligence questions' },
]);

export const businessPricingManifest = m('business-pricing', 'Business Model + Pricing', [
  { id: 's1', title: 'Title', layout: 'title' },
  { id: 's2', title: 'Value chain' },
  { id: 's3', title: 'Pilot packaging' },
  { id: 's4', title: 'Seat / room-month framing' },
  { id: 's5', title: 'Illustrative unit economics' },
  { id: 's6', title: 'Services vs software' },
  { id: 's7', title: 'Expansion (target)' },
  { id: 's8', title: 'Risks & model linkage' },
]);

export const tractionRoadmapManifest = m('traction-roadmap', 'Traction + Roadmap', [
  { id: 's1', title: 'Title', layout: 'title' },
  { id: 's2', title: 'Stage' },
  { id: 's3', title: 'Current (2026): product' },
  { id: 's4', title: 'Current (2026): GTM signals' },
  { id: 's5', title: 'What we measure next' },
  { id: 's6', title: 'Roadmap — near term' },
  { id: 's7', title: 'Roadmap — mid term' },
  { id: 's8', title: 'Dependencies & reporting' },
]);

export const gtmDistributionManifest = m('gtm-distribution', 'Go-To-Market + Distribution', [
  { id: 's1', title: 'Title', layout: 'title' },
  { id: 's2', title: 'Who carries the story' },
  { id: 's3', title: 'Channels' },
  { id: 's4', title: 'Pilot acquisition loop' },
  { id: 's5', title: 'Enablement' },
  { id: 's6', title: 'Messaging assets' },
  { id: 's7', title: 'Measurement' },
  { id: 's8', title: 'Next experiments' },
]);

export const teamAdvisorsManifest = m('team-advisors', 'Team + Advisors', [
  { id: 's1', title: 'Title', layout: 'title' },
  { id: 's2', title: 'Why this team' },
  { id: 's3', title: 'Core roles' },
  { id: 's4', title: 'Hiring plan' },
  { id: 's5', title: 'Advisors' },
  { id: 's6', title: 'Gaps' },
  { id: 's7', title: 'Contact' },
]);

export const technicalSecurityManifest = m('technical-security', 'Technical / Security Deck', [
  { id: 's1', title: 'Scope', layout: 'title', eyebrow: 'Technical / security' },
  { id: 's2', title: 'Logical architecture', layout: 'diagram' },
  { id: 's3', title: 'Identity & verification' },
  { id: 's4', title: 'Transit & storage' },
  { id: 's5', title: 'Squad keys & access' },
  { id: 's6', title: 'Operator visibility' },
  { id: 's7', title: 'Moderation & legal process' },
  { id: 's8', title: 'Ledger & proposals' },
  { id: 's9', title: 'Logging & retention posture' },
  { id: 's10', title: 'Known limitations' },
  { id: 's11', title: 'Roadmap (engineering)' },
  { id: 's12', title: 'References' },
]);

export const financialAppendixManifest = m('financial-appendix', 'Financial Appendix Deck', [
  { id: 's1', title: 'Model purpose', layout: 'title' },
  { id: 's2', title: 'Assumptions table' },
  { id: 's3', title: 'Pricing logic' },
  { id: 's4', title: 'Seat ramp' },
  { id: 's5', title: 'Cost structure' },
  { id: 's6', title: 'Headcount' },
  { id: 's7', title: 'Monthly bridge' },
  { id: 's8', title: 'Annual view' },
  { id: 's9', title: 'Scenarios' },
  { id: 's10', title: 'Sensitivity' },
  { id: 's11', title: 'Runway & capital' },
  { id: 's12', title: 'Use of funds' },
]);

export const appendixFaqManifest = m('appendix-faq', 'Appendix + FAQ', [
  { id: 's1', title: 'How to read these materials', layout: 'title' },
  { id: 's2', title: 'Anonymity & identity', layout: 'faq' },
  { id: 's3', title: 'Encryption & operators' },
  { id: 's4', title: 'Product surfaces' },
  { id: 's5', title: 'Pilots & success criteria' },
  { id: 's6', title: 'Financial model linkage' },
  { id: 's7', title: 'Compliance posture' },
  { id: 's8', title: 'Contact' },
]);

export const ALL_DECK_MANIFESTS: PitchDeckSlideManifest[] = [
  coreInvestorManifest,
  companyOverviewManifest,
  pilotPartnerManifest,
  problemSolutionManifest,
  productDemoManifest,
  policyGovernmentManifest,
  conflictPreventionThesisManifest,
  marketCompetitionManifest,
  businessPricingManifest,
  tractionRoadmapManifest,
  gtmDistributionManifest,
  teamAdvisorsManifest,
  technicalSecurityManifest,
  financialAppendixManifest,
  appendixFaqManifest,
];

export function manifestSlideCount(deckId: string): number {
  return ALL_DECK_MANIFESTS.find((x) => x.deckId === deckId)?.slides.length ?? 0;
}
