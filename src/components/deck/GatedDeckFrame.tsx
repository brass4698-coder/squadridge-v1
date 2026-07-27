import { useEffect, useState } from 'react';
import { buildGatedDeckSrcDoc } from '../../lib/deckAssetFetch';
import { logWarn, safeErrorMessage } from '../../lib/log';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; srcDoc: string }
  | { status: 'error'; message: string };

/**
 * Renders invite-only deck HTML via authenticated Edge Function fetch + srcDoc.
 * Does not point the iframe at a publicly guessable static URL.
 */
export function GatedDeckFrame({ htmlFileName, title }: { htmlFileName: string; title: string }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    void (async () => {
      try {
        const srcDoc = await buildGatedDeckSrcDoc(htmlFileName);
        if (!cancelled) setState({ status: 'ready', srcDoc });
      } catch (err) {
        logWarn('deck_frame.load_failed', {
          feature: 'deck_access',
          error_message: safeErrorMessage(err),
        });
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              err instanceof Error && err.message === 'FORBIDDEN'
                ? 'Briefing access is required to view this deck.'
                : 'Could not load this briefing. Try again, or request access.',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [htmlFileName]);

  if (state.status === 'loading') {
    return (
      <div
        className="flex min-h-0 w-full flex-1 items-center justify-center bg-surface text-sm text-ink-secondary"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        Loading briefing…
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div
        className="flex min-h-0 w-full flex-1 items-center justify-center bg-surface px-6 text-center text-sm text-ink-secondary"
        role="alert"
      >
        {state.message}
      </div>
    );
  }

  return (
    <iframe
      title={title}
      srcDoc={state.srcDoc}
      sandbox="allow-scripts allow-same-origin"
      className="min-h-0 w-full flex-1 border-0 bg-surface"
    />
  );
}
