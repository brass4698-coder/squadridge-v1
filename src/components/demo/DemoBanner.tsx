// ============================================================
// DemoBanner — read-only demo environment strip
// ============================================================
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { isDemoUser } from '../../lib/demoLogin';
import { useDemoWalkthrough } from '../../demo/DemoWalkthroughContext';

const DISMISS_KEY = 'squadridge:demo-banner-dismissed';

export function DemoBanner() {
  const { session } = useAuth();
  const { startWalkthrough } = useDemoWalkthrough();
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

  const handleReset = () => {
    try {
      sessionStorage.removeItem('squadridge:demo-preset');
      sessionStorage.removeItem(DISMISS_KEY);
    } catch {
      /* ignore */
    }
    window.location.assign('/app/facilitator');
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
              Demo mode — read-only environment.
            </strong>{' '}
            <span style={{ color: 'var(--sr-ink-secondary)' }}>
              Sample matters by use case. Data resets periodically. Not pilot access.
            </span>
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => startWalkthrough()}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: 'var(--sr-line)', color: 'var(--sr-ink)' }}
          >
            Launch walkthrough
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: 'var(--sr-line)', color: 'var(--sr-ink)' }}
          >
            Reset demo
          </button>
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
            className="rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ color: 'var(--sr-ink-secondary)' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
