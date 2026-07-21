import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Bulletproof label/value pair — never uses dt/dd (avoids UA + reset collisions).
 * Always stacks label above value with an explicit gap.
 */
export function MetaField({
  label,
  value,
  mono = false,
  className,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]">
        {label}
      </p>
      <p
        className={cn(
          'm-0 break-words text-sm leading-snug text-ink',
          mono && 'font-mono text-ink-secondary',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function MetaFieldGrid({
  children,
  columns = 2,
  className,
}: {
  children: ReactNode;
  columns?: 2 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-x-8 gap-y-6',
        columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2',
        className,
      )}
    >
      {children}
    </div>
  );
}
