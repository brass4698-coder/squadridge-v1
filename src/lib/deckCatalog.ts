import { pitchDeckHubHtmlFileNameForDeck } from '../pitch-deck-hub/deckHtmlRoutes';
import type { DeckAudience } from '../pitch-deck-hub/types';

export type DeckAudienceLabel =
  | 'Investors'
  | 'Partners / institutions'
  | 'Corporate pilots'
  | 'Technical diligence'
  | 'Policy / government';

export interface GatedDeckCatalogItem {
  id: string;
  title: string;
  summary: string;
  audience: DeckAudience;
  audienceLabel: DeckAudienceLabel;
  /** Basename served only via Edge Function `serve-deck` after has_deck_access. */
  htmlFile: string;
  updated: string;
}

const AUDIENCE_LABEL: Record<DeckAudience, DeckAudienceLabel | null> = {
  investors: 'Investors',
  pilots_partners: 'Partners / institutions',
  policy_government: 'Policy / government',
  technical_diligence: 'Technical diligence',
  facilitators_demos: 'Partners / institutions',
  financial_appendix: 'Investors',
};

/** Curated partner-facing catalog — metadata only in the public teaser. */
export const GATED_DECK_CATALOG: GatedDeckCatalogItem[] = [
  {
    id: 'core-investor',
    title: 'Core investor briefing',
    summary:
      'Problem structure, facilitator-led room model, privacy boundaries, and ask — labeled assumptions where numbers are modeled.',
    audience: 'investors',
    audienceLabel: 'Investors',
    htmlFile: pitchDeckHubHtmlFileNameForDeck('core-investor'),
    updated: 'Diligence-ready structure · 2026',
  },
  {
    id: 'company-overview',
    title: 'Company overview',
    summary: 'Concise who / what / why before deep diligence. Honest about what exists today.',
    audience: 'investors',
    audienceLabel: 'Investors',
    htmlFile: pitchDeckHubHtmlFileNameForDeck('company-overview'),
    updated: 'Narrative · rolling',
  },
  {
    id: 'pilot-partner',
    title: 'Pilot & partner briefing',
    summary:
      'Operations, cadence, risk controls, and how a private room produces an approved record partners can stand behind.',
    audience: 'pilots_partners',
    audienceLabel: 'Partners / institutions',
    htmlFile: pitchDeckHubHtmlFileNameForDeck('pilot-partner'),
    updated: 'Institutional pilot · 2026',
  },
  {
    id: 'technical-security',
    title: 'Technical & security overview',
    summary:
      'Architecture and trust boundaries aligned with the published threat model — no overclaimed E2E or ZK.',
    audience: 'technical_diligence',
    audienceLabel: 'Technical diligence',
    htmlFile: pitchDeckHubHtmlFileNameForDeck('technical-security'),
    updated: 'Aligned with threat model',
  },
  {
    id: 'policy-government',
    title: 'Institutional & policy briefing',
    summary: 'Governance fit for public-interest and institutional operators evaluating a pilot.',
    audience: 'policy_government',
    audienceLabel: 'Policy / government',
    htmlFile: pitchDeckHubHtmlFileNameForDeck('policy-government'),
    updated: 'Institutional · 2026',
  },
  {
    id: 'business-pricing',
    title: 'Corporate pilot economics',
    summary: 'Pilot shape, pricing posture, and what a serious corporate evaluation should expect.',
    audience: 'pilots_partners',
    audienceLabel: 'Corporate pilots',
    htmlFile: pitchDeckHubHtmlFileNameForDeck('business-pricing'),
    updated: 'Pilot economics · 2026',
  },
];

export function getGatedDeck(id: string): GatedDeckCatalogItem | undefined {
  return GATED_DECK_CATALOG.find((d) => d.id === id);
}

export function audienceLabelFor(audience: DeckAudience): string {
  return AUDIENCE_LABEL[audience] ?? audience;
}
