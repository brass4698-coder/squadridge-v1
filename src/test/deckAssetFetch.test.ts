import { describe, expect, it } from 'vitest';
import {
  absolutizeDeckPublicAssetUrls,
  gatedDeckHtmlFileName,
  isAllowedDeckAssetPath,
} from '../lib/deckAssetFetch';

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

describe('absolutizeDeckPublicAssetUrls', () => {
  it('rewrites /assets/ to the SPA origin for srcDoc and blob tabs', () => {
    const html = '<img src="/assets/squadridge-icon.svg" alt="" /><link href="/assets/x.css" />';
    expect(absolutizeDeckPublicAssetUrls(html, 'https://app.example')).toBe(
      '<img src="https://app.example/assets/squadridge-icon.svg" alt="" /><link href="https://app.example/assets/x.css" />',
    );
  });

  it('leaves relative gated assets untouched', () => {
    const html = '<link rel="stylesheet" href="deck-ds.css" />';
    expect(absolutizeDeckPublicAssetUrls(html, 'https://app.example')).toBe(html);
  });
});
