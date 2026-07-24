import { cn } from '../../lib/cn';

const SEGMENTS = [
  'Private session rooms',
  'Facilitator-governed release',
  'Approved outcomes only',
] as const;

const DOCTRINE_LABEL = SEGMENTS.join(' · ');

/**
 * Shared process doctrine line — used on buyer tracks and marketing surfaces.
 * Not a raw repeated string dump; styled as a compact instrument strip.
 */
export function ProcessDoctrine({
  className,
  compact = false,
}: {
  className?: string;
  /** Tighter padding for card footers */
  compact?: boolean;
}) {
  return (
    <p
      className={cn(
        'm-0 border border-line bg-surface-sunken/50 font-mono text-[length:var(--text-label)] uppercase tracking-[0.08em] text-ink-faint',
        compact ? 'px-3 py-2.5' : 'px-4 py-3',
        className,
      )}
      aria-label={DOCTRINE_LABEL}
    >
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {SEGMENTS.map((seg, i) => (
          <span key={seg} className="inline-flex items-center gap-x-2">
            {i > 0 ? (
              <span aria-hidden className="text-ink-faint/70">
                ·
              </span>
            ) : null}
            <span>{seg}</span>
          </span>
        ))}
      </span>
    </p>
  );
}
