/**
 * Brand presence loader — captivating full/compact loading states.
 * Calm institutional motion; respects prefers-reduced-motion.
 * Never implies surveillance or urgency.
 */
import { useEffect, useState } from 'react';
import './brand-presence-loader.css';

const DEFAULT_PHRASES = [
  'Preparing the room',
  'Holding the boundary',
  'Room stays private',
  'Outcome becomes record',
] as const;

export type BrandPresenceLoaderProps = {
  /** Accessible status text (also kept for tests). */
  label?: string;
  /** Visible supporting line; cycles through calm phrases when omitted. */
  phrase?: string;
  /** full = viewport takeover; compact = nested / auth gate. */
  variant?: 'full' | 'compact';
  className?: string;
};

export function BrandPresenceLoader({
  label = 'Loading…',
  phrase,
  variant = 'full',
  className = '',
}: BrandPresenceLoaderProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const showCycle = !phrase;

  useEffect(() => {
    if (!showCycle) return;
    if (typeof window === 'undefined') return;
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const id = window.setInterval(() => {
      setPhraseIndex((i) => (i + 1) % DEFAULT_PHRASES.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [showCycle]);

  const visiblePhrase = phrase ?? DEFAULT_PHRASES[phraseIndex];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid="brand-presence-loader"
      data-variant={variant}
      className={`sr-presence-loader sr-presence-loader--${variant} ${className}`.trim()}
    >
      <span className="sr-only">{label}</span>

      <div className="sr-presence-loader__atmosphere" aria-hidden="true">
        <div className="sr-presence-loader__glow" />
        <div className="sr-presence-loader__grid" />
      </div>

      <div className="sr-presence-loader__stage">
        <div className="sr-presence-loader__signal" aria-hidden="true">
          <span className="sr-presence-loader__ring sr-presence-loader__ring--a" />
          <span className="sr-presence-loader__ring sr-presence-loader__ring--b" />
          <span className="sr-presence-loader__ring sr-presence-loader__ring--c" />
          <svg
            className="sr-presence-loader__ridge"
            viewBox="0 0 120 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 38 L22 22 L38 30 L58 10 L78 26 L98 14 L118 34"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 38 L22 22 L38 30 L58 10 L78 26 L98 14 L118 34 L118 46 L2 46 Z"
              fill="currentColor"
              opacity="0.12"
            />
          </svg>
        </div>

        <p className="sr-presence-loader__brand">SquadRidge</p>
        <p key={visiblePhrase} className="sr-presence-loader__phrase">
          {visiblePhrase}
        </p>

        <div className="sr-presence-loader__horizon" aria-hidden="true">
          <span className="sr-presence-loader__shimmer" />
        </div>
      </div>
    </div>
  );
}
