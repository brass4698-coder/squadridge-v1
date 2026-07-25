import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Shared mono caps label — one weight, one tracking token, one muted color.
 * Use for eyebrows inside cards/figures (not SectionLabel, which is Inter).
 * For registry metadata pairs prefer `.sr-meta-label` via MetaField.
 */
export function CapsLabel({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <p
      id={id}
      className={cn(
        'm-0 font-mono text-[length:var(--sr-meta-label-size,0.6875rem)] font-medium uppercase tracking-[var(--sr-meta-label-tracking,0.08em)] text-ink-faint',
        className,
      )}
    >
      {children}
    </p>
  );
}
