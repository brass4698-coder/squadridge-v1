/**
 * Pitch deck HTML/CSS/JS live under `supabase/functions/serve-deck/static/`
 * and are served only by Edge Function `serve-deck` after `has_deck_access()`.
 * Most decks use `{deckId}.html`; a few legacy filenames remain.
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
