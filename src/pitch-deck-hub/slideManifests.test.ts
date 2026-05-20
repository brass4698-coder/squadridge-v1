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

  it('sectionsOutline length matches slideCount within a tolerance of 3', () => {
    // Title slides and footnote slides may not have outline entries,
    // but a larger gap indicates a missing outline section.
    const TOLERANCE = 3;
    for (const deck of INITIAL_DECKS) {
      const diff = Math.abs(deck.sectionsOutline.length - deck.slideCount);
      expect(
        diff,
        `deck "${deck.id}": sectionsOutline has ${deck.sectionsOutline.length} items but slideCount is ${deck.slideCount} (diff ${diff} > tolerance ${TOLERANCE})`,
      ).toBeLessThanOrEqual(TOLERANCE);
    }
  });
});
