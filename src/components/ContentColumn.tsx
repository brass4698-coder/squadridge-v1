import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/**
 * Constrains prose / table sections to the marketing content measure.
 */
export function ContentColumn({
  children,
  wide = false,
  className,
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn('w-full px-[var(--space-4)]', className)}
      style={{
        maxWidth: wide ? 'var(--content-wide)' : 'var(--content-narrow)',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {children}
    </div>
  );
}
