import { describe, expect, it } from 'vitest';
import {
  getDeckAccessTier as appGetTier,
  isDeckAlwaysModeratorOnly as appIsAlwaysMod,
} from '../../../src/pitch-deck-hub/deckAccessTiers';
import {
  getDeckAccessTier as edgeGetTier,
  isDeckAlwaysModeratorOnly as edgeIsAlwaysMod,
} from './deckAccessTiers';

const SAMPLE_DECK_IDS = [
  'core-investor',
  'company-overview',
  'pilot-partner',
  'problem-solution',
  'product-demo',
  'policy-government',
  'conflict-prevention-thesis',
  'market-competition',
  'business-pricing',
  'traction-roadmap',
  'gtm-distribution',
  'team-advisors',
  'technical-security',
  'financial-appendix',
  'appendix-faq',
];

describe('deck access tier parity (app <-> edge)', () => {
  it('agrees on always-moderator-only flagging for every deck id', () => {
    for (const id of SAMPLE_DECK_IDS) {
      expect(edgeIsAlwaysMod(id), id).toBe(appIsAlwaysMod(id));
    }
  });

  it('agrees on tier resolution for each (deckId, status) pair', () => {
    const statuses = ['draft', 'internal', 'external_ready', 'needs_review'] as const;
    for (const id of SAMPLE_DECK_IDS) {
      for (const status of statuses) {
        expect(edgeGetTier(id, status), `${id}/${status}`).toBe(appGetTier(id, status));
      }
      expect(edgeGetTier(id), `${id}/no-status`).toBe(appGetTier(id));
    }
  });
});
