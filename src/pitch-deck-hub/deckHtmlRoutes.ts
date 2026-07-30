/**
 * Static pitch decks live under `public/pitch-deck-hub/`.
 * Most decks use `{deckId}.html`; a few legacy filenames remain.
 */
const PITCH_DECK_HUB_HTML_OVERRIDES: Record<string, string> = {
  'core-investor': 'mendguild-core-investor-deck.html',
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
