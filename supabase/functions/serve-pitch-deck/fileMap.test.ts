import { describe, expect, it } from 'vitest';
import { deckHtmlFilenameFor, isAllowedInlineAssetFile } from './fileMap';

describe('serve-pitch-deck fileMap', () => {
  it('maps known deck ids to bundled HTML filenames', () => {
    expect(deckHtmlFilenameFor('core-investor')).toBe('squadridge-core-investor-deck.html');
    expect(deckHtmlFilenameFor('pilot-partner')).toBe('pilot-partner-deck.html');
    expect(deckHtmlFilenameFor('financial-appendix')).toBe('financial-appendix.html');
    expect(deckHtmlFilenameFor('appendix-faq')).toBe('appendix-faq.html');
  });

  it('strips the -copy-<ts> suffix used by hub duplicates', () => {
    expect(deckHtmlFilenameFor('core-investor-copy-1735000000000')).toBe(
      'squadridge-core-investor-deck.html',
    );
    expect(deckHtmlFilenameFor('financial-appendix-copy-1')).toBe('financial-appendix.html');
  });

  it('rejects unknown deck ids (path-traversal defense)', () => {
    expect(deckHtmlFilenameFor('../../../etc/passwd')).toBeNull();
    expect(deckHtmlFilenameFor('definitely-not-a-deck')).toBeNull();
    expect(deckHtmlFilenameFor('')).toBeNull();
  });

  it('only allowlists the model embed script for inlining', () => {
    expect(isAllowedInlineAssetFile('investor-deck-model.embed.js')).toBe(true);
    expect(isAllowedInlineAssetFile('deck-scroll-deck.js')).toBe(false);
    expect(isAllowedInlineAssetFile('investor-deck-model.json')).toBe(false);
  });
});
