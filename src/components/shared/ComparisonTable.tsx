import { CheckCircle2, X } from 'lucide-react';

export interface ComparisonRow {
  aspect: string;
  squadridge: string;
  others: string;
}

export interface ComparisonTableProps {
  rows: ComparisonRow[];
}

export function ComparisonTable({ rows }: ComparisonTableProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-surface-elevated shadow-sr-sm"
      role="region"
      aria-label="Comparison of SquadRidge and standard tools"
    >
      <div className="grid grid-cols-[1.1fr_1.3fr_1.3fr] border-b border-line bg-surface-secondary text-xs font-semibold text-ink-faint">
        <span className="px-5 py-3.5 md:px-7">Aspect</span>
        <span className="flex items-center gap-2 border-l border-line bg-brand-soft px-5 py-3.5 text-brand md:px-7">
          <span aria-hidden className="inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
          SquadRidge
        </span>
        <span className="border-l border-line px-5 py-3.5 md:px-7">Standard tools</span>
      </div>

      {rows.map((row) => (
        <div
          key={row.aspect}
          className="grid grid-cols-[1.1fr_1.3fr_1.3fr] border-b border-line last:border-b-0"
        >
          <p className="px-5 py-3.5 text-sm font-medium text-ink md:px-7">{row.aspect}</p>
          <p className="flex items-start gap-2 border-l border-line bg-brand-soft px-5 py-3.5 text-sm text-ink md:px-7">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            {row.squadridge}
          </p>
          <p className="flex items-start gap-2 border-l border-line px-5 py-3.5 text-sm text-ink-secondary md:px-7">
            <X className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-hidden />
            {row.others}
          </p>
        </div>
      ))}
    </div>
  );
}
