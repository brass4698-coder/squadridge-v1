import { cn } from '../../lib/cn';
import { statusBadgeLabel, type ImplementationStatus } from '../../data/implementationStatus';

type ImplementationStatusBadgeProps = {
  status: ImplementationStatus;
  className?: string;
  /** Compact = label only; default includes status word. */
  size?: 'sm' | 'md';
};

/**
 * Consistent LIVE / SCAFFOLDED / PLANNED badge — Home, Security, How It Works, Ledger.
 */
export function ImplementationStatusBadge({
  status,
  className,
  size = 'md',
}: ImplementationStatusBadgeProps) {
  const label = statusBadgeLabel(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono uppercase tracking-[var(--tracking-caps)]',
        size === 'sm' ? 'text-[0.625rem]' : 'text-[length:var(--text-label)]',
        status === 'live' && 'sr-verify',
        status === 'scaffolded' && 'text-sem-warning',
        status === 'planned' && 'text-ink-faint',
        className,
      )}
      data-status={status}
    >
      <span
        className={cn(
          'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
          status === 'live' &&
            'bg-[var(--sr-verify)] shadow-[0_0_0_2px_color-mix(in_oklch,var(--sr-verify)_28%,transparent)]',
          status === 'scaffolded' && 'bg-sem-warning',
          status === 'planned' && 'bg-ink-faint',
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}
