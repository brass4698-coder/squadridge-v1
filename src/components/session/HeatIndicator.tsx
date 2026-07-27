/**
 * Quiet facilitator-only tension cue. Never shows public shame labels.
 * Color is paired with text for WCAG.
 */
export interface HeatIndicatorProps {
  tensionLevel: number | null | undefined;
  className?: string;
}

export function HeatIndicator({ tensionLevel, className = '' }: HeatIndicatorProps) {
  if (tensionLevel == null || Number.isNaN(tensionLevel)) {
    return (
      <span
        className={`font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint ${className}`}
      >
        —
      </span>
    );
  }

  const level = Math.max(0, Math.min(1, tensionLevel));
  const band = level >= 0.7 ? 'elevated' : level >= 0.4 ? 'notice' : 'calm';
  const tone =
    band === 'elevated'
      ? 'text-sem-warning'
      : band === 'notice'
        ? 'text-ink-secondary'
        : 'text-ink-faint';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${tone} ${className}`}
      title="Private tone cue from the author’s local check — not shown to the room"
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-sm ${
          band === 'elevated'
            ? 'bg-sem-warning'
            : band === 'notice'
              ? 'bg-ink-secondary'
              : 'bg-ink-faint'
        }`}
        aria-hidden
      />
      {band}
    </span>
  );
}
