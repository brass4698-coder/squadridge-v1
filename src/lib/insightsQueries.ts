/**
 * Insights query layer — the contract that Phase 3 will fulfill against
 * Supabase. Today these hooks return deterministic sample data wrapped in
 * `useQuery` so the UI can demonstrate the reporting model without implying
 * live ingestion.
 *
 * When the production schema lands, the only change is the `queryFn` body:
 * each one becomes an RLS-respecting RPC call. The TypeScript shape is the
 * stable contract.
 *
 * Filters (`InsightsFilters`) are deliberately conservative — timeframe
 * plus a region/facilitator selector — so the surface can ship without
 * locking us into a specific aggregation pipeline. Real filters move into
 * the RPC parameters in phase 3.
 */

import { useMemo } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  INCIDENT_SEVERITY_LAST_30D,
  OPERATING_METRICS,
  PARTNER_CASE_STUDIES,
  type IncidentSeverity,
  type OperatingMetric,
  type PartnerCaseStudy,
} from './investorFixtures';

export type InsightsTimeframe = '7d' | '30d' | '90d' | 'all';

export type InsightsRegion = 'all' | 'north-america' | 'europe' | 'cross-border';

export type InsightsFilters = {
  timeframe: InsightsTimeframe;
  region: InsightsRegion;
};

export const DEFAULT_FILTERS: InsightsFilters = {
  timeframe: '30d',
  region: 'all',
};

const TIMEFRAME_LABEL: Record<InsightsTimeframe, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All-time',
};

const REGION_LABEL: Record<InsightsRegion, string> = {
  all: 'All regions',
  'north-america': 'North America',
  europe: 'Europe',
  'cross-border': 'Cross-border',
};

export function timeframeLabel(t: InsightsTimeframe): string {
  return TIMEFRAME_LABEL[t];
}

export function regionLabel(r: InsightsRegion): string {
  return REGION_LABEL[r];
}

/* ----------------------------------------------------------------------------
 * Query keys — kept here (not in queryKeys.ts) so the contract is colocated
 * with the consumer. When the queryFn moves to a Supabase RPC, callers
 * upstream still invalidate via these keys.
 * --------------------------------------------------------------------------*/

export const insightsQueryKeys = {
  metrics: (f: InsightsFilters) => ['insights', 'metrics', f.timeframe, f.region] as const,
  incidents: (f: InsightsFilters) => ['insights', 'incidents', f.timeframe, f.region] as const,
  retention: (f: InsightsFilters) => ['insights', 'retention', f.timeframe, f.region] as const,
  partners: () => ['insights', 'partners'] as const,
} as const;

/* ----------------------------------------------------------------------------
 * Filter-aware sample transforms. Cosmetic only — demonstrates how scoped
 * reporting will respond when real RPCs are wired. Each is purely a function
 * of the filter so behaviour stays deterministic for QA.
 * --------------------------------------------------------------------------*/

function timeframeMultiplier(t: InsightsTimeframe): number {
  switch (t) {
    case '7d':
      return 0.32;
    case '30d':
      return 1;
    case '90d':
      return 2.6;
    case 'all':
      return 6.4;
  }
}

function regionMultiplier(r: InsightsRegion): number {
  switch (r) {
    case 'all':
      return 1;
    case 'north-america':
      return 0.55;
    case 'europe':
      return 0.42;
    case 'cross-border':
      return 0.41;
  }
}

function applyMultiplier(value: string, m: number): string {
  /* Walk the value string and scale numeric runs, preserving suffixes
   * like ranges without introducing decimal precision in sample counters. */
  return value.replace(/(\d+(?:\.\d+)?)/g, (match) => {
    const n = Number(match) * m;
    return String(Math.max(1, Math.round(n)));
  });
}

function transformMetrics(
  base: ReadonlyArray<OperatingMetric>,
  f: InsightsFilters,
): ReadonlyArray<OperatingMetric> {
  const m = timeframeMultiplier(f.timeframe) * regionMultiplier(f.region);
  return base.map((metric) => {
    /* Rates (% / retention / cross-border) shouldn't be scaled — they are
     * intensive, not extensive — so we only scale absolute counters. */
    const isCounter =
      metric.id === 'active-dialogues' ||
      metric.id === 'mod-interventions' ||
      metric.id === 'incidents';
    return {
      ...metric,
      value: isCounter ? applyMultiplier(metric.value, m) : metric.value,
    };
  });
}

function transformIncidents(
  base: Readonly<Record<IncidentSeverity, number>>,
  f: InsightsFilters,
): Readonly<Record<IncidentSeverity, number>> {
  const m = timeframeMultiplier(f.timeframe) * regionMultiplier(f.region);
  return {
    sev1: Math.round(base.sev1 * m),
    sev2: Math.round(base.sev2 * m),
    sev3: Math.round(base.sev3 * m),
  };
}

