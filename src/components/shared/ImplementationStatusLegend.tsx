import {
  IMPLEMENTATION_STATUS_LEGEND,
  IMPLEMENTATION_STATUS_LEGEND_LIVE_FOCUS,
} from '../../data/implementationStatus';
import { cn } from '../../lib/cn';

export type ImplementationStatusLegendProps = {
  /** `full` for Live + scaffolded + planned; `liveFocus` when only Live badges are shown. */
  variant?: 'full' | 'liveFocus';
  className?: string;
};

/**
 * Compact one-line key for ImplementationStatusBadge vocabulary.
 * Place once near the first public badge cluster on a page.
 */
export function ImplementationStatusLegend({
  variant = 'full',
  className,
}: ImplementationStatusLegendProps) {
  const text =
    variant === 'liveFocus'
      ? IMPLEMENTATION_STATUS_LEGEND_LIVE_FOCUS
      : IMPLEMENTATION_STATUS_LEGEND;

  return (
    <p
      className={cn(
        'm-0 max-w-measure font-mono text-[length:var(--text-label)] leading-relaxed tracking-[0.02em] text-ink-faint',
        className,
      )}
      role="note"
    >
      {text}
    </p>
  );
}
