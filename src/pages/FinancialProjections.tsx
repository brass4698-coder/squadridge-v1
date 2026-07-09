// ============================================================
// FinancialProjections — Investor-facing dashboard
// Issue #48 | Route: /financial-projections
// Access: super_admin | institution_admin | analyst
// ============================================================
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
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { ProjectionRow, KpiSummary } from '../types/financialProjections';
import type { RoleKey } from '../types/roles';

// Roles permitted to view this page (mirrors RLS policy)
const INVESTOR_ROLES: RoleKey[] = ['super_admin', 'institution_admin', 'analyst'];

type Scenario = 'baseline' | 'optimistic' | 'conservative';

const SCENARIO_LABELS: Record<Scenario, string> = {
  baseline: 'Baseline',
  optimistic: 'Optimistic',
  conservative: 'Conservative',
};

// Nexus palette accent per scenario
const SCENARIO_COLOR: Record<Scenario, string> = {
  baseline:     '#01696f', // Hydra Teal
  optimistic:   '#437a22', // Gridania Green
  conservative: '#964219', // Terra Brown
};

function formatUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function deriveKpis(rows: ProjectionRow[]): KpiSummary {
  const last = rows[rows.length - 1];
  const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue_usd), 0);
  return {
    arr:            last ? Number(last.arr_usd)        : 0,
    totalRevenue,
    peakMau:        last ? last.mau                    : 0,
    runwayMonths:   last ? (last.runway_months ?? 0)   : 0,
  };
}

// ── Skeleton loader ──────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`}
      aria-hidden="true"
    />
  );
}

export function FinancialProjections() {
  const { roles } = useAuth();
  const [scenario, setScenario]   = useState<Scenario>('baseline');
  const [rows,     setRows]       = useState<ProjectionRow[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState<string | null>(null);

  // Client-side role guard (mirrors RLS — defence-in-depth)
  const hasAccess = roles.some((r) => INVESTOR_ROLES.includes(r.role_key));

  useEffect(() => {
    if (!hasAccess) return;
    setLoading(true);
    setError(null);

    supabase
      .from('financial_projections')
      .select('*')
      .eq('scenario', scenario)
      .order('period_start', { ascending: true })
      .then(({ data, error: sbError }) => {
        if (sbError) {
          setError(sbError.message);
        } else {
          setRows(data ?? []);
        }
        setLoading(false);
      });
  }, [scenario, hasAccess]);

  // ── Access denied ────────────────────────────────────────
  if (!hasAccess) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
          Access Restricted
        </p>
        <p className="max-w-sm text-slate-500">
          Financial projections are available to institution admins and analysts.
          Contact your SquadRidge administrator to request access.
        </p>
      </main>
    );
  }

  const kpis   = deriveKpis(rows);
  const color  = SCENARIO_COLOR[scenario];
  const scenarios: Scenario[] = ['baseline', 'optimistic', 'conservative'];

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Financial Projections
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Investor-facing forecast · 2026 Q3 – 2027 Q4
          </p>
        </div>

        {/* Scenario tabs */}
        <div
          role="tablist"
          aria-label="Projection scenario"
          className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800"
        >
          {scenarios.map((s) => (
            <button
              key={s}
              role="tab"
              aria-selected={scenario === s}
              onClick={() => setScenario(s)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                scenario === s
                  ? 'bg-white shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {SCENARIO_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI strip ──────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
              <Skeleton className="mb-2 h-3 w-24" />
              <Skeleton className="h-7 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Projected ARR (EOY)',   value: formatUSD(kpis.arr) },
            { label: 'Total Period Revenue',  value: formatUSD(kpis.totalRevenue) },
            { label: 'Peak MAU',              value: kpis.peakMau.toLocaleString() },
            { label: 'Runway (months)',        value: kpis.runwayMonths.toString() },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Error state ────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          Failed to load projections: {error}
        </div>
      )}

      {/* ── ARR Over Time ──────────────────────────────── */}
      {!loading && !error && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-200">
            ARR Over Time
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="arrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period_label" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatUSD} tick={{ fontSize: 12 }} width={56} />
              <Tooltip formatter={(v: number) => formatUSD(v)} />
              <Area
                type="monotone"
                dataKey="arr_usd"
                name="ARR"
                stroke={color}
                strokeWidth={2}
                fill="url(#arrGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* ── MAU vs Revenue ─────────────────────────────── */}
      {!loading && !error && (
        <section>
          <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-200">
            MAU vs Monthly Revenue
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="period_label" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left"  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} width={48} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={formatUSD} tick={{ fontSize: 12 }} width={56} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left"  dataKey="mau"         name="MAU"     fill={color}    fillOpacity={0.8} radius={[4,4,0,0]} />
              <Bar yAxisId="right" dataKey="revenue_usd" name="Revenue" fill="#64748b" fillOpacity={0.6} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </main>
  );
}
