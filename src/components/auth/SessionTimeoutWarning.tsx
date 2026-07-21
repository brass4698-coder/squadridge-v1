import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

const WARN_MS = 2 * 60 * 1000;
const POLL_MS = 15_000;

/**
 * Warns ~2 minutes before JWT expiry; calm redirect after expiry.
 * Mount once under AuthProvider.
 */
export function SessionTimeoutWarning() {
  const { session, signOut, supabase } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const warnedForExp = useRef<number | null>(null);

  const handleExpired = useCallback(async () => {
    setOpen(false);
    await signOut();
    navigate('/sign-in?reason=expired', { replace: true });
  }, [navigate, signOut]);

  useEffect(() => {
    if (!session?.expires_at) {
      setOpen(false);
      return;
    }

    const expiresMs = session.expires_at * 1000;

    const tick = () => {
      const now = Date.now();
      if (now >= expiresMs) {
        void handleExpired();
        return;
      }
      if (now >= expiresMs - WARN_MS && warnedForExp.current !== expiresMs) {
        warnedForExp.current = expiresMs;
        setOpen(true);
      }
    };

    tick();
    const id = window.setInterval(tick, POLL_MS);
    return () => window.clearInterval(id);
  }, [session?.expires_at, handleExpired]);

  async function keepSignedIn() {
    if (!supabase) return;
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      void handleExpired();
      return;
    }
    warnedForExp.current = null;
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-body"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-ink/50"
        aria-hidden="true"
        onClick={() => void keepSignedIn()}
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-md motion-safe:animate-step-in">
        <h2
          id="session-timeout-title"
          className="text-lg font-semibold tracking-[-0.02em] text-ink"
        >
          Your session ends soon
        </h2>
        <p
          id="session-timeout-body"
          className="mt-3 max-w-prose text-base leading-[1.55] text-ink-secondary"
        >
          Stay signed in to keep working, or sign out now.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="primary"
            className="h-11 flex-1 rounded-xl tracking-[-0.01em]"
            onClick={() => void keepSignedIn()}
          >
            Keep me in
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-11 flex-1 rounded-xl tracking-[-0.01em]"
            onClick={() => void handleExpired()}
          >
            Sign out now
          </Button>
        </div>
      </div>
    </div>
  );
}
