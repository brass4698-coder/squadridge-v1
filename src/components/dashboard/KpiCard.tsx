import { cn } from '../../lib/cn';

export function KpiCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-lg border border-line bg-surface-elevated px-4 py-4',
        className,
      )}
    >
      <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
        {label}
      </p>
      <p className="m-0 font-display text-2xl font-medium tabular-nums text-ink">{value}</p>
      {hint ? <p className="m-0 text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}
