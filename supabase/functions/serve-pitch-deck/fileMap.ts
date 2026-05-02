/**
 * Resolves a deck id (or asset name) to a bundled file path under
 * `./decks/`. The mapping is duplicated from
 * `src/pitch-deck-hub/deckHtmlRoutes.ts` because Edge Functions cannot
 * import from the application source tree at runtime.
 *
 * Allowlist semantics: the function refuses to serve any path that does
 * not appear here. This is the boundary that prevents path-traversal and
 * stops a forged token from reaching unrelated bundled files.
 */

const DECK_FILENAME_OVERRIDES: Record<string, string> = {
  'core-investor': 'squadridge-core-investor-deck.html',
  'pilot-partner': 'pilot-partner-deck.html',
};

/** Bare filenames inside `./decks/` that are loaded by deck HTML at runtime. */
const ALLOWED_INLINE_ASSET_FILES: ReadonlySet<string> = new Set(['investor-deck-model.embed.js']);

/** All deck ids the hub currently knows about (mirrors `INITIAL_DECKS`). */
const KNOWN_DECK_IDS: ReadonlySet<string> = new Set([
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
]);

function canonicalDeckId(deckId: string): string {
  return deckId.replace(/-copy-\d+$/, '');
}

export function deckHtmlFilenameFor(deckId: string): string | null {
  const baseId = canonicalDeckId(deckId);
  if (!KNOWN_DECK_IDS.has(baseId)) return null;
  return DECK_FILENAME_OVERRIDES[baseId] ?? `${baseId}.html`;
}

export function isAllowedInlineAssetFile(filename: string): boolean {
  return ALLOWED_INLINE_ASSET_FILES.has(filename);
}

export const KNOWN_DECK_IDS_FOR_TESTING = KNOWN_DECK_IDS;
