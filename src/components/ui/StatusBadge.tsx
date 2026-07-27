import { type ReactNode } from 'react';
import { Badge, type BadgeProps } from './Badge';

type StatusBadgeProps = {
  variant?: BadgeProps['variant'];
  tone?: BadgeProps['variant'];
  className?: string;
  children: ReactNode;
};

export function StatusBadge({ variant, tone, className, children }: StatusBadgeProps) {
  const activeVariant = variant ?? tone ?? 'default';
  return (
    <Badge variant={activeVariant} className={className}>
      {children}
    </Badge>
  );
}
