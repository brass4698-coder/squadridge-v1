import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartContainer } from './ChartContainer';

const PALETTE = [
  'var(--sr-primary)',
  'var(--sr-info)',
  'var(--sr-warning)',
  'var(--sr-success)',
  'var(--sr-danger)',
];

type Slice = { name: string; value: number };

type DonutChartCardProps = {
  title: string;
  description?: string;
  data: Slice[];
  loading?: boolean;
  error?: string | null;
};

export function DonutChartCard({ title, description, data, loading, error }: DonutChartCardProps) {
  const empty = !loading && !error && data.every((d) => d.value === 0);

  return (
    <ChartContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      empty={empty}
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--sr-bg-elevated)',
              border: '1px solid var(--sr-line)',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: 'var(--sr-ink-secondary)' }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
