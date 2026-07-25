import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Shared mono caps label — one weight, one tracking token, one muted color.
 * Use for eyebrows inside cards/figures (not SectionLabel, which is Inter).
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
        'm-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint',
        className,
      )}
    >
      {children}
    </p>
  );
}
