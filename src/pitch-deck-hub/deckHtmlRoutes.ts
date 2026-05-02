/**
 * Pitch-deck routing helpers.
 *
 * The deck HTML files used to live under `public/pitch-deck-hub/` and were
 * fetched directly. They now live under
 * `supabase/functions/serve-pitch-deck/decks/` and are served by an
 * authenticated Edge Function (see [docs/security/pitch-deck-access.md]).
 * The hub UI never points at the bundled files directly anymore — it
 * routes moderators through `/admin/decks/view/:deckId`, which mints a
 * short-lived self-token and redirects to the gated function URL.
 *
 * The filename mapping below is preserved because the Edge Function uses
 * the same convention (with a duplicate in
 * `supabase/functions/serve-pitch-deck/fileMap.ts` for parity).
 */
const PITCH_DECK_HUB_HTML_OVERRIDES: Record<string, string> = {
  'core-investor': 'squadridge-core-investor-deck.html',
  'pilot-partner': 'pilot-partner-deck.html',
};

export function pitchDeckHubHtmlFileName(deckId: string): string {
  return PITCH_DECK_HUB_HTML_OVERRIDES[deckId] ?? `${deckId}.html`;
}

/** Duplicated hub rows keep ids like `{baseId}-copy-{timestamp}` — resolve static assets from `baseId`. */
export function pitchDeckHubHtmlFileNameForDeck(deckId: string): string {
  const baseId = deckId.replace(/-copy-\d+$/, '');
  return pitchDeckHubHtmlFileName(baseId);
}

/**
 * Route a moderator follows to view any deck (gated or not). The actual
 * gating happens server-side; this is just the React entry point for the
 * "View deck" button. Duplicate ids (`{baseId}-copy-{ts}`) are passed
 * through unchanged so the view page can mint a token bound to the row
 * the moderator clicked.
 */
export function pitchDeckViewerRoute(deckId: string): string {
  return `/admin/decks/view/${encodeURIComponent(deckId)}`;
}
