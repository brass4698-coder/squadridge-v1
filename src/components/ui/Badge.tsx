import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

/**
 * Standardized status / trust pill.
 * Translucent fill + hairline border — never solid flat fills.
 * Verification accent (#3FE0C5) reserved for verified / live / released states.
 */
const badgeVariants = cva(
  [
    'inline-flex items-center gap-1.5 rounded-full',
    'px-2.5 py-0.5',
    'font-mono text-[length:var(--text-label)] font-semibold uppercase',
    'tracking-[var(--sr-meta-label-tracking,0.08em)]',
    'border border-solid',
    'leading-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          'border-line bg-[color:var(--color-badge-private)] text-[color:var(--color-badge-private-text)]',
        brand: 'border-brand/30 bg-brand-soft text-brand',
        success: 'border-sem-success/30 bg-sem-success-soft text-sem-success',
        warning: 'border-sem-warning/30 bg-sem-warning-soft text-sem-warning',
        danger: 'border-sem-danger/30 bg-sem-danger-soft text-sem-danger',
        info: 'border-sem-info/30 bg-sem-info-soft text-sem-info',
        live: 'border-[color:var(--color-badge-verified-border)] bg-[color:var(--color-badge-verified)] text-[color:var(--color-badge-verified-text)]',
        pending: 'border-sem-warning/30 bg-sem-warning-soft text-sem-warning',
        draft: 'border-line bg-[color:var(--color-badge-private)] text-ink-faint',
        released:
          'border-[color:var(--color-badge-verified-border)] bg-[color:var(--color-badge-verified)] text-[color:var(--color-badge-verified-text)]',
        archived: 'border-line bg-[color:var(--color-badge-private)] text-ink-faint',
        approved: 'border-sem-success/30 bg-sem-success-soft text-sem-success',
        declined: 'border-sem-danger/30 bg-sem-danger-soft text-sem-danger',
        verified:
          'border-[color:var(--color-badge-verified-border)] bg-[color:var(--color-badge-verified)] text-[color:var(--color-badge-verified-text)]',
        denied: 'border-sem-danger/30 bg-sem-danger-soft text-sem-danger',
        paused: 'border-sem-warning/30 bg-sem-warning-soft text-sem-warning',
        closed: 'border-line bg-[color:var(--color-badge-private)] text-ink-faint',
        private:
          'border-line bg-[color:var(--color-badge-private)] text-[color:var(--color-badge-private-text)]',
        published:
          'border-line bg-[color:var(--color-badge-published)] text-[color:var(--color-badge-published-text)]',
        governed: 'border-brand/30 bg-brand-soft text-brand',
        outlined: 'border-line bg-transparent text-ink-secondary',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const VERIFY_DOT_VARIANTS = new Set(['verified', 'released', 'live', 'approved']);

export type BadgeProps = VariantProps<typeof badgeVariants> & {
  className?: string;
  children: ReactNode;
  /** Show verification pulse-dot (auto for verified/live/released). */
  showDot?: boolean;
};

export function Badge({ variant, className, children, showDot }: BadgeProps) {
  const resolved = variant ?? 'default';
  const withDot = showDot ?? VERIFY_DOT_VARIANTS.has(resolved);
  return (
    <span className={cn(badgeVariants({ variant: resolved }), className)}>
      {withDot ? <span className="sr-verify-dot sr-verify-dot--pulse" aria-hidden /> : null}
      {children}
    </span>
  );
}

export { badgeVariants };
