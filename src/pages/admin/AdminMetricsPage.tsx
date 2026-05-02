import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib';

type SupabaseClient = ReturnType<typeof useAuth>['supabase'];

interface VerificationRow {
  verified_in_30d: number | null;
  distinct_users_verified_in_30d: number | null;
}

interface ReturnRateRow {
  active_users_30d: number | null;
  returning_users_30d: number | null;
}

interface InterventionRow {
  intervention_type: string;
  event_count: number;
  distinct_squads: number;
}

interface ReportRow {
  reason_code: string;
  report_count: number;
  open_count: number;
  closed_count: number;
}

interface ModeratorHoursRow {
  squad_id_text: string | null;
  approx_moderator_hours: number;
  distinct_moderators: number;
  audit_rows: number;
}

interface MatchLatencyRow {
  pool_key: string;
  matched_count: number;
  avg_match_seconds: number;
  max_match_seconds: number;
}

async function fetchAdminMetrics(supabase: NonNullable<SupabaseClient>) {
  // Note: views are defined in 20260506120000_pilot_metrics_views.sql and
  // 20260428270000_pilot_observability_views.sql. RLS on underlying tables
  // does the real gatekeeping; the page is also wrapped in RequireModerator.
  const tableUnsafe = supabase as unknown as {
    from: (v: string) => {
      select: (
        columns: string,
      ) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
    };
  };
  const v = (table: string) => tableUnsafe.from(table).select('*');

  const [verifyRes, returnRes, interventionRes, reportRes, modHoursRes, matchLatencyRes] =
    await Promise.all([
      v('pilot_verification_success_rate_30d'),
      v('pilot_user_return_rate_30d'),
      v('pilot_intervention_usage_30d'),
      v('pilot_participant_report_rate_30d'),
      v('pilot_moderator_hours_per_squad_30d'),
      v('pilot_match_latency_24h'),
    ]);

  const errors = [
    verifyRes.error,
    returnRes.error,
    interventionRes.error,
    reportRes.error,
    modHoursRes.error,
    matchLatencyRes.error,
  ].filter((e): e is { message: string } => e !== null);
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join('; '));
  }
  void (null as unknown as Database);
  return {
    verification: ((verifyRes.data ?? []) as VerificationRow[])[0] ?? {
      verified_in_30d: 0,
      distinct_users_verified_in_30d: 0,
    },
    returnRate: ((returnRes.data ?? []) as ReturnRateRow[])[0] ?? {
      active_users_30d: 0,
      returning_users_30d: 0,
    },
    interventions: (interventionRes.data ?? []) as InterventionRow[],
    reports: (reportRes.data ?? []) as ReportRow[],
    moderatorHours: (modHoursRes.data ?? []) as ModeratorHoursRow[],
    matchLatency: (matchLatencyRes.data ?? []) as MatchLatencyRow[],
  };
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-navy-light bg-[#0c1219] p-4">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.06em] text-slate-500">{label}</p>
      <p className="mt-2 font-heading text-xl font-semibold text-slate-100">{value}</p>
      {hint ? <p className="mt-1 font-sans text-[0.75rem] text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function AdminMetricsPage() {
  const { supabase } = useAuth();
  const metricsQ = useQuery({
    queryKey: ['admin', 'metrics', 'all'],
    queryFn: () => {
      if (!supabase) throw new Error('Supabase client unavailable');
      return fetchAdminMetrics(supabase);
    },
    enabled: !!supabase,
  });

  if (metricsQ.isError) {
    return (
      <section aria-labelledby="admin-metrics" className="space-y-4">
        <h1 id="admin-metrics" className="font-heading text-xl font-semibold text-gray-light">
          Pilot metrics
        </h1>
        <p className="font-sans text-[0.85rem] text-amber" role="alert">
          {metricsQ.error instanceof Error ? metricsQ.error.message : 'Could not load metrics.'}
        </p>
      </section>
    );
  }

  const data = metricsQ.data;
  const returnRatePct =
    data && data.returnRate.active_users_30d
      ? Math.round(
          ((data.returnRate.returning_users_30d ?? 0) / (data.returnRate.active_users_30d ?? 1)) *
            100,
        )
      : 0;

  return (
    <section className="space-y-10" aria-labelledby="admin-metrics">
      <header>
        <h1 id="admin-metrics" className="font-heading text-xl font-semibold text-gray-light">
          Pilot metrics
        </h1>
        <p className="mt-1 max-w-[66ch] font-sans text-[0.88rem] text-slate-500">
          Read-only rollups for diligence and pilot ops. Definitions live in{' '}
          <code className="text-slate-400">docs/business/impact-metrics.md</code>; the underlying
          views in <code className="text-slate-400">supabase/migrations</code>. Each metric is
          honest about its limits — see the doc.
        </p>
      </header>

      <div>
        <h2 className="font-heading text-lg font-semibold text-slate-300">Engagement (30d)</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Verifications"
            value={data?.verification.verified_in_30d ?? '—'}
            hint="Successful Semaphore + Edge proofs"
          />
          <MetricCard
            label="Distinct verified users"
            value={data?.verification.distinct_users_verified_in_30d ?? '—'}
            hint="Counts each user once"
          />
          <MetricCard
            label="Active users"
            value={data?.returnRate.active_users_30d ?? '—'}
            hint="Joined ≥1 squad in 30d"
          />
          <MetricCard
            label="Return rate"
            value={`${returnRatePct}%`}
            hint={`${data?.returnRate.returning_users_30d ?? 0} returned of ${
              data?.returnRate.active_users_30d ?? 0
            }`}
          />
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-slate-300">Match latency (24h)</h2>
        {!data?.matchLatency.length ? (
          <p className="mt-2 text-slate-500">No matched squads in the last 24 hours.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-navy-light">
            <table className="w-full min-w-[600px] border-collapse font-sans text-[0.8rem] text-slate-300">
              <thead>
                <tr className="border-b border-navy-light bg-[#0c1219] text-left text-slate-500">
                  <th className="p-2">Pool</th>
                  <th className="p-2">Matched</th>
                  <th className="p-2">Avg seconds</th>
                  <th className="p-2">Max seconds</th>
                </tr>
              </thead>
              <tbody>
                {data.matchLatency.map((r) => (
                  <tr key={r.pool_key} className="border-b border-navy-light/60">
                    <td className="p-2 font-mono text-[0.75rem] text-slate-400">{r.pool_key}</td>
                    <td className="p-2 font-mono">{r.matched_count}</td>
                    <td className="p-2 font-mono">{Math.round(r.avg_match_seconds)}</td>
                    <td className="p-2 font-mono">{Math.round(r.max_match_seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-slate-300">
          UX interventions (30d)
        </h2>
        {!data?.interventions.length ? (
          <p className="mt-2 text-slate-500">
            No interventions recorded yet. Power-of-Pause and Pull-Back hooks publish into the{' '}
            <code className="text-slate-400">interventions</code> table.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.interventions.map((r) => (
              <li
                key={r.intervention_type}
                className="rounded-lg border border-navy-light bg-[#0c1219] p-3"
              >
                <p className="font-mono text-[0.75rem] text-slate-400">{r.intervention_type}</p>
                <p className="mt-1 font-heading text-lg text-slate-100">{r.event_count}</p>
                <p className="font-sans text-[0.7rem] text-slate-500">
                  {r.distinct_squads} distinct squads
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-slate-300">Reports (30d)</h2>
        {!data?.reports.length ? (
          <p className="mt-2 text-slate-500">No participant reports in the last 30 days.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-navy-light">
            <table className="w-full min-w-[500px] border-collapse font-sans text-[0.8rem] text-slate-300">
              <thead>
                <tr className="border-b border-navy-light bg-[#0c1219] text-left text-slate-500">
                  <th className="p-2">Reason</th>
                  <th className="p-2">Total</th>
                  <th className="p-2">Open</th>
                  <th className="p-2">Closed</th>
                </tr>
              </thead>
              <tbody>
                {data.reports.map((r) => (
                  <tr key={r.reason_code} className="border-b border-navy-light/60">
                    <td className="p-2 font-mono text-[0.75rem] text-slate-400">{r.reason_code}</td>
                    <td className="p-2 font-mono">{r.report_count}</td>
                    <td className="p-2 font-mono">{r.open_count}</td>
                    <td className="p-2 font-mono">{r.closed_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-slate-300">
          Moderator hours per squad (30d, approx.)
        </h2>
        {!data?.moderatorHours.length ? (
          <p className="mt-2 text-slate-500">No moderator audit activity in the last 30 days.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-navy-light">
            <table className="w-full min-w-[600px] border-collapse font-sans text-[0.8rem] text-slate-300">
              <thead>
                <tr className="border-b border-navy-light bg-[#0c1219] text-left text-slate-500">
                  <th className="p-2">Squad</th>
                  <th className="p-2">Approx hours</th>
                  <th className="p-2">Distinct mods</th>
                  <th className="p-2">Audit rows</th>
                </tr>
              </thead>
              <tbody>
                {data.moderatorHours.slice(0, 50).map((r) => (
                  <tr key={r.squad_id_text ?? 'unknown'} className="border-b border-navy-light/60">
                    <td className="p-2 font-mono text-[0.75rem] text-slate-400">
                      {r.squad_id_text ?? 'unknown'}
                    </td>
                    <td className="p-2 font-mono">{r.approx_moderator_hours}</td>
                    <td className="p-2 font-mono">{r.distinct_moderators}</td>
                    <td className="p-2 font-mono">{r.audit_rows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
