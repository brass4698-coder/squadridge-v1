import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Shared frame for marketing figures — radius, border, sunken ground, optional caption.
 * No cinematic shadow flourish; shadow-sm only when needed for raster photos.
 */
export function FigureFrame({
  children,
  caption,
  className,
  shadowed = false,
  'aria-label': ariaLabel,
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
  /** Soft shadow for photographic / raster frames only */
  shadowed?: boolean;
  'aria-label'?: string;
}) {
  return (
    <figure
      aria-label={ariaLabel}
      className={cn(
        'm-0 overflow-hidden rounded-[var(--sr-radius-lg)] border border-line bg-surface-sunken/40',
        shadowed && 'shadow-[var(--sr-shadow-sm)]',
        className,
      )}
    >
      {children}
      {caption ? (
        <figcaption className="border-t border-line px-5 py-3 text-center font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
