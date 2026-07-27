import { ChartContainer } from '../charts/ChartContainer';
import { cn } from '../../lib/cn';

export function HeatmapPanel({
  title,
  description,
  rows,
  cols,
  cells,
  loading,
}: {
  title: string;
  description?: string;
  rows: string[];
  cols: string[];
  /** row-major intensity 0–1 */
  cells: number[][];
  loading?: boolean;
}) {
  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      empty={rows.length === 0}
      height={280}
    >
      <div className="overflow-x-auto" role="table" aria-label={title}>
        <div
          className="inline-grid min-w-full gap-1"
          style={{
            gridTemplateColumns: `minmax(5rem,7rem) repeat(${cols.length}, minmax(2.5rem,1fr))`,
          }}
        >
          <div aria-hidden />
          {cols.map((c) => (
            <div
              key={c}
              className="px-1 text-center font-mono text-[0.65rem] uppercase tracking-wider text-ink-faint"
            >
              {c}
            </div>
          ))}
          {rows.map((row, ri) => (
            <div key={row} className="contents">
              <div className="flex items-center pr-2 text-xs text-ink-secondary">{row}</div>
              {cols.map((col, ci) => {
                const v = cells[ri]?.[ci] ?? 0;
                return (
                  <div
                    key={`${row}-${col}`}
                    role="cell"
                    title={`${row} · ${col}: ${Math.round(v * 100)}%`}
                    className={cn(
                      'aspect-square min-h-8 rounded-sm border border-line',
                      v > 0.75
                        ? 'bg-brand/70'
                        : v > 0.5
                          ? 'bg-brand/45'
                          : v > 0.25
                            ? 'bg-brand/25'
                            : 'bg-surface-sunken',
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
}
