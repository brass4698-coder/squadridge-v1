// ============================================================
// DemoBanner (Phase 5)
//
// Persistent top strip shown when the current session is the demo user
// (see `isDemoUser` in src/lib/demoLogin.ts). Rendered by both
// AuthenticatedShell and PublicShell so the strip follows the user
// wherever they navigate.
//
// Design: single row, teal-tinted, dismissable to session-only via
// `sessionStorage` (a full sign-out or refresh brings it back — that's
// intentional; demo status should never silently hide).
// ============================================================
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isDemoUser } from '../../lib/demoLogin';

const DISMISS_KEY = 'squadridge:demo-banner-dismissed';

export function DemoBanner() {
  const { session } = useAuth();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (!isDemoUser(session)) return null;
  if (dismissed) return null;

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore quota errors */
    }
    setDismissed(true);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: 'color-mix(in oklch, var(--sr-primary) 14%, var(--sr-bg-elevated))',
        borderBottom: '1px solid color-mix(in oklch, var(--sr-primary) 24%, var(--sr-line))',
        color: 'var(--sr-ink)',
      }}
      className="w-full"
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-2.5 text-sm">
        <p className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: 'var(--sr-primary)' }}
          />
          <span>
            <strong className="font-semibold" style={{ color: 'var(--sr-ink)' }}>
              You're viewing the SquadRidge demo.
            </strong>{' '}
            <span style={{ color: 'var(--sr-ink-secondary)' }}>
              Data is read-only and resets periodically.
            </span>
          </span>
        </p>
        <div className="flex items-center gap-2">
          <a
            href="/request-access"
            className="rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: 'var(--sr-primary)',
              color: 'var(--sr-on-primary)',
            }}
          >
            Request real access
          </a>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss demo banner for this session"
            className="rounded-full px-2 py-1.5 text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