/* ----------------------------------------------------------------------------
 * Retention cohort sample. Each row is a model cohort; cells are the rounded
 * share of that cohort still active in week N. Phase 3 RPC returns the same
 * shape from a session_log aggregate.
 * --------------------------------------------------------------------------*/

export type RetentionCohort = {
  /** Public label for the sample cohort. */
  cohortStart: string;
  size: number;
  /** Length is 1..6: week 1 (intake) through week 6 (closeout). */
  weeklyRetention: ReadonlyArray<number>;
};

const RETENTION_BASE: ReadonlyArray<RetentionCohort> = [
  {
    cohortStart: 'Cohort A',
    size: 10,
    weeklyRetention: [1, 0.9, 0.8, 0.75, 0.75, 0.65],
  },
  {
    cohortStart: 'Cohort B',
    size: 10,
    weeklyRetention: [1, 0.9, 0.8, 0.8, 0.65],
  },
  {
    cohortStart: 'Cohort C',
    size: 12,
    weeklyRetention: [1, 0.9, 0.85, 0.75],
  },
  {
    cohortStart: 'Cohort D',
    size: 10,
    weeklyRetention: [1, 0.9, 0.8],
  },
  {
    cohortStart: 'Cohort E',
    size: 8,
    weeklyRetention: [1, 0.9],
  },
  {
    cohortStart: 'Cohort F',
    size: 10,
    weeklyRetention: [1],
  },
];

function transformRetention(
  base: ReadonlyArray<RetentionCohort>,
  f: InsightsFilters,
): ReadonlyArray<RetentionCohort> {
  const m = regionMultiplier(f.region);
  return base.map((c) => ({
    ...c,
    size: Math.max(1, Math.round(c.size * m)),
  }));
}

/* ----------------------------------------------------------------------------
 * Hooks — what the dashboard imports.
 * --------------------------------------------------------------------------*/

export function useOperatingMetrics(
  filters: InsightsFilters = DEFAULT_FILTERS,
): UseQueryResult<ReadonlyArray<OperatingMetric>> {
  return useQuery({
    queryKey: insightsQueryKeys.metrics(filters),
    queryFn: () => transformMetrics(OPERATING_METRICS, filters),
    staleTime: 30_000,
  });
}

export function useIncidentSeverity(
  filters: InsightsFilters = DEFAULT_FILTERS,
): UseQueryResult<Readonly<Record<IncidentSeverity, number>>> {
  return useQuery({
    queryKey: insightsQueryKeys.incidents(filters),
    queryFn: () => transformIncidents(INCIDENT_SEVERITY_LAST_30D, filters),
    staleTime: 30_000,
  });
}

export function useRetentionCohorts(
  filters: InsightsFilters = DEFAULT_FILTERS,
): UseQueryResult<ReadonlyArray<RetentionCohort>> {
  return useQuery({
    queryKey: insightsQueryKeys.retention(filters),
    queryFn: () => transformRetention(RETENTION_BASE, filters),
    staleTime: 30_000,
  });
}

export function usePartnerCaseStudies(): UseQueryResult<ReadonlyArray<PartnerCaseStudy>> {
  return useQuery({
    queryKey: insightsQueryKeys.partners(),
    queryFn: () => PARTNER_CASE_STUDIES,
    staleTime: 60_000,
  });
}

/**
 * Convenience hook for the Insights sample export — flattens the metrics +
 * filters into a CSV-friendly row set without pretending it is an operational
 * data extract.
 */
export function useInsightsExportRows(filters: InsightsFilters): {
  rows: ReadonlyArray<{
    data_mode: string;
    metric_id: string;
    metric_label: string;
    value: string;
    timeframe: string;
    region: string;
  }>;
  columns: ReadonlyArray<{
    key: 'data_mode' | 'metric_id' | 'metric_label' | 'value' | 'timeframe' | 'region';
    label: string;
  }>;
} {
  const metrics = useOperatingMetrics(filters);
  const metricData = metrics.data;

  const rows = useMemo(
    () =>
      (metricData ?? []).map((m) => ({
        data_mode: 'Representative sample',
        metric_id: m.id,
        metric_label: m.label,
        value: m.value,
        timeframe: TIMEFRAME_LABEL[filters.timeframe],
        region: REGION_LABEL[filters.region],
      })),
    [metricData, filters.timeframe, filters.region],
  );

  return {
    rows,
    columns: [
      { key: 'data_mode', label: 'Data mode' },
      { key: 'metric_id', label: 'Metric ID' },
      { key: 'metric_label', label: 'Metric' },
      { key: 'value', label: 'Sample value' },
      { key: 'timeframe', label: 'Timeframe' },
      { key: 'region', label: 'Region' },
    ],
  };
}
