import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * IdentityModeChip — labeled chip that exposes the visitor's current
 * participation mode (Verified / Pseudonymous / Anonymous / Public visitor)
 * with a popover explaining the protections and tradeoffs of each mode.
 *
 * Phase 1 derives the mode purely from session presence and a small
 * heuristic; phase 3 replaces the heuristic with the real verification +
 * profile state once `useRole` exists.
 */

type IdentityMode = 'verified' | 'pseudonymous' | 'anonymous' | 'visitor';

const MODE_LABEL: Record<IdentityMode, string> = {
  verified: 'Verified',
  pseudonymous: 'Pseudonymous',
  anonymous: 'Anonymous',
  visitor: 'Public visitor',
};

const MODE_BLURB: Record<IdentityMode, string> = {
  verified:
    'Eligibility is proven once. The room sees only that you are eligible — not who you are.',
  pseudonymous:
    'Eligibility plus a stable handle inside the cohort. No external identity is exposed.',
  anonymous:
    'No persistent handle in-room. Useful when even a pseudonym carries cost outside the room.',
  visitor: 'You have not signed in. You can read public records and apply for pilot access.',
};

const MODE_TRADEOFFS: Record<IdentityMode, string> = {
  verified:
    'Strongest accountability for facilitators; participants still see no identity unless they choose to.',
  pseudonymous:
    'Best balance for ongoing cohorts. A leaked handle reveals only in-room continuity.',
  anonymous: 'No continuity across sessions; some flows (DMs, follow-ups) are unavailable.',
  visitor: 'No participation in rooms; sign in or accept an invite to join a squad.',
};

function deriveMode(hasSession: boolean): IdentityMode {
  if (!hasSession) return 'visitor';
  return 'pseudonymous';
}

export function IdentityModeChip({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  const { session } = useAuth();
  const mode = deriveMode(Boolean(session));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const popId = useId();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const verified = mode === 'verified';
  const dotState = mode === 'verified' ? 'live' : mode === 'visitor' ? 'empty' : 'stale';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="inline-flex min-h-[44px] min-w-0 items-center justify-center gap-2 rounded-[6px] border border-line bg-surface-elevated px-2.5 py-1.5 text-center font-sans text-[0.78rem] font-medium leading-snug text-ink-secondary transition-colors hover:border-line-strong hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popId}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          aria-hidden
          className="sr-status-dot__mark"
          data-state={dotState}
          style={{
            background: verified
              ? 'var(--sr-status-live)'
              : mode === 'visitor'
                ? 'var(--sr-status-empty)'
                : 'var(--sr-status-stale)',
          }}
        />
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-faint">
          ID
        </span>
        <span className="text-ink">{MODE_LABEL[mode]}</span>
        {variant === 'full' ? (
          <span aria-hidden className="text-ink-subtle">
            ↓
          </span>
        ) : null}
      </button>
      {open ? (
        <div
          id={popId}
          role="dialog"
          aria-label={`Identity mode: ${MODE_LABEL[mode]}`}
          className="absolute right-0 top-full z-[150] mt-1 w-[min(20rem,calc(100vw-2rem))] rounded-[8px] border border-line bg-surface-elevated p-4 shadow-[var(--sr-shadow-md)]"
        >
          <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Identity mode
          </p>
          <p className="mt-1.5 font-sans text-[0.95rem] font-semibold leading-snug text-ink">
            {MODE_LABEL[mode]}
          </p>
          <p className="mt-2 font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
            {MODE_BLURB[mode]}
          </p>
          <p className="mt-2 font-sans text-[0.8rem] leading-relaxed text-ink-faint">
            <span className="font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Tradeoff
            </span>
            <span className="ml-1.5 normal-case tracking-normal">{MODE_TRADEOFFS[mode]}</span>
          </p>
          <div className="mt-3 border-t border-line pt-3">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Other modes
            </p>
            <ul className="mt-2 space-y-1.5">
              {(['verified', 'pseudonymous', 'anonymous', 'visitor'] as const)
                .filter((m) => m !== mode)
                .map((m) => (
                  <li
                    key={m}
                    className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 font-sans text-[0.8rem] leading-relaxed text-ink-faint"
                  >
                    <span className="font-mono text-[0.7rem] uppercase tracking-[0.06em] text-ink-secondary">
                      {MODE_LABEL[m]}
                    </span>
                    <span>{MODE_BLURB[m]}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
