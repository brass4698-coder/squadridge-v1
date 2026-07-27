import type { ReactNode } from 'react';

interface InstitutionalVisualFrameProps {
  children: ReactNode;
  /** Accessible name when the frame is decorative context for a labeled figure */
  ariaLabel?: string;
  className?: string;
  aspect?: 'video' | 'square' | 'wide' | 'auto';
}

/**
 * `wide` applies only from `md:` up — stacked schematic content is taller
 * than 16:7 on phones and would be clipped by the fixed ratio.
 */
const aspectClass = {
  video: 'aspect-[4/3]',
  square: 'aspect-square',
  wide: 'md:aspect-[16/7]',
  auto: '',
} as const;

/**
 * Contained visual surface — grid atmosphere, layered border, no decorative fluff.
 */
export function InstitutionalVisualFrame({
  children,
  ariaLabel,
  className = '',
  aspect = 'video',
}: InstitutionalVisualFrameProps) {
  return (
    <div
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      className={`institutional-visual-frame relative overflow-hidden border border-line bg-surface-elevated ${aspectClass[aspect]} ${className}`}
    >
      <div
        className="institutional-grid-backdrop pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div
        className="institutional-visual-vignette pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div className="relative flex h-full w-full items-center justify-center p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
