/**
 * FinancialProjectionsPage
 *
 * Investor-facing financial projections view.  Reuses `buildFinancialModel` /
 * `formatUsd` from the pitch-deck-hub engine and the store's `assumptions` +
 * `activeScenario`.  Gated behind RequireAuth; lives at /financial-projections.
 *
 * Design: mirrors PitchDeckHubPage dark aesthetic — #0a0f1a bg, teal accent.
 */

import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  CircleDollarSign,
  Flame,
  Info,
  Layers,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildFinancialModel, formatUsd } from '../pitch-deck-hub/financialEngine';
import { usePitchDeckHubStore } from '../pitch-deck-hub/usePitchDeckHubStore';
import type { FinancialScenario, MonthlyFinancialRow } from '../pitch-deck-hub/types';
import { cn } from '../lib/cn';

// ---------------------------------------------------------------------------
// Small shared primitives
// ---------------------------------------------------------------------------

function Badge({
  children,
  variant = 'neutral',
}: {
  children: React.ReactNode;
  variant?: 'neutral' | 'teal' | 'amber' | 'danger';
}) {
  const styles = {
    neutral: 'border-white/[0.08] bg-white/[0.04] text-[#cbd5e1]',
    teal: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
    amber: 'border-amber-400/35 bg-amber-400/10 text-amber-300',
    danger: 'border-red-500/35 bg-red-500/10 text-red-300',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.1em]',
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]',
        accent
          ? 'border-teal-500/30 bg-[linear-gradient(155deg,rgba(0,194,178,0.07),rgba(8,12,20,0.96))]'
          : 'border-white/[0.07] bg-[linear-gradient(165deg,rgba(18,26,46,0.9),rgba(8,12,20,0.96))]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-sans text-[0.72rem] font-medium uppercase tracking-[0.1em] text-[#64748b]">
          {label}
        </p>
        <Icon
          className={cn('size-4 shrink-0', accent ? 'text-teal-400/70' : 'text-[#334155]')}
          aria-hidden
        />
      </div>
      <p
        className={cn(
          'font-heading text-[1.7rem] font-extrabold tabular-nums leading-none',
          accent ? 'text-teal-200' : 'text-[#f1f5f9]',
        )}
      >
        {value}
      </p>
      {sub ? <p className="font-sans text-[0.75rem] text-[#64748b]">{sub}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline SVG sparkline
// ---------------------------------------------------------------------------

function Sparkline({
  data,
  width = 280,
  height = 56,
  color = '#2dd4bf',
  fill = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 3;
  const uw = width - pad * 2;
  const uh = height - pad * 2;

  const pts = data.map((v, i) => [
    pad + (i / (data.length - 1)) * uw,
    pad + uh - ((v - min) / range) * uh,
  ]);

  const line = pts
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const area = fill
    ? `${line} L${pts[pts.length - 1][0].toFixed(1)},${(pad + uh).toFixed(1)} L${pts[0][0].toFixed(1)},${(pad + uh).toFixed(1)} Z`
    : null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden
      className="w-full overflow-visible"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill="url(#spark-fill)" />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Bar chart
// ---------------------------------------------------------------------------

type BarSeries = { label: string; color: string; values: number[] };

function BarChart({
  labels,
  series,
  height = 180,
}: {
  labels: string[];
  series: BarSeries[];
  height?: number;
}) {
  const allVals = series.flatMap((s) => s.values);
  const maxVal = Math.max(...allVals, 1);
  const barCount = labels.length;
  const groupW = 100 / barCount;
  const barW = (groupW * 0.8) / series.length;
  const barGap = groupW * 0.04;
  const groupOffset = groupW * 0.1;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1="0"
            x2="100"
            y1={`${(1 - t) * 100}`}
            y2={`${(1 - t) * 100}`}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.4"
          />
        ))}
        {labels.map((_, gi) => {
          const gx = gi * groupW + groupOffset;
          return series.map((s, si) => {
            const val = s.values[gi] ?? 0;
            const barH = Math.max(0, (val / maxVal) * 96);
            const bx = gx + si * (barW + barGap);
            return (
              <rect
                key={`${gi}-${si}`}
                x={bx}
                y={100 - barH}
                width={barW}
                height={barH}
                rx="0.8"
                fill={s.color}
                opacity="0.85"
              />
            );
          });
        })}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-around translate-y-5">
        {labels.map((l) => (
          <span key={l} className="font-sans text-[0.6rem] text-[#475569] tabular-nums">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monthly table — uses real MonthlyFinancialRow field names
// ---------------------------------------------------------------------------

function MonthlyTable({ rows }: { rows: MonthlyFinancialRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rows : rows.slice(0, 12);
  const th =
    'py-2 px-3 text-left font-sans text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[#475569]';
  const td = 'py-2 px-3 font-sans text-[0.78rem] tabular-nums';

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.07]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-[#060b13]">
              <th className={th}>Month</th>
              <th className={cn(th, 'text-right')}>Revenue</th>
              <th className={cn(th, 'text-right')}>Payroll</th>
              <th className={cn(th, 'text-right')}>Non-Payroll Opex</th>
              <th className={cn(th, 'text-right')}>Total Opex</th>
              <th className={cn(th, 'text-right')}>Net</th>
              <th className={cn(th, 'text-right')}>Cash End</th>
              <th className={cn(th, 'text-right')}>Seats</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr
                key={r.label}
                className={cn(
                  'border-b border-white/[0.04] transition-colors',
                  i % 2 === 0 ? 'bg-[#07090f]' : 'bg-[#060b13]',
                  r.operatingIncomeUsd < 0 ? 'text-red-400' : 'text-[#cbd5e1]',
                )}
              >
                <td className={cn(td, 'text-[#94a3b8]')}>{r.label}</td>
                <td className={cn(td, 'text-right text-teal-400')}>{formatUsd(r.revenueUsd)}</td>
                <td className={cn(td, 'text-right text-[#94a3b8]')}>{formatUsd(r.payrollUsd)}</td>
                <td className={cn(td, 'text-right text-[#94a3b8]')}>
                  {formatUsd(r.nonPayrollOpexUsd)}
                </td>
                <td className={cn(td, 'text-right text-red-400')}>{formatUsd(r.totalOpexUsd)}</td>
                <td
                  className={cn(
                    td,
                    'text-right font-semibold',
                    r.operatingIncomeUsd >= 0 ? 'text-teal-300' : 'text-red-400',
                  )}
                >
                  {r.operatingIncomeUsd >= 0 ? '+' : ''}
                  {formatUsd(r.operatingIncomeUsd)}
                </td>
                <td
                  className={cn(
                    td,
                    'text-right',
                    r.cashEndUsd < 0 ? 'text-red-400' : 'text-[#e2e8f0]',
                  )}
                >
                  {formatUsd(r.cashEndUsd)}
                </td>
                <td className={cn(td, 'text-right text-[#94a3b8]')}>
                  {r.payingSeats.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 12 && (
        <button
          type="button"
          onClick={() => setExpanded((x) => !x)}
          className="flex w-full items-center justify-center gap-2 border-t border-white/[0.06] bg-[#060b13] py-3 font-sans text-[0.75rem] text-[#64748b] transition-colors hover:text-[#94a3b8]"
        >
          <ChevronDown
            className={cn('size-3.5 transition-transform', expanded && 'rotate-180')}
            aria-hidden
          />
          {expanded ? 'Show less' : `Show all ${rows.length} months`}
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scenario config — matches FinancialScenario union exactly
// ---------------------------------------------------------------------------

const SCENARIO_LABELS: Record<FinancialScenario, string> = {
  conservative: 'Conservative',
  base: 'Base case',
  aggressive: 'Aggressive',
};

const SCENARIO_BADGE: Record<FinancialScenario, 'amber' | 'teal' | 'neutral'> = {
  conservative: 'amber',
  base: 'teal',
  aggressive: 'neutral',
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function FinancialProjectionsPage() {
  // Correct store destructure: state.assumptions + state.activeScenario
  const { state, setActiveScenario } = usePitchDeckHubStore();
  const { assumptions, activeScenario } = state;

  // Local override so the toggle is instant; also persists to store
  const [scenario, setScenarioLocal] = useState<FinancialScenario>(activeScenario);

  function handleScenario(s: FinancialScenario) {
    setScenarioLocal(s);
    setActiveScenario(s);
  }

  // Engine called with both required args: buildFinancialModel(assumptions, scenario)
  const model = useMemo(() => buildFinancialModel(assumptions, scenario), [assumptions, scenario]);

  const monthRows = model.monthly;

  // Chart data — use correct field names (revenue data unused pending chart update)
  const burnData = monthRows.map((r) => r.totalOpexUsd);
  const cashData = monthRows.map((r) => r.cashEndUsd);

  // Bar chart (every 2nd month)
  const barLabels = monthRows.filter((_, i) => i % 2 === 0).map((r) => r.label.replace(/^.* /, ''));
  const barRevenue = monthRows.filter((_, i) => i % 2 === 0).map((r) => r.revenueUsd);
  const barBurn = monthRows.filter((_, i) => i % 2 === 0).map((r) => r.totalOpexUsd);

  // Headline KPIs — use engine-computed fields directly
  const finalMonth = monthRows[monthRows.length - 1];
  const arr = (finalMonth?.revenueUsd ?? 0) * 12;

  const runwayLabel =
    model.runwayMonthsFromStart === null
      ? '—'
      : model.runwayMonthsFromStart >= assumptions.monthlyHorizonMonths
        ? `${assumptions.monthlyHorizonMonths}+ mo`
        : model.runwayMonthsFromStart === 0
          ? '< 1 mo'
          : `${model.runwayMonthsFromStart} mo`;

  const breakEvenLabel =
    model.breakEvenMonthIndex === null
      ? 'Not in horizon'
      : (monthRows[model.breakEvenMonthIndex]?.label ?? `Month ${model.breakEvenMonthIndex}`);

  const peakBurn = Math.max(...burnData, 0);

  return (
    <div className="min-h-dvh bg-[#0a0f1a] pb-24 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0f1a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/pitch-deck-hub"
              className="flex items-center gap-1.5 font-sans text-[0.78rem] text-[#64748b] transition-colors hover:text-[#94a3b8]"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Pitch hub
            </Link>
            <span className="text-[#1e293b]" aria-hidden>
              /
            </span>
            <h1 className="font-heading text-[0.95rem] font-semibold text-[#f1f5f9]">
              Financial Projections
            </h1>
          </div>

          {/* Scenario toggle — only valid FinancialScenario values */}
          <div
            className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#060b13] p-1"
            role="group"
            aria-label="Projection scenario"
          >
            {(['conservative', 'base', 'aggressive'] as FinancialScenario[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleScenario(s)}
                className={cn(
                  'rounded-md px-3 py-1.5 font-sans text-[0.72rem] font-medium transition-colors',
                  scenario === s
                    ? 'bg-teal-500/15 text-teal-200'
                    : 'text-[#64748b] hover:text-[#94a3b8]',
                )}
                aria-pressed={scenario === s}
              >
                {SCENARIO_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="mx-auto max-w-[1200px] px-4 py-10 sm:px-8">
        {/* DataIntegrityLabel disclaimer */}
        <div className="mb-8 flex items-start gap-2.5 rounded-lg border border-amber-400/20 bg-amber-400/[0.05] px-4 py-3">
          <Info className="mt-0.5 size-3.5 shrink-0 text-amber-400/70" aria-hidden />
          <p className="font-sans text-[0.75rem] leading-relaxed text-amber-300/80">
            <span className="font-semibold">Scenario model</span> — these figures are illustrative
            projections generated from the assumptions below. They are not audited financials,
            historical actuals, or guarantees of future performance.
          </p>
        </div>

        {/* Scenario badge + meta */}
        <div className="mb-8 flex items-center gap-3">
          <Badge variant={SCENARIO_BADGE[scenario]}>{SCENARIO_LABELS[scenario]}</Badge>
          <p className="font-sans text-[0.78rem] text-[#475569]">
            {assumptions.monthlyHorizonMonths}-month horizon · starting cash{' '}
            {formatUsd(assumptions.startingCashUsd)} · ${assumptions.pricePerPilotSeatMonthUsd}
            /seat/mo
          </p>
        </div>

        {/* ── KPI grid ── */}
        <section aria-labelledby="kpi-heading">
          <h2 id="kpi-heading" className="sr-only">
            Key financial indicators
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <div className="col-span-2 sm:col-span-2">
              <KpiCard
                label="ARR (end of model)"
                value={formatUsd(arr)}
                sub={`${(finalMonth?.payingSeats ?? 0).toLocaleString()} paying seats`}
                icon={TrendingUp}
                accent
              />
            </div>
            <KpiCard label="Cash runway" value={runwayLabel} sub="from model start" icon={Flame} />
            <KpiCard
              label="Break-even month"
              value={breakEvenLabel}
              sub="first month net ≥ 0"
              icon={TrendingUp}
            />
            <KpiCard
              label="Peak monthly burn"
              value={formatUsd(peakBurn)}
              sub="highest single month"
              icon={CircleDollarSign}
            />
            <KpiCard
              label="Fundraising ask"
              value={formatUsd(assumptions.fundraisingAskUsd)}
              sub={assumptions.milestoneFirstTranche}
              icon={Layers}
            />
          </div>
        </section>

        {/* ── Charts row ── */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue vs burn bar chart */}
          <section
            aria-labelledby="bar-heading"
            className="rounded-xl border border-white/[0.07] bg-[linear-gradient(165deg,rgba(18,26,46,0.9),rgba(8,12,20,0.96))] p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <div>
                <p className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.1em] text-teal-500/70">
                  Monthly
                </p>
                <h2
                  id="bar-heading"
                  className="mt-0.5 font-heading text-[1rem] font-semibold text-[#f1f5f9]"
                >
                  Revenue vs Burn
                </h2>
              </div>
              <BarChart3 className="size-4 text-[#334155]" aria-hidden />
            </div>
            <div className="mb-4 flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-sans text-[0.68rem] text-[#94a3b8]">
                <span className="inline-block size-2 rounded-full bg-teal-500/70" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5 font-sans text-[0.68rem] text-[#94a3b8]">
                <span className="inline-block size-2 rounded-full bg-red-500/60" />
                Total Opex
              </span>
            </div>
            <div className="pb-8">
              <BarChart
                labels={barLabels}
                series={[
                  { label: 'Revenue', color: 'rgba(45,212,191,0.7)', values: barRevenue },
                  { label: 'Total Opex', color: 'rgba(239,68,68,0.6)', values: barBurn },
                ]}
                height={180}
              />
            </div>
          </section>

          {/* Cash balance sparkline */}
          <section
            aria-labelledby="spark-heading"
            className="rounded-xl border border-white/[0.07] bg-[linear-gradient(165deg,rgba(18,26,46,0.9),rgba(8,12,20,0.96))] p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-2">
              <div>
                <p className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.1em] text-teal-500/70">
                  Cumulative
                </p>
                <h2
                  id="spark-heading"
                  className="mt-0.5 font-heading text-[1rem] font-semibold text-[#f1f5f9]"
                >
                  Cash Balance
                </h2>
              </div>
              <TrendingUp className="size-4 text-[#334155]" aria-hidden />
            </div>
            <div className="mt-6">
              <Sparkline data={cashData} height={140} color="#2dd4bf" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="font-sans text-[0.68rem] text-[#475569]">
                Start · {formatUsd(assumptions.startingCashUsd)}
              </span>
              <span
                className={cn(
                  'font-sans text-[0.68rem] font-semibold tabular-nums',
                  (finalMonth?.cashEndUsd ?? 0) >= 0 ? 'text-teal-400' : 'text-red-400',
                )}
              >
                End · {formatUsd(finalMonth?.cashEndUsd ?? 0)}
              </span>
            </div>
          </section>
        </div>

        {/* ── Seat ramp sparkline — uses payingSeats ── */}
        <section
          aria-labelledby="seats-heading"
          className="mt-6 rounded-xl border border-white/[0.07] bg-[linear-gradient(165deg,rgba(18,26,46,0.9),rgba(8,12,20,0.96))] p-6"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <p className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.1em] text-teal-500/70">
                Growth
              </p>
              <h2
                id="seats-heading"
                className="mt-0.5 font-heading text-[1rem] font-semibold text-[#f1f5f9]"
              >
                Paying Seat Ramp
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-[#334155]" aria-hidden />
              <span className="font-sans text-[0.72rem] tabular-nums text-[#64748b]">
                Target M12: {assumptions.targetPayingSeatsMonth12.toLocaleString()} seats
              </span>
            </div>
          </div>
          <Sparkline
            data={monthRows.map((r) => r.payingSeats)}
            height={80}
            color="#818cf8"
            fill={false}
          />
        </section>

        {/* ── Annual rollup — uses correct AnnualFinancialRow fields ── */}
        {model.annual.length > 0 && (
          <section aria-labelledby="annual-heading" className="mt-10">
            <p className="font-sans text-[0.75rem] font-medium tracking-wide text-teal-500/85">
              Annual summary
            </p>
            <h2
              id="annual-heading"
              className="mt-2 font-heading text-[1.35rem] font-extrabold text-[#f1f5f9]"
            >
              Year-over-Year
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {model.annual.map((y) => (
                <div
                  key={y.year}
                  className="rounded-xl border border-white/[0.07] bg-[#07090f] p-5"
                >
                  <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#475569]">
                    {y.year}
                  </p>
                  <p className="mt-2 font-heading text-[1.4rem] font-extrabold tabular-nums text-[#f1f5f9]">
                    {formatUsd(y.revenueUsd)}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between font-sans text-[0.72rem]">
                      <span className="text-[#475569]">Total opex</span>
                      <span className="tabular-nums text-red-400">{formatUsd(y.totalOpexUsd)}</span>
                    </div>
                    <div className="flex justify-between font-sans text-[0.72rem]">
                      <span className="text-[#475569]">Operating income</span>
                      <span
                        className={cn(
                          'tabular-nums',
                          y.operatingIncomeUsd >= 0 ? 'text-teal-400' : 'text-red-400',
                        )}
                      >
                        {y.operatingIncomeUsd >= 0 ? '+' : ''}
                        {formatUsd(y.operatingIncomeUsd)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Monthly detail table ── */}
        <section aria-labelledby="table-heading" className="mt-10">
          <p className="font-sans text-[0.75rem] font-medium tracking-wide text-teal-500/85">
            Detail
          </p>
          <h2
            id="table-heading"
            className="mt-2 font-heading text-[1.35rem] font-extrabold text-[#f1f5f9]"
          >
            Monthly Model
          </h2>
          <p className="mt-2 font-sans text-[0.85rem] text-[#64748b]">
            Full {assumptions.monthlyHorizonMonths}-month cashflow. Adjust assumptions in the Pitch
            Hub → Financial tab.
          </p>
          <div className="mt-6">
            <MonthlyTable rows={monthRows} />
          </div>
        </section>

        {/* ── Assumptions read-only card ── */}
        <section aria-labelledby="assumptions-heading" className="mt-10">
          <p className="font-sans text-[0.75rem] font-medium tracking-wide text-teal-500/85">
            Inputs
          </p>
          <h2
            id="assumptions-heading"
            className="mt-2 font-heading text-[1.35rem] font-extrabold text-[#f1f5f9]"
          >
            Model Assumptions
          </h2>
          <p className="mt-2 font-sans text-[0.85rem] text-[#64748b]">
            Edit these in the{' '}
            <Link
              to="/pitch-deck-hub"
              className="text-teal-400 underline underline-offset-2 hover:text-teal-300"
            >
              Pitch Hub → Financial tab
            </Link>
            .
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {(
              [
                ['Starting cash', formatUsd(assumptions.startingCashUsd)],
                ['Seat price / mo', formatUsd(assumptions.pricePerPilotSeatMonthUsd)],
                ['Seats at M12', assumptions.targetPayingSeatsMonth12.toLocaleString()],
                ['Seat ramp (mo)', String(assumptions.seatRampMonths)],
                ['FTE at M0', String(assumptions.headcountFteMonth0)],
                ['FTE at M12', String(assumptions.headcountFteMonth12)],
                ['FTE at M24', String(assumptions.headcountFteMonth24)],
                ['FTE cost/yr', formatUsd(assumptions.fullyLoadedCostPerFteAnnualUsd)],
                ['Infra / mo', formatUsd(assumptions.monthlyInfrastructureUsd)],
                ['S&M / mo', formatUsd(assumptions.monthlySalesMarketingUsd)],
                ['Contractors / mo', formatUsd(assumptions.monthlyContractorsUsd)],
                ['Contingency', `${(assumptions.contingencyRate * 100).toFixed(0)}%`],
              ] as [string, string][]
            ).map(([label, val]) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-lg border border-white/[0.06] bg-[#060b13] px-3.5 py-3"
              >
                <p className="font-sans text-[0.62rem] font-medium uppercase tracking-[0.08em] text-[#475569]">
                  {label}
                </p>
                <p className="font-sans text-[0.85rem] font-semibold tabular-nums text-[#cbd5e1]">
                  {val}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer disclaimer */}
        <p className="mt-12 max-w-2xl font-sans text-[0.72rem] leading-relaxed text-[#334155]">
          These projections are illustrative financial models based on the assumptions above. They
          are not audited financials, guarantees of future performance, or investment advice. Actual
          results may differ materially.
        </p>
      </main>
    </div>
  );
}
