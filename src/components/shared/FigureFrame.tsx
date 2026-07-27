import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Shared frame for marketing figures — elevated surface + soft shadow.
 * No full-rectangle chrome borders; hairline only on caption divider.
 */
export function FigureFrame({
  children,
  caption,
  className,
  shadowed = true,
  'aria-label': ariaLabel,
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
  /** Soft card shadow (default on for elevation grammar) */
  shadowed?: boolean;
  'aria-label'?: string;
}) {
  return (
    <figure
      aria-label={ariaLabel}
      className={cn(
        'm-0 overflow-hidden rounded-[var(--sr-radius-lg)] bg-surface-elevated',
        shadowed && 'shadow-sr-card',
        className,
      )}
    >
      {children}
      {caption ? (
        <figcaption className="border-t border-line px-5 py-3 text-center font-mono text-[length:var(--text-label)] uppercase tracking-[0.08em] text-ink-faint">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
