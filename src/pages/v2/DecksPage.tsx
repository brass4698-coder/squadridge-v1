import { Link, useParams } from 'react-router-dom';
import { ExternalLink, Lock } from 'lucide-react';
import { useState } from 'react';
import { GatedDeckFrame } from '../../components/deck/GatedDeckFrame';
import { openGatedDeckInNewTab } from '../../lib/deckAssetFetch';
import { GATED_DECK_CATALOG, getGatedDeck } from '../../lib/deckCatalog';
import { logWarn, safeErrorMessage } from '../../lib/log';

export function DecksPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-10 px-6 py-12 md:py-16">
      <header>
        <p className="sr-meta-label">Gated briefings</p>
        <h1 className="mt-3 font-heading text-h1 text-ink">SquadRidge pitch materials</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
          Audience-labeled decks for investors, partners, institutions, and corporate pilots.
          Content is shared by invitation — not for open browsing.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-ink-faint">
          Interactive hub (scenario model, consistency checks):{' '}
          <Link to="/pitch-deck-hub" className="text-brand underline-offset-2 hover:underline">
            Pitch deck hub
          </Link>
        </p>
      </header>

      <section aria-label="Available decks">
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {GATED_DECK_CATALOG.map((deck) => (
            <li key={deck.id}>
              <article className="flex h-full flex-col rounded-[var(--sr-radius-lg)] border border-line sr-surface-published sr-registry-pad">
                <p className="sr-meta-label text-brand">{deck.audienceLabel}</p>
                <h2 className="mt-2 text-h3 text-ink">{deck.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary">
                  {deck.summary}
                </p>
                <p className="mt-4 text-xs text-ink-faint">{deck.updated}</p>
                <div className="mt-5">
                  <Link
                    to={`/decks/${deck.id}`}
                    className="btn-institutional btn-institutional--primary text-sm"
                  >
                    Open briefing
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function DeckViewerPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const deck = getGatedDeck(deckId ?? '');
  const [fullscreenBusy, setFullscreenBusy] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);

  if (!deck) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
        <h1 className="text-h2 text-ink">Briefing not found</h1>
        <p className="mt-3 text-sm text-ink-secondary">That deck is not in the gated catalog.</p>
        <Link to="/decks" className="btn-institutional btn-institutional--ghost mt-6">
          Back to decks
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-elevated px-4 py-3 md:px-6">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-brand">
            {deck.audienceLabel}
          </p>
          <h1 className="truncate text-base font-semibold text-ink">{deck.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
            <Lock className="size-3.5" aria-hidden />
            Access-checked session
          </span>
          <Link to="/decks" className="btn-institutional btn-institutional--ghost text-xs">
            Catalog
          </Link>
          <button
            type="button"
            disabled={fullscreenBusy}
            className="btn-institutional btn-institutional--ghost inline-flex items-center gap-1 text-xs"
            onClick={() => {
              setFullscreenError(null);
              setFullscreenBusy(true);
              void openGatedDeckInNewTab(deck.htmlFile)
                .catch((err) => {
                  logWarn('deck_viewer.fullscreen_failed', {
                    feature: 'deck_access',
                    error_message: safeErrorMessage(err),
                  });
                  setFullscreenError(
                    err instanceof Error && err.message === 'POPUP_BLOCKED'
                      ? 'Allow pop-ups to open the fullscreen briefing.'
                      : 'Could not open fullscreen briefing.',
                  );
                })
                .finally(() => setFullscreenBusy(false));
            }}
          >
            {fullscreenBusy ? 'Opening…' : 'Open fullscreen'}
            <ExternalLink className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
      {fullscreenError ? (
        <p
          className="border-b border-line bg-surface px-4 py-2 text-xs text-ink-secondary md:px-6"
          role="status"
        >
          {fullscreenError}
        </p>
      ) : null}
      <GatedDeckFrame htmlFileName={deck.htmlFile} title={deck.title} />
    </div>
  );
}
