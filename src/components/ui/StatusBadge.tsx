import { ReactNode } from 'react';

type Variant =
  | 'released'
  | 'pending'
  | 'draft'
  | 'closed'
  | 'live'
  | 'verified'
  | 'denied'
  | 'default';

const variantStyles: Record<Variant, { bg: string; color: string }> = {
  released: { bg: 'var(--color-accent-light)', color: 'var(--color-accent)' },
  pending:  { bg: 'var(--color-pending-strip)', color: '#92710a' },
  draft:    { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
  closed:   { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
  live:     { bg: '#d1fae5', color: '#065f46' },
  verified: { bg: '#d1fae5', color: '#065f46' },
  denied:   { bg: '#fee2e2', color: '#991b1b' },
  default:  { bg: 'var(--color-border)', color: 'var(--color-text-secondary)' },
};

interface StatusBadgeProps {
  variant?: Variant;
  children: ReactNode;
}

export function StatusBadge({ variant = 'default', children }: StatusBadgeProps) {
  const { bg, color } = variantStyles[variant] ?? variantStyles.default;
  return (
    <span
      className="inline-block rounded px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  );
}
