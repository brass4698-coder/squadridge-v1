import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type StatusBadgeVariant =
  | 'private'
  | 'published'
  | 'governed'
  | 'live'
  | 'illustrative'
  | 'anchor';

/** Token-led badge surfaces — verification color stays rare. */
const styles: Record<StatusBadgeVariant, CSSProperties> = {
  private: {
    background: 'var(--color-badge-private, color-mix(in oklch, var(--sr-ink) 6%, transparent))',
    color: 'var(--color-badge-private-text, var(--sr-ink-secondary))',
  },
  published: {
    background: 'var(--color-badge-published, var(--sr-verify-soft, var(--sr-primary-soft)))',
    color: 'var(--color-badge-published-text, var(--sr-verify-ink, var(--sr-primary)))',
  },
  governed: {
    background: 'var(--sr-primary-soft)',
    color: 'var(--sr-primary-hover)',
  },
  live: {
    background: 'var(--sr-verify-soft, var(--sr-primary-soft))',
    color: 'var(--sr-verify-ink, var(--sr-primary))',
  },
  illustrative: {
    background: 'color-mix(in oklch, var(--sr-ink) 6%, transparent)',
    color: 'var(--sr-ink-faint)',
  },
  anchor: {
    background: 'var(--sr-verify-soft, var(--sr-primary-soft))',
    color: 'var(--sr-verify-ink, var(--sr-primary))',
  },
};

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
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 py-0.5 font-semibold uppercase text-[length:var(--text-label)] tracking-[var(--tracking-caps)]',
        className,
      )}
      style={styles[variant]}
    >
      {children}
    </span>
  );
}
