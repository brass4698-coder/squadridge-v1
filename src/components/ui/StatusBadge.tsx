import { type ReactNode } from 'react';

type BadgeVariant =
  | 'released'
  | 'pending'
  | 'live'
  | 'archived'
  | 'draft'
  | 'approved'
  | 'declined'
  | 'warning'
  | 'neutral';

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  released: { bg: '#DCEDE3', color: '#2A5438' },
  pending:  { bg: '#FEF3E2', color: '#8A5C1A' },
  live:     { bg: '#DCEDE3', color: '#2A5438' },
  archived: { bg: '#ECEAE6', color: '#6B6560' },
  draft:    { bg: '#E8EEF5', color: '#2B4D6F' },
  approved: { bg: '#DCEDE3', color: '#2A5438' },
  declined: { bg: '#F5DCDC', color: '#7A2020' },
  warning:  { bg: '#FEF3E2', color: '#8A5C1A' },
  neutral:  { bg: '#ECEAE6', color: '#6B6560' },
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  const styles = variantStyles[variant];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: styles.bg, color: styles.color }}
    >
      {children}
    </span>
  );
}
