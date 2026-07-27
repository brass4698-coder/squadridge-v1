import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Registry label/value pair — muted tracked label, dominant value.
 * Never uses dt/dd (avoids UA + reset collisions).
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
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <p className="sr-meta-label">{label}</p>
      <p className={cn('sr-meta-value', mono && 'sr-meta-value--mono')}>{value}</p>
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
        'grid gap-x-8 gap-y-5',
        columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2',
        className,
      )}
    >
      {children}
    </div>
  );
}
