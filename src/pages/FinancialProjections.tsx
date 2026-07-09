/**
 * FinancialProjections.tsx
 * Route: /financial-projections
 * Investor-facing dashboard — Issue #48
 *
 * Renders three forecast scenarios (Baseline / Optimistic / Conservative)
 * using Recharts. Data is fetched from Supabase `financial_projections` table
 * which is protected by RLS (investor role required).
 */

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '@/lib/supabaseClient';
import type {
  ProjectionScenario,
  ProjectionRow,
  KpiSummary,
} from '@/types/financialProjections';

// ─── Scenario config ──────────────────────────────────────────────────────────

const SCENARIOS: { key: ProjectionScenario; label: string; color: string }[] = [
  { key: 'baseline',    label: 'Baseline',    color: '#01696f' }, // Hydra Teal
  { key: 'optimistic', label: 'Optimistic',  color: '#437a22' }, // Gridania Green
  { key: 'conservative', label: 'Conservative', color: '#964219' }, // Terra Brown
];

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Scenario tab bar ─────────────────────────────────────────────────────────

function ScenarioTabs({
  active,
  onChange,
}: {
  active: ProjectionScenario;
  onChange: (s: ProjectionScenario) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Forecast scenarios"
      className="inline-flex rounded-md border border-border bg-surface-offset p-1 gap-1"
    >
      {SCENARIOS.map(({ key, label }) => (
        <button
          key={key}
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          className={[
            'rounded px-4 py-1.5 text-sm font-medium transition-colors',
            active === key
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FinancialProjections() {
  const [scenario, setScenario] = useState<ProjectionScenario>('baseline');
  const [rows, setRows] = useState<ProjectionRow[]>([]);
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scenarioConfig = SCENARIOS.find((s) => s.key === scenario)!;

  useEffect(() => {
    async function fetchProjections() {
      setLoading(true);
      setError(null);

      const { data, error: sbError } = await supabase
        .from('financial_projections')
        .select('*')
        .eq('scenario', scenario)
        .order('period_label', { ascending: true });

      if (sbError) {
        setError(sbError.message);
        setLoading(false);
        return;
      }

      const typed = (data ?? []) as ProjectionRow[];
      setRows(typed);

      // Derive KPIs from the fetched rows
      if (typed.length > 0) {
        const last = typed[typed.length - 1];
        const totalArr = typed.reduce((acc, r) => acc + r.arr_usd, 0);
        setKpis({
          projected_arr: last.arr_usd,
          total_revenue: totalArr,
          peak_mau: Math.max(...typed.map((r) => r.mau)),
          runway_months: last.runway_months ?? null,
        });
      } else {
        setKpis(null);
      }

      setLoading(false);
    }

    fetchProjections();
  }, [scenario]);

  return (
    <main className="mx-auto max-w-screen-xl px-4 py-10 sm:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Financial Projections</h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          Investor-facing forecast across three growth scenarios. Data sourced from
          Supabase <code className="rounded bg-surface-offset px-1 py-0.5 text-xs">financial_projections</code> table
          (RLS: investor role required).
        </p>
      </div>

      {/* Scenario selector */}
      <div className="mb-6">
        <ScenarioTabs active={scenario} onChange={setScenario} />
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-surface-offset" />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <strong>Error loading projections:</strong> {error}
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* KPI strip */}
          {kpis ? (
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Projected ARR (EOY)"
                value={`$${(kpis.projected_arr / 1_000_000).toFixed(2)}M`}
                sub={`${scenarioConfig.label} scenario`}
              />
              <KpiCard
                label="Total Revenue (Period)"
                value={`$${(kpis.total_revenue / 1_000).toFixed(0)}K`}
              />
              <KpiCard
                label="Peak MAU"
                value={kpis.peak_mau.toLocaleString()}
                sub="Monthly active users"
              />
              <KpiCard
                label="Runway"
                value={kpis.runway_months != null ? `${kpis.runway_months} mo` : 'N/A'}
                sub="At current burn rate"
              />
            </div>
          ) : (
            <div className="mb-8 rounded-lg border border-border bg-surface p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No projection data for the <strong>{scenarioConfig.label}</strong> scenario yet.
              </p>
            </div>
          )}

          {/* ARR Area chart */}
          {rows.length > 0 && (
            <div className="mb-8 rounded-lg border border-border bg-surface p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">ARR Over Time</h2>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={rows} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="arrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={scenarioConfig.color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={scenarioConfig.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="period_label"
                    tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'ARR']}
                    contentStyle={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      fontSize: '13px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="arr_usd"
                    stroke={scenarioConfig.color}
                    strokeWidth={2}
                    fill="url(#arrGradient)"
                    name="ARR (USD)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MAU + Revenue bar chart */}
          {rows.length > 0 && (
            <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">MAU vs Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={rows} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="period_label"
                    tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `$${(v / 1_000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      fontSize: '13px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="mau" name="MAU" fill={scenarioConfig.color} radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue_usd" name="Revenue (USD)" fill="#006494" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </main>
  );
}
