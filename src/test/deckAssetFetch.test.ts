import { describe, expect, it } from 'vitest';
import { gatedDeckHtmlFileName, isAllowedDeckAssetPath } from '../lib/deckAssetFetch';

describe('deckAssetFetch path rules', () => {
  it('allows deck basenames and rejects unsafe names', () => {
    expect(isAllowedDeckAssetPath('company-overview.html')).toBe(true);
    expect(isAllowedDeckAssetPath('deck-ds.css')).toBe(true);
    // Basename-only: directory prefixes are stripped before the allowlist check.
    expect(isAllowedDeckAssetPath('nested/company-overview.html')).toBe(true);
    expect(isAllowedDeckAssetPath('no-extension')).toBe(false);
    expect(isAllowedDeckAssetPath('notes.txt')).toBe(false);
    expect(isAllowedDeckAssetPath('# SquadRidge redesign prompt pack.txt')).toBe(false);
  });

  it('maps catalog deck ids to html basenames', () => {
    expect(gatedDeckHtmlFileName('core-investor')).toBe('squadridge-core-investor-deck.html');
    expect(gatedDeckHtmlFileName('company-overview')).toBe('company-overview.html');
  });
});
