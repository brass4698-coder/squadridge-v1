import { describe, expect, it } from 'vitest';
import { GATED_DECK_CATALOG, getGatedDeck } from '../lib/deckCatalog';
import { pacingCopy } from '../lib/sessionPacing';

describe('deckCatalog', () => {
  it('exposes audience-labeled decks without requiring public HTML paths in teasers alone', () => {
    expect(GATED_DECK_CATALOG.length).toBeGreaterThanOrEqual(4);
    const audiences = new Set(GATED_DECK_CATALOG.map((d) => d.audienceLabel));
    expect(audiences.has('Investors')).toBe(true);
    expect(audiences.has('Partners / institutions')).toBe(true);
    expect(audiences.has('Corporate pilots')).toBe(true);
  });

  it('resolves known deck ids to gated html file basenames (not public URLs)', () => {
    const deck = getGatedDeck('core-investor');
    expect(deck?.htmlFile).toMatch(/\.html$/);
    expect(deck?.htmlFile).not.toMatch(/^\/pitch-deck-hub\//);
    expect(getGatedDeck('missing')).toBeUndefined();
  });
});

describe('sessionPacing copy', () => {
  it('uses calm de-escalation language', () => {
    expect(pacingCopy('paused').title).toBe('Power of Pause');
    expect(pacingCopy('slow').title).toBe('Slow down');
    expect(pacingCopy('pull_back').title).toBe('Pull back');
    expect(pacingCopy('paused').body.toLowerCase()).not.toMatch(/ban|punish|strike/);
  });
});
