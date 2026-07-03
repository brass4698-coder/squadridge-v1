import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded px-2.5 py-0.5 text-app-meta font-semibold uppercase tracking-wide',
  {
    variants: {
      variant: {
        default: 'bg-surface-secondary text-ink-secondary',
        brand: 'bg-brand-soft text-brand',
        success: 'bg-sem-success-soft text-sem-success',
        warning: 'bg-sem-warning-soft text-sem-warning',
        danger: 'bg-sem-danger-soft text-sem-danger',
        info: 'bg-sem-info-soft text-sem-info',
        live: 'bg-sem-success-soft text-sem-success',
        pending: 'bg-sem-warning-soft text-sem-warning',
        draft: 'bg-surface-secondary text-ink-faint',
        released: 'bg-brand-soft text-brand',
        archived: 'bg-surface-secondary text-ink-faint',
        approved: 'bg-sem-success-soft text-sem-success',
        declined: 'bg-sem-danger-soft text-sem-danger',
        verified: 'bg-sem-success-soft text-sem-success',
        denied: 'bg-sem-danger-soft text-sem-danger',
        paused: 'bg-sem-warning-soft text-sem-warning',
        closed: 'bg-surface-secondary text-ink-faint',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export type BadgeProps = VariantProps<typeof badgeVariants> & {
  className?: string;
  children: ReactNode;
};

export function Badge({ variant, className, children }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))}>{children}</span>;
}
