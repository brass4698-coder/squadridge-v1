import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * StatusBadge — discrete textual status marker.
 *
 * Always renders as a label (no color-only meaning). Reserved colors:
 *   - `default`  : neutral metadata
 *   - `info`     : process / scope context
 *   - `success`  : verified / published / locked-OK
 *   - `warning`  : attention required, non-blocking
 *   - `danger`   : blocked / escalation
 *   - `brand`    : pilot-facing primary state (use sparingly)
 *
 * Use icon + text for warning/danger surfaces (color is reinforcement, not
 * the only signal).
 */
export type StatusTone = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'brand';

interface StatusBadgeProps {
  tone?: StatusTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const TONE_STYLES: Record<StatusTone, string> = {
  default: 'border-line text-ink-secondary',
  info: 'border-sem-info bg-sem-info-soft text-sem-info',
  success: 'border-sem-success bg-sem-success-soft text-sem-success',
  warning: 'border-sem-warning bg-sem-warning-soft text-sem-warning',
  danger: 'border-sem-danger bg-sem-danger-soft text-sem-danger',
  brand: 'border-brand bg-brand-soft text-brand',
};

export function StatusBadge({ tone = 'default', icon, children, className }: StatusBadgeProps) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-0.5 font-sans text-[0.7rem] font-medium leading-none',
        TONE_STYLES[tone],
        className,
      )}
    >
      {icon ? <span aria-hidden>{icon}</span> : null}
      {children}
    </span>
  );
}
