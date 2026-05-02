import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Download, Lock } from 'lucide-react';
import {
  CardEyebrow,
  EmptyState,
  InlineAction,
  PageHero,
  SectionBand,
  SectionIntro,
  SurfaceCard,
} from '../components';
import { useRole } from '../hooks';
import {
  DEFAULT_FILTERS,
  INSIGHTS_PROTOTYPE_DISCLOSURE,
  areInvestorFixturesEnabled,
  downloadCsv,
  regionLabel,
  timeframeLabel,
  useIncidentSeverity,
  useInsightsExportRows,
  useOperatingMetrics,
  useRetentionCohorts,
  type InsightsFilters,
  type InsightsRegion,
  type InsightsTimeframe,
} from '../lib';

/**
 * InsightsPage — prototype reporting surface for partner review.
 *
 * Data is read from the `insightsQueries` layer. Today that layer returns
 * deterministic sample data; pilot-safe reporting can replace the query
 * bodies without changing the page contract.
 *
 * Surface includes:
 *   - filter bar (timeframe, region) + sample export format
 *   - operating metrics tiles (six KPIs)
 *   - 30-day severity heat-strip
 *   - cohort retention table (rows = weekly cohorts, columns = weeks 1-6)
 *
 * The deeper moderator-only view lives at /insights/dashboard and reuses
 * the same hooks + filters with role-gated additional cells.
 */

const TIMEFRAMES: ReadonlyArray<InsightsTimeframe> = ['7d', '30d', '90d', 'all'];
const REGIONS: ReadonlyArray<InsightsRegion> = ['all', 'north-america', 'europe', 'cross-border'];

