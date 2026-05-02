import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * StatusDot — labeled system-state indicator used by KPIs, dialogue rows,
 * the system status strip, and anywhere a non-icon-only state cue is needed.
 *
 * Renders a small colored dot followed by an uppercase mono label so the
 * meaning is legible to users and screen readers without color alone. Pair
 * with a srOnly description if `label` is ambiguous (e.g. "Live" vs context).
 */

export type StatusState = 'live' | 'stale' | 'empty' | 'error';

const stateLabel: Record<StatusState, string> = {
  live: 'Live',
  stale: 'Stale',
  empty: 'Idle',
  error: 'Error',
};

export function StatusDot({
  state,
  label,
  srLabel,
  className,
  children,
}: {
  state: StatusState;
  /** Visible label override; defaults to the state name. */
  label?: ReactNode;
  /** Extra screen-reader context (e.g. timestamp, severity). */
  srLabel?: string;
  className?: string;
  /** Optional trailing content (timestamp, count). */
  children?: ReactNode;
}) {
  return (
    <span className={twMerge('sr-status-dot', className)} data-state={state} role="status">
      <span aria-hidden className="sr-status-dot__mark" />
      <span>{label ?? stateLabel[state]}</span>
      {srLabel ? <span className="sr-only">{srLabel}</span> : null}
      {children ? (
        <span className="text-[0.7rem] tracking-normal text-ink-subtle normal-case">
          {children}
        </span>
      ) : null}
    </span>
  );
}
