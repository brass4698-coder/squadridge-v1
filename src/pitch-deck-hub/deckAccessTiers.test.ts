import { describe, expect, it } from 'vitest';
import {
  ALWAYS_MODERATOR_ONLY_ASSET_FILES,
  getDeckAccessTier,
  isAssetAlwaysModeratorOnly,
  isDeckAlwaysModeratorOnly,
  isDeckShareAudienceAllowed,
} from './deckAccessTiers';

describe('deckAccessTiers', () => {
  it('marks financial-appendix moderator-only regardless of status', () => {
    expect(getDeckAccessTier('financial-appendix', 'external_ready')).toBe('moderator-only');
    expect(getDeckAccessTier('financial-appendix', 'draft')).toBe('moderator-only');
  });

  it('marks business-pricing and appendix-faq moderator-only by id', () => {
    expect(isDeckAlwaysModeratorOnly('business-pricing')).toBe(true);
    expect(isDeckAlwaysModeratorOnly('appendix-faq')).toBe(true);
  });

  it('promotes other decks to shareable only when external_ready', () => {
    expect(getDeckAccessTier('core-investor', 'external_ready')).toBe('shareable');
    expect(getDeckAccessTier('core-investor', 'draft')).toBe('moderator-only');
    expect(getDeckAccessTier('core-investor', 'internal')).toBe('moderator-only');
    expect(getDeckAccessTier('core-investor', 'needs_review')).toBe('moderator-only');
    expect(getDeckAccessTier('core-investor')).toBe('moderator-only');
  });

  it('treats duplicated hub rows like their canonical id', () => {
    expect(getDeckAccessTier('financial-appendix-copy-1735000000000', 'external_ready')).toBe(
      'moderator-only',
    );
    expect(getDeckAccessTier('core-investor-copy-1735000000000', 'external_ready')).toBe(
      'shareable',
    );
  });

  it('marks the embedded financial model assets always moderator-only', () => {
    expect(isAssetAlwaysModeratorOnly('investor-deck-model.json')).toBe(true);
    expect(isAssetAlwaysModeratorOnly('investor-deck-model.embed.js')).toBe(true);
    expect(isAssetAlwaysModeratorOnly('deck-hub-chrome.css')).toBe(false);
    expect(ALWAYS_MODERATOR_ONLY_ASSET_FILES.size).toBeGreaterThan(0);
  });

  it('only allows the share audience for shareable tier', () => {
    expect(isDeckShareAudienceAllowed('share', 'shareable')).toBe(true);
    expect(isDeckShareAudienceAllowed('share', 'moderator-only')).toBe(false);
    expect(isDeckShareAudienceAllowed('self', 'shareable')).toBe(true);
    expect(isDeckShareAudienceAllowed('self', 'moderator-only')).toBe(true);
  });
});
