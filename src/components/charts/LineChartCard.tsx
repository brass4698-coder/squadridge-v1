import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';

const CHART_COLORS = {
  primary: 'var(--sr-primary)',
  grid: 'var(--sr-line)',
  ink: 'var(--sr-ink-secondary)',
};

type Point = { label: string; value: number };

type LineChartCardProps = {
  title: string;
  description?: string;
  data: Point[];
  loading?: boolean;
  error?: string | null;
  valueLabel?: string;
};

export function LineChartCard({
  title,
  description,
  data,
  loading,
  error,
  valueLabel = 'Value',
}: LineChartCardProps) {
  const empty = !loading && !error && data.length === 0;

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      empty={empty}
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_COLORS.ink, fontSize: 11 }}
            axisLine={{ stroke: CHART_COLORS.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: CHART_COLORS.ink, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--sr-bg-elevated)',
              border: '1px solid var(--sr-line)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--sr-ink)' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            name={valueLabel}
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_COLORS.primary }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
