import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mintDeckShare } from '../../lib/pitchDeck/mintDeckShare';

/**
 * Transparent redirect page used when the hub's "View deck" button is
 * clicked for a gated deck. Mints a 30s self-token via `mint-deck-share`
 * (audience: 'self'), then `window.location.replace`s to the absolute
 * Edge-Function URL so the browser loads the deck inside the function's
 * response body.
 *
 * Why this lives behind `RequireAuth + RequireModerator` already in
 * `App.tsx`: the mint endpoint refuses non-moderators server-side, but
 * the React route also makes the failure mode obvious — anonymous users
 * are bounced to `/sign-in` before they ever see this loader.
 */
export function DeckViewerRedirectPage() {
  const { deckId = '' } = useParams<{ deckId: string }>();
  const { supabase, loading: authLoading, session } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!supabase || !session) {
      navigate('/sign-in', { replace: true });
      return;
    }
    if (!/^[a-z0-9-]+$/i.test(deckId)) {
      setError('That deck identifier is not recognised.');
      return;
    }

    let cancelled = false;
    void (async () => {
      const result = await mintDeckShare(supabase, {
        deckId,
        audience: 'self',
      });
      if (cancelled) return;
      if (!result.ok) {
        setError(`${result.message} (${result.errorCode})`);
        return;
      }
      window.location.replace(result.absoluteUrl);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, supabase, session, deckId, navigate]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center font-sans text-[#cbd5e1]"
    >
      {error ? (
        <>
          <p className="font-heading text-lg font-semibold text-amber-200">
            Could not open this pitch deck
          </p>
          <p className="max-w-md text-[0.9rem] text-[#94a3b8]">{error}</p>
          <button
            type="button"
            className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-[0.85rem] hover:border-teal/40"
            onClick={() => navigate('/pitch-deck-hub')}
          >
            Back to Pitch Deck Hub
          </button>
        </>
      ) : (
        <>
          <span className="sr-only">Preparing pitch deck.</span>
          <span aria-hidden="true" className="text-[0.95rem] text-[#94a3b8]">
            Preparing pitch deck…
          </span>
        </>
      )}
    </div>
  );
}
