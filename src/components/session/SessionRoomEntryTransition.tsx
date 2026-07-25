import { useEffect, useState } from 'react';

const STORAGE_PREFIX = 'sr_sess_entry_done_';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Brief scan-line + fade overlay when entering a live squad room — evokes a single verification gate.
 * Skips demo static session and repeats only once per squad per tab (sessionStorage).
 */
export function SessionRoomEntryTransition({ squadId }: { squadId: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (squadId === 'demo-session-001' || prefersReducedMotion()) {
      setShow(false);
      return;
    }
    try {
      if (sessionStorage.getItem(STORAGE_PREFIX + squadId) === '1') {
        setShow(false);
        return;
      }
    } catch {
      /* ignore */
    }

    const done = () => {
      try {
        sessionStorage.setItem(STORAGE_PREFIX + squadId, '1');
      } catch {
        /* ignore */
      }
      setShow(false);
    };

    const t = window.setTimeout(done, 1100);
    return () => clearTimeout(t);
  }, [squadId]);

  if (!show) return null;

  return (
    <div
      className="session-entry-root pointer-events-none fixed inset-0 z-[300] flex items-center justify-center overflow-hidden bg-surface/95"
      aria-hidden
    >
      <div className="absolute inset-0 bg-surface/90 backdrop-blur-[2px]" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px] animate-session-scan bg-gradient-to-r from-transparent via-teal-400/55 to-transparent shadow-[0_0_24px_rgba(45,212,191,0.35)]"
        style={{ animationDuration: '1.05s' }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, transparent 0%, rgba(7, 11, 18, 0.15) 38%, rgba(7, 11, 18, 0.88) 72%)',
        }}
      />
      <p className="relative z-[1] font-mono text-[0.65rem] font-medium uppercase tracking-[0.35em] text-teal-400/90">
        Verifying session
      </p>
    </div>
  );
}
