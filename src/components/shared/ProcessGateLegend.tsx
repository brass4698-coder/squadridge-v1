import { PROCESS_GATE_LEGEND } from '../../data/implementationStatus';
import { cn } from '../../lib/cn';

export type ProcessGateLegendProps = {
  className?: string;
};

/**
 * Compact one-line key for ProcessStep gate badges (Open / Gated / Sealed / Released).
 */
export function ProcessGateLegend({ className }: ProcessGateLegendProps) {
  return (
    <p
      className={cn(
        'm-0 max-w-measure font-mono text-[length:var(--text-label)] leading-relaxed tracking-[0.02em] text-ink-faint',
        className,
      )}
      role="note"
    >
      {PROCESS_GATE_LEGEND}
    </p>
  );
}
