import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer } from '../charts/ChartContainer';

const COLORS = {
  primary: 'var(--sr-primary)',
  grid: 'var(--sr-line)',
  ink: 'var(--sr-ink-secondary)',
};

export function BarChartPanel({
  title,
  description,
  data,
  valueLabel = 'Value',
  loading,
}: {
  title: string;
  description?: string;
  data: { label: string; value: number }[];
  valueLabel?: string;
  loading?: boolean;
}) {
  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      empty={!loading && data.length === 0}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: COLORS.ink, fontSize: 11 }}
            axisLine={{ stroke: COLORS.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: COLORS.ink, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            formatter={(v) => [v as number, valueLabel]}
            contentStyle={{
              background: 'var(--sr-bg-elevated)',
              border: '1px solid var(--sr-line)',
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" fill={COLORS.primary} radius={[2, 2, 0, 0]} name={valueLabel} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
