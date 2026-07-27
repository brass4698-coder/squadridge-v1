import type { ReactNode } from 'react';
import { BrandPresenceLoader } from './BrandPresenceLoader';

/**
 * Standard loading / empty / error visual primitives (Phase 3.3 of the audit
 * remediation plan). Pages historically render these states ad-hoc; using
 * these primitives keeps copy + spacing consistent so participants on
 * low-bandwidth or unreliable networks always see a clear next step.
 *
 * Each is a small presentational component. They never own data — the caller
 * decides which to mount based on its own `loading | empty | error` state
 * machine. Tone follows `docs/brand/tone-of-voice.md` (calm, plain, never
 * blame the user).
 */

export function LoadingBlock({
  title = 'Loading…',
  hint,
  className = '',
}: {
  title?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <BrandPresenceLoader
      variant="compact"
      label={title}
      phrase={hint ?? 'Gathering what you need'}
      className={className}
    />
  );
}

export function EmptyBlock({
  title,
  hint,
  cta,
  className = '',
}: {
  title: string;
  hint?: string;
  cta?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-lg border border-dashed border-[#1a2236] bg-[#0a0e14] px-6 py-10 text-center font-sans text-slate-400 ${className}`}
    >
      <p className="font-medium text-slate-200">{title}</p>
      {hint ? <p className="max-w-[40ch] text-[0.85rem] text-slate-500">{hint}</p> : null}
      {cta ? <div className="mt-1">{cta}</div> : null}
    </div>
  );
}

export function ErrorBlock({
  title = 'Something went wrong.',
  hint,
  onRetry,
  retrying = false,
  retryLabel = 'Retry',
  className = '',
}: {
  title?: string;
  hint?: string;
  onRetry?: () => void;
  retrying?: boolean;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-start gap-3 rounded-lg border border-amber/40 bg-amber/[0.06] px-4 py-3 font-sans text-[0.85rem] text-amber-200 ${className}`}
    >
      <p className="font-medium text-amber-100">{title}</p>
      {hint ? <p className="max-w-[60ch] text-[0.82rem] text-[#e5d2a8]">{hint}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex min-h-[36px] items-center justify-center rounded-md border border-amber/45 bg-amber/10 px-3 font-sans text-[0.82rem] font-medium text-amber-100 transition hover:border-amber/70 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {retrying ? `${retryLabel}…` : retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export function NetworkDegradedBanner({ className = '' }: { className?: string }) {
  return (
    <div
      role="status"
      className={`rounded-md border border-amber/35 bg-amber/[0.07] px-3 py-2 font-sans text-[0.78rem] text-amber-200 ${className}`}
    >
      Network looks unstable — retrying with backoff. Messages will resume sending automatically.
    </div>
  );
}
