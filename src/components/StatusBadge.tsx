import type { ReactNode } from 'react';
import { Badge, type BadgeProps } from './ui/Badge';
import { cn } from '../lib/cn';

export type StatusBadgeVariant =
  | 'private'
  | 'published'
  | 'governed'
  | 'live'
  | 'illustrative'
  | 'anchor'
  | 'released'
  | 'verified';

const VARIANT_MAP: Record<StatusBadgeVariant, NonNullable<BadgeProps['variant']>> = {
  private: 'private',
  published: 'published',
  governed: 'governed',
  live: 'live',
  illustrative: 'outlined',
  anchor: 'verified',
  released: 'released',
  verified: 'verified',
};

/**
 * Marketing / ledger status pill — thin wrapper over the canonical Badge.
 * Verification accent reserved for anchor / live / verified / released.
 */
export function StatusBadge({
  variant,
  children,
  className,
}: {
  variant: StatusBadgeVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant={VARIANT_MAP[variant]}
      showDot={variant === 'anchor' || variant === 'live' || variant === 'verified'}
      className={cn(variant === 'illustrative' && 'border-dashed', className)}
    >
      {children}
    </Badge>
  );
}
