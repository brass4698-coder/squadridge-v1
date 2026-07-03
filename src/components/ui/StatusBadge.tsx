import type { ReactNode } from 'react';

// v2 session/outcome statuses.
type SessionStatus =
  | 'released'
  | 'pending'
  | 'draft'
  | 'closed'
  | 'live'
  | 'verified'
  | 'denied'
  | 'approved'
  | 'declined'
  | 'archived'
  | 'paused'
  | 'ended'
  | 'setup'
  | 'open'
  | 'warning'
  | 'default';

// v1 marketing/security-page tones — kept as an alias for `variant` so
// LandingPage / SecurityDisclosurePage continue to compile.
type Tone = 'info' | 'success' | 'brand' | 'warning' | 'danger' | 'default';

export type Variant = SessionStatus | Tone;

const variantStyles: Record<Variant, { bg: string; color: string }> = {
  // v2 session statuses
  released: { bg: 'var(--color-accent-light)', color: 'var(--color-accent)' },
  pending: { bg: 'var(--color-pending-strip)', color: '#92710a' },
  draft: { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
  closed: { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
  live: { bg: '#d1fae5', color: '#065f46' },
  verified: { bg: '#d1fae5', color: '#065f46' },
  approved: { bg: '#d1fae5', color: '#065f46' },
  denied: { bg: '#fee2e2', color: '#991b1b' },
  declined: { bg: '#fee2e2', color: '#991b1b' },
  archived: { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
  paused: { bg: '#fef3c7', color: '#92710a' },
  ended: { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
  setup: { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
  open: { bg: '#dbeafe', color: '#1e40af' },
  warning: { bg: '#fef3c7', color: '#92710a' },
  // v1 tones
  info: { bg: '#dbeafe', color: '#1e40af' },
  success: { bg: '#d1fae5', color: '#065f46' },
  brand: { bg: 'var(--color-accent-light)', color: 'var(--color-accent)' },
  danger: { bg: '#fee2e2', color: '#991b1b' },
  default: { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
};

export interface StatusBadgeProps {
  variant?: Variant;
  /** Legacy alias for `variant`. When both are provided, `variant` wins. */
  tone?: Variant;
  className?: string;
  children: ReactNode;
}

export function StatusBadge({ variant, tone, className, children }: StatusBadgeProps) {
  const resolved: Variant = variant ?? tone ?? 'default';
  const { bg, color } = variantStyles[resolved] ?? variantStyles.default;
  const cls =
    'inline-block rounded px-2.5 py-1 text-xs font-semibold' + (className ? ` ${className}` : '');
  return (
    <span className={cls} style={{ backgroundColor: bg, color }}>
      {children}
    </span>
  );
}