function FilterChips({
  filters,
  onChange,
}: {
  filters: InsightsFilters;
  onChange: (next: InsightsFilters) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Timeframe
        </span>
        {TIMEFRAMES.map((t) => {
          const active = filters.timeframe === t;
          return (
            <button
              key={t}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ ...filters, timeframe: t })}
              className={`focus-ring min-h-[44px] rounded-md border px-3 py-2 font-sans text-[0.78rem] leading-snug transition-colors ${
                active
                  ? 'border-brand bg-brand-soft text-ink'
                  : 'border-line bg-surface-elevated text-ink-secondary hover:border-line-strong hover:text-ink'
              }`}
            >
              {timeframeLabel(t)}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Region
        </span>
        {REGIONS.map((r) => {
          const active = filters.region === r;
          return (
            <button
              key={r}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ ...filters, region: r })}
              className={`focus-ring min-h-[44px] rounded-md border px-3 py-2 font-sans text-[0.78rem] leading-snug transition-colors ${
                active
                  ? 'border-brand bg-brand-soft text-ink'
                  : 'border-line bg-surface-elevated text-ink-secondary hover:border-line-strong hover:text-ink'
              }`}
            >
              {regionLabel(r)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SeverityHeatStrip({ filters }: { filters: InsightsFilters }) {
  const { data: severity } = useIncidentSeverity(filters);
  const total = severity ? severity.sev1 + severity.sev2 + severity.sev3 : 0;

  /* Sample grid pattern from the same severity buckets. We render 30 cells
   * deterministically to show the visual grammar. Phase 3 swaps this for a
   * real day-by-day series. */
  const cells: ReadonlyArray<'sev3' | 'sev2' | 'sev1' | 'idle'> = (() => {
    if (!severity) return Array(30).fill('idle');
    const out: Array<'sev3' | 'sev2' | 'sev1' | 'idle'> = [];
    for (let i = 0; i < severity.sev3; i += 1) out.push('sev3');
    for (let i = 0; i < severity.sev2; i += 1) out.push('sev2');
    for (let i = 0; i < severity.sev1; i += 1) out.push('sev1');
    while (out.length < 30) out.push('idle');
    return out.slice(0, 30);
  })();

  const cellClass: Record<(typeof cells)[number], string> = {
    sev3: 'bg-status-error',
    sev2: 'bg-status-stale',
    sev1: 'bg-status-empty',
    idle: 'bg-surface-sunken',
  };

  return (
    <SurfaceCard>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <CardEyebrow>Trust & safety incidents — sample heat strip</CardEyebrow>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-subtle">
          Sample total {total}
        </p>
      </div>
      <div
        className="mt-4 grid grid-cols-[repeat(15,minmax(0,1fr))] gap-[3px] sm:grid-cols-[repeat(30,minmax(0,1fr))]"
        role="img"
        aria-label={
          severity
            ? `Severity 1: ${severity.sev1}, severity 2: ${severity.sev2}, severity 3: ${severity.sev3}`
            : 'Loading incident severity'
        }
      >
        {cells.map((kind, i) => (
          <span
            key={`${kind}-${i}`}
            aria-hidden
            className={`block h-3 rounded-[2px] ${cellClass[kind]}`}
          />
        ))}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-[2px] bg-status-empty" />
          Sev 1 · {severity?.sev1 ?? '—'}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-[2px] bg-status-stale" />
          Sev 2 · {severity?.sev2 ?? '—'}
        </li>
        <li className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-[2px] bg-status-error" />
          Sev 3+ · {severity?.sev3 ?? '—'}
        </li>
      </ul>
    </SurfaceCard>
  );
}

function RetentionCohortTable({ filters }: { filters: InsightsFilters }) {
  const { data } = useRetentionCohorts(filters);
  if (!data) return null;
  const maxWeeks = Math.max(...data.map((c) => c.weeklyRetention.length));

  function shade(rate: number): string {
    /* Single-channel teal scale tied to the brand. */
    if (rate >= 0.9) return 'bg-brand text-brand-on';
    if (rate >= 0.78) return 'bg-brand/75 text-brand-on';
    if (rate >= 0.65) return 'bg-brand/55 text-ink';
    if (rate >= 0.5) return 'bg-brand/30 text-ink';
    return 'bg-brand/15 text-ink-faint';
  }

  return (
    <SurfaceCard>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <CardEyebrow>Retention cohorts — by week</CardEyebrow>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-subtle">
          {data.length} cohorts
        </p>
      </div>
      <div className="mt-4 -mx-1 overflow-x-auto pb-1">
        <table className="w-full min-w-[40rem] border-separate border-spacing-1 font-mono text-[0.72rem] tabular-nums">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                Sample cohort
              </th>
              <th className="px-2 py-1 text-right font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                Approx. size
              </th>
              {Array.from({ length: maxWeeks }).map((_, i) => (
                <th
                  key={i}
                  className="px-2 py-1 text-center font-mono text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-ink-faint"
                >
                  Wk {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((cohort) => (
              <tr key={cohort.cohortStart}>
                <td className="px-2 py-1 text-left text-ink-secondary">{cohort.cohortStart}</td>
                <td className="px-2 py-1 text-right text-ink-secondary">{cohort.size}</td>
                {Array.from({ length: maxWeeks }).map((_, i) => {
                  const rate = cohort.weeklyRetention[i];
                  if (rate == null) {
                    return (
                      <td key={i} className="px-2 py-1">
                        <span className="block rounded-sm border border-dashed border-line bg-transparent px-1.5 py-1 text-center text-ink-subtle">
                          —
                        </span>
                      </td>
                    );
                  }
                  return (
                    <td key={i} className="px-1 py-1">
                      <span
                        className={`block rounded-sm px-1.5 py-1 text-center font-semibold ${shade(rate)}`}
                        title={`About ${Math.round(rate * 100)}% retained at week ${i + 1}`}
                      >
                        {Math.round(rate * 100)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  );
}

function MetricsBand({ filters }: { filters: InsightsFilters }) {
  const { data: metrics } = useOperatingMetrics(filters);
  if (!metrics) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => (
        <SurfaceCard as="li" key={m.id} className="list-none">
          <div className="flex items-baseline justify-between gap-3">
            <CardEyebrow className="tracking-[0.12em]">{m.label}</CardEyebrow>
          </div>
          <p className="mt-3 font-mono text-[1.7rem] font-semibold leading-none tabular-nums text-ink">
            {m.value}
          </p>
          <p className="mt-2 font-sans text-[0.82rem] leading-relaxed text-ink-faint">
            {m.context}
          </p>
        </SurfaceCard>
      ))}
    </ul>
  );
}

function ExportButton({ filters }: { filters: InsightsFilters }) {
  const { rows, columns } = useInsightsExportRows(filters);
  return (
    <button
      type="button"
      onClick={() =>
        downloadCsv(
          `squadridge-insights-sample-format-${filters.timeframe}-${filters.region}`,
          rows,
          columns,
        )
      }
      disabled={rows.length === 0}
      className="focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-[6px] border border-line bg-surface-elevated px-3 py-2 font-sans text-[0.82rem] text-ink-secondary transition-colors hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Download aria-hidden className="size-3.5" />
      Sample export format
    </button>
  );
}

export function InsightsPage() {
  const enabled = areInvestorFixturesEnabled();
  const [filters, setFilters] = useState<InsightsFilters>(DEFAULT_FILTERS);
  const role = useRole();

  return (
    <>
      <SectionBand tone="navy">
        <PageHero eyebrow="Insights" title="Operating metrics partners and funders can read.">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            {role.isStaff ? (
              <Link
                to="/insights/dashboard"
                className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-[6px] border border-line bg-surface-elevated px-3 py-2 font-sans text-[0.82rem] text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
              >
                <Lock aria-hidden className="size-3.5" />
                Moderator dashboard
              </Link>
            ) : null}
          </div>
          <p>
            This is a representative pilot reporting interface: it shows the categories and review
            patterns partners can expect, using sample data instead of live operational telemetry.
            Filter controls demonstrate how a pilot reporting layer can narrow the view by timeframe
            and region.
          </p>
          {enabled ? (
            <div className="mt-5 max-w-3xl rounded-md border border-brand/25 bg-brand-soft px-4 py-3">
              <p className="font-sans text-[0.88rem] leading-relaxed text-ink-secondary">
                {INSIGHTS_PROTOTYPE_DISCLOSURE}
              </p>
            </div>
          ) : null}
        </PageHero>
      </SectionBand>

      <SectionBand tone="black">
        <div className="flex min-w-0 flex-col gap-10">
          {!enabled ? (
            <EmptyState
              icon={BarChart3}
              tone="warn"
              title="Reporting prototype is gated in this build"
              description={
                <p>
                  Insights data is not visible without the investor-fixture flag. Enable{' '}
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-amber-light">
                    VITE_ENABLE_INVESTOR_FIXTURES=true
                  </code>{' '}
                  in your build environment to render the representative reporting layer with sample
                  data — no live partner records are exposed either way.
                </p>
              }
              actions={
                <Link to="/trust" className="btn-secondary no-underline">
                  Read the trust architecture
                  <ArrowRight aria-hidden className="size-3.5" />
                </Link>
              }
            />
          ) : (
            <>
              <SurfaceCard
                as="section"
                aria-label="Sample filter and export controls"
                className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6"
              >
                <FilterChips filters={filters} onChange={setFilters} />
                <div className="flex items-center gap-2 md:justify-end">
                  <ExportButton filters={filters} />
                </div>
              </SurfaceCard>

              <section aria-labelledby="kpi-heading">
                <SectionIntro
                  id="kpi-heading"
                  title={
                    <>
                      Sample reporting view — {timeframeLabel(filters.timeframe).toLowerCase()},{' '}
                      {regionLabel(filters.region).toLowerCase()}
                    </>
                  }
                ></SectionIntro>
                <div className="mt-5">
                  <MetricsBand filters={filters} />
                </div>
              </section>

              <section aria-labelledby="severity-heading">
                <SectionIntro
                  id="severity-heading"
                  title="Trust & safety incidents — sample severity view"
                />
                <div className="mt-5">
                  <SeverityHeatStrip filters={filters} />
                </div>
              </section>

              <section aria-labelledby="retention-heading">
                <SectionIntro id="retention-heading" title="Cohort retention">
                  <p>
                    Each row is a modeled weekly cohort. Cells show rounded retention bands for week
                    N. Empty cells indicate cohorts that have not reached that modeled week yet.
                  </p>
                </SectionIntro>
                <div className="mt-5">
                  <RetentionCohortTable filters={filters} />
                </div>
              </section>
            </>
          )}

          <SurfaceCard as="aside">
            <CardEyebrow tone="brand">Coming next</CardEyebrow>
            <p className="mt-2 font-sans text-[0.92rem] leading-relaxed text-ink-secondary">
              Today this page demonstrates the reporting model with representative sample data. A
              pilot-safe version needs RLS-respecting Supabase reads, partner-scoped permissions,
              documented aggregation windows, signed export bundles, and explicit review labels for
              generated reports.
            </p>
            <InlineAction as={Link} to="/trust" className="mt-4">
              See how the trust architecture defines the reporting boundary
              <ArrowRight aria-hidden className="size-3.5" />
            </InlineAction>
          </SurfaceCard>
        </div>
      </SectionBand>
    </>
  );
}

/* ----------------------------------------------------------------------------
 * Moderator-gated detail page — same data, extra columns reserved for staff.
 * --------------------------------------------------------------------------*/

export function InsightsDashboardPage() {
  const [filters, setFilters] = useState<InsightsFilters>(DEFAULT_FILTERS);
  const { data: metrics } = useOperatingMetrics(filters);
  const enabled = areInvestorFixturesEnabled();

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 py-10 md:py-14">
      <header>
        <div className="flex items-center gap-2">
          <Lock aria-hidden className="size-4 text-amber" />
          <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-amber/90">
            Moderator dashboard
          </p>
        </div>
        <h1 className="mt-2 font-sans text-[clamp(1.7rem,2.6vw,2.25rem)] font-semibold tracking-[-0.02em] text-ink">
          Sample reporting detail — staff view.
        </h1>
        <p className="mt-3 max-w-copy font-sans text-[0.95rem] leading-[1.65] text-ink-secondary">
          Same representative metrics, shown in a table shape reserved for staff review. This view
          is still sample data until production aggregation and access controls are wired.
        </p>
        {enabled ? (
          <div className="mt-5 max-w-3xl rounded-md border border-amber/25 bg-amber/[0.06] px-4 py-3">
            <p className="font-sans text-[0.88rem] leading-relaxed text-ink-secondary">
              {INSIGHTS_PROTOTYPE_DISCLOSURE}
            </p>
          </div>
        ) : null}
      </header>

      <section
        aria-label="Sample filter and export controls"
        className="flex flex-col gap-3 rounded-md border border-line bg-surface-elevated p-5 md:flex-row md:items-center md:justify-between md:gap-6"
      >
        <FilterChips filters={filters} onChange={setFilters} />
        <div className="flex items-center gap-2 md:justify-end">
          <ExportButton filters={filters} />
        </div>
      </section>

      <section aria-labelledby="staff-kpi-heading">
        <h2
          id="staff-kpi-heading"
          className="font-sans text-[1.1rem] font-semibold tracking-[-0.01em] text-ink"
        >
          Operating metrics — sample table
        </h2>
        <div className="mt-5 overflow-hidden rounded-md border border-line">
          <table className="w-full border-collapse font-mono text-[0.78rem] tabular-nums">
            <thead className="bg-surface-secondary">
              <tr>
                <th className="border-b border-line px-3 py-2 text-left font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                  Metric ID
                </th>
                <th className="border-b border-line px-3 py-2 text-left font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                  Label
                </th>
                <th className="border-b border-line px-3 py-2 text-right font-mono text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                  Sample value
                </th>
              </tr>
            </thead>
            <tbody>
              {(metrics ?? []).map((m) => (
                <tr key={m.id} className="border-b border-line last:border-b-0">
                  <td className="px-3 py-2 text-ink-secondary">{m.id}</td>
                  <td className="px-3 py-2 text-ink">{m.label}</td>
                  <td className="px-3 py-2 text-right text-ink">{m.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="staff-retention-heading">
        <h2
          id="staff-retention-heading"
          className="font-sans text-[1.1rem] font-semibold tracking-[-0.01em] text-ink"
        >
          Retention sample
        </h2>
        <div className="mt-5">
          <RetentionCohortTable filters={filters} />
        </div>
      </section>

      <section aria-labelledby="staff-severity-heading">
        <h2
          id="staff-severity-heading"
          className="font-sans text-[1.1rem] font-semibold tracking-[-0.01em] text-ink"
        >
          Severity sample strip
        </h2>
        <div className="mt-5">
          <SeverityHeatStrip filters={filters} />
        </div>
      </section>
    </div>
  );
}
