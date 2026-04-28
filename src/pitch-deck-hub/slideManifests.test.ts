import { describe, expect, it } from 'vitest';
import { INITIAL_DECKS } from './initialState';
import { ALL_DECK_MANIFESTS, manifestSlideCount } from './slideManifests';

describe('slideManifests', () => {
  it('covers every deck in INITIAL_DECKS with matching slide counts', () => {
    const byId = new Map(ALL_DECK_MANIFESTS.map((m) => [m.deckId, m]));
    for (const deck of INITIAL_DECKS) {
      expect(byId.has(deck.id), `missing manifest for deck id "${deck.id}"`).toBe(true);
      expect(manifestSlideCount(deck.id)).toBe(deck.slideCount);
    }
  });
});
