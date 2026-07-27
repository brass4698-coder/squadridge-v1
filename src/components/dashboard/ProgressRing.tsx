import { ChartContainer } from '../charts/ChartContainer';

export function ProgressRing({
  title,
  description,
  segments,
  centerLabel,
}: {
  title: string;
  description?: string;
  segments: { label: string; value: number; color?: string }[];
  centerLabel?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  const arcs = segments.map((seg, i) => {
    const len = (seg.value / total) * c;
    const offset = segments.slice(0, i).reduce((sum, s) => sum + (s.value / total) * c, 0);
    return {
      ...seg,
      dash: `${len} ${c - len}`,
      offset,
      stroke: seg.color ?? `color-mix(in oklch, var(--sr-primary) ${70 - i * 15}%, transparent)`,
    };
  });

  return (
    <ChartContainer
      title={title}
      description={description}
      empty={segments.length === 0}
      height={220}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <svg width="120" height="120" viewBox="0 0 120 120" className="shrink-0" aria-hidden>
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--sr-line)" strokeWidth="10" />
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={arc.stroke}
              strokeWidth="10"
              strokeDasharray={arc.dash}
              strokeDashoffset={-arc.offset}
              transform="rotate(-90 60 60)"
            />
          ))}
          {centerLabel ? (
            <text
              x="60"
              y="64"
              textAnchor="middle"
              className="fill-[var(--sr-ink)] text-sm font-medium"
            >
              {centerLabel}
            </text>
          ) : null}
        </svg>
        <ul className="m-0 list-none space-y-2 p-0 text-sm" aria-label={title}>
          {segments.map((seg) => (
            <li key={seg.label} className="flex justify-between gap-6 text-ink-secondary">
              <span>{seg.label}</span>
              <span className="font-mono tabular-nums text-ink">{seg.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartContainer>
  );
}
