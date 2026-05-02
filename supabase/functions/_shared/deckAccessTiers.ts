/**
 * Edge-side mirror of `src/pitch-deck-hub/deckAccessTiers.ts`.
 *
 * The two files MUST stay in sync — the application source decides which
 * UI affordances appear, and this file is the security boundary that
 * `mint-deck-share` enforces on incoming requests. A `pitch-deck-tiers`
 * unit test in vitest checks both files agree on every deck id; failing
 * to update one will break that test.
 *
 * Edge Functions cannot import from `src/`, hence the duplication.
 */

export type DeckShareAudience = 'self' | 'share';
export type DeckAccessTier = 'shareable' | 'moderator-only';

const ALWAYS_MODERATOR_ONLY_DECK_IDS: ReadonlySet<string> = new Set([
  'financial-appendix',
  'business-pricing',
  'appendix-faq',
]);

function canonicalDeckId(deckId: string): string {
  return deckId.replace(/-copy-\d+$/, '');
}

/** Same statuses as the application's `DeckStatus` type. */
export type DeckStatusForGate = 'draft' | 'internal' | 'external_ready' | 'needs_review';

export function getDeckAccessTier(deckId: string, status?: DeckStatusForGate): DeckAccessTier {
  const baseId = canonicalDeckId(deckId);
  if (ALWAYS_MODERATOR_ONLY_DECK_IDS.has(baseId)) return 'moderator-only';
  return status === 'external_ready' ? 'shareable' : 'moderator-only';
}

export function isDeckAlwaysModeratorOnly(deckId: string): boolean {
  return ALWAYS_MODERATOR_ONLY_DECK_IDS.has(canonicalDeckId(deckId));
}

export function isDeckShareAudienceAllowed(
  audience: DeckShareAudience,
  tier: DeckAccessTier,
): boolean {
  if (audience === 'self') return true;
  return tier === 'shareable';
}

/** Exposed for cross-file unit-test parity. */
export const ALWAYS_MODERATOR_ONLY_FOR_TESTING = ALWAYS_MODERATOR_ONLY_DECK_IDS;
