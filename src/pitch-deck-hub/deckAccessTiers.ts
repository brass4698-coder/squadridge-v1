/**
 * Single source of truth for pitch-deck access tiers.
 *
 * Background: pitch-deck content was historically hosted under
 * `public/pitch-deck-hub/*.html`, which made every deck and the embedded
 * financial model fetchable by URL guess. The hub UI carried an
 * "external_ready" status flag that was advisory only — nothing enforced
 * it. This module is the authoritative gate consumed by:
 *   - the hub UI (which buttons are enabled, which target route to use), and
 *   - the `mint-deck-share` Edge Function (which audiences are permitted).
 *
 * Tiers:
 *   - `shareable`: a moderator may mint a 7-day signed link. Reserved for
 *     decks whose `DeckStatus === 'external_ready'` AND whose id is not on
 *     the always-moderator-only list below.
 *   - `moderator-only`: viewable only through a moderator session (or a
 *     transient 60s self-token minted by a logged-in moderator). Never
 *     produces a shareable URL.
 *
 * The always-moderator-only list pins assets that contain raise size,
 * monthly cash, or other figures that must not be share-linkable
 * regardless of how the parent deck is labeled. Add to it carefully.
 */
import type { DeckStatus } from './types';

const ALWAYS_MODERATOR_ONLY_DECK_IDS: ReadonlySet<string> = new Set([
  'financial-appendix',
  'business-pricing',
  'appendix-faq',
]);

/**
 * Bare asset filenames (with extension) that are equivalently sensitive
 * and must never be share-linkable. Includes the investor financial model
 * JSON/JS that 5 of the deck HTMLs load via `<script src="…">` and which
 * therefore leaks `fundraisingAskUsd`, `cashEndUsd`, `runwayMonthsFromStart`
 * to anyone with the URL.
 */
export const ALWAYS_MODERATOR_ONLY_ASSET_FILES: ReadonlySet<string> = new Set([
  'investor-deck-model.json',
  'investor-deck-model.embed.js',
]);

export type DeckAccessTier = 'shareable' | 'moderator-only';

/** Hub rows duplicated from a base deck keep ids of `{baseId}-copy-{ts}`. */
function canonicalDeckId(deckId: string): string {
  return deckId.replace(/-copy-\d+$/, '');
}

export function getDeckAccessTier(deckId: string, status?: DeckStatus): DeckAccessTier {
  const baseId = canonicalDeckId(deckId);
  if (ALWAYS_MODERATOR_ONLY_DECK_IDS.has(baseId)) return 'moderator-only';
  return status === 'external_ready' ? 'shareable' : 'moderator-only';
}

export function isDeckAlwaysModeratorOnly(deckId: string): boolean {
  return ALWAYS_MODERATOR_ONLY_DECK_IDS.has(canonicalDeckId(deckId));
}

export function isAssetAlwaysModeratorOnly(filename: string): boolean {
  return ALWAYS_MODERATOR_ONLY_ASSET_FILES.has(filename);
}

/** Audiences accepted by the share-token mint endpoint. */
export type DeckShareAudience = 'self' | 'share';

/** Matches the `aud` claim in tokens emitted by the `mint-deck-share` Edge Function. */
export function isDeckShareAudienceAllowed(
  audience: DeckShareAudience,
  tier: DeckAccessTier,
): boolean {
  if (audience === 'self') return true;
  return tier === 'shareable';
}
