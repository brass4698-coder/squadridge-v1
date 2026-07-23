import { ChartContainer } from '../charts/ChartContainer';

export type FunnelStep = { label: string; value: number };

export function FunnelChartPanel({
  title,
  description,
  steps,
  loading,
}: {
  title: string;
  description?: string;
  steps: FunnelStep[];
  loading?: boolean;
}) {
  const max = Math.max(...steps.map((s) => s.value), 1);

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      empty={steps.length === 0}
    >
      <ol className="m-0 flex list-none flex-col gap-3 p-0" aria-label={title}>
        {steps.map((step) => (
          <li key={step.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-ink-secondary">{step.label}</span>
              <span className="font-mono tabular-nums text-ink">{step.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-sm bg-surface-sunken" role="presentation">
              <div
                className="h-full rounded-sm bg-brand/80 motion-safe:transition-[width] motion-safe:duration-500"
                style={{ width: `${Math.round((step.value / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
    </ChartContainer>
  );
}
