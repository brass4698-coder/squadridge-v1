import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { fetchCsiSnapshots, fetchEscalationAlerts } from '../../lib/csi/csiQueries';
import type { CsiSnapshotRow, EscalationAlertRow } from '../../lib/csi/csiQueries';

function bandClass(band: string): string {
  switch (band) {
    case 'red':
      return 'text-red-300';
    case 'yellow':
      return 'text-amber-light';
    default:
      return 'text-teal-light';
  }
}

const SAMPLE_INSERT_ENABLED = import.meta.env.DEV || import.meta.env.MODE === 'e2e';

/**
 * Moderator-only Conflict Severity Index rollups and escalation rows (RLS: moderators roster).
 */
export function AdminCsiPage() {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();

  const snapshotsQ = useQuery({
    queryKey: ['admin', 'csi', 'snapshots'],
    queryFn: (): Promise<CsiSnapshotRow[]> => {
      if (!supabase) return Promise.resolve([]);
      return fetchCsiSnapshots(supabase);
    },
    enabled: !!supabase,
  });

  const alertsQ = useQuery({
    queryKey: ['admin', 'csi', 'alerts'],
    queryFn: (): Promise<EscalationAlertRow[]> => {
      if (!supabase) return Promise.resolve([]);
      return fetchEscalationAlerts(supabase);
    },
    enabled: !!supabase,
  });

  const sampleInsert = useMutation({
    mutationFn: async (band: 'green' | 'yellow' | 'red') => {
      if (!supabase) throw new Error('Supabase client unavailable');
      const { data, error } = await supabase.functions.invoke<{
        ok?: boolean;
        snapshot_id?: string;
      }>('admin-csi-sample-insert', {
        body: { severity_band: band, region_key: `sample-${band}` },
      });
      if (error) throw new Error(error.message);
      if (!data?.ok) throw new Error('Edge function did not confirm insert');
      return data.snapshot_id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'csi'] });
      toast.success('Sample snapshot inserted.');
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not insert sample.');
    },
  });

  return (
    <section className="space-y-10" aria-labelledby="admin-csi">
      <header>
        <h1 id="admin-csi" className="font-heading text-xl font-semibold text-gray-light">
          Conflict Severity Index
        </h1>
        <p className="mt-1 max-w-[66ch] font-sans text-[0.88rem] text-slate-500">
          Regional snapshots and squad alerts ingested by trusted workers (service role). Shipped
          product today is facilitator-led rooms and moderation; CSI rollups are pilot-path. The
          dashboard is empty until a CSI worker writes rows. Methodology:{' '}
          <code className="text-slate-400">docs/product/conflict-severity-index.md</code>. Ops:{' '}
          <code className="text-slate-400">docs/operations/pilot-runbook.md</code>.
        </p>
        {SAMPLE_INSERT_ENABLED ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-amber/30 bg-amber/5 px-3 py-2">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.06em] text-amber">
              Dev / staging only
            </p>
            <p className="font-sans text-[0.78rem] text-slate-400">
              Insert a sample snapshot via the moderator-only Edge function.
            </p>
            {(['green', 'yellow', 'red'] as const).map((band) => (
              <button
                key={band}
                type="button"
                onClick={() => sampleInsert.mutate(band)}
                disabled={sampleInsert.isPending}
                className="inline-flex items-center justify-center rounded-md border border-navy-light bg-[#0c1219] px-2.5 py-1 font-mono text-[0.72rem] text-slate-300 transition-colors hover:border-teal/35 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Insert {band}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      <div>
        <h2 className="font-heading text-lg font-semibold text-slate-300">Regional snapshots</h2>
        {snapshotsQ.isLoading ? (
          <div
            className="mt-2 space-y-2"
            role="status"
            aria-busy="true"
            aria-label="Loading regional snapshots"
          >
            <span className="sr-only">Loading regional snapshots…</span>
            <div className="h-3 w-1/2 animate-pulse rounded bg-line/70" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-line/55" />
          </div>
        ) : snapshotsQ.isError ? (
          <p className="mt-2 text-amber" role="alert">
            {snapshotsQ.error instanceof Error ? snapshotsQ.error.message : 'Failed to load.'}
          </p>
        ) : !snapshotsQ.data?.length ? (
          <p className="mt-2 text-slate-500">
            No rows yet. After migrations are applied, batch jobs can insert snapshots (moderators
            read; service role writes).
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-navy-light">
            <table className="w-full min-w-[800px] border-collapse font-sans text-[0.8rem] text-slate-300">
              <thead>
                <tr className="border-b border-navy-light bg-[#0c1219] text-left text-slate-500">
                  <th className="p-2">Region</th>
                  <th className="p-2">Snapshot</th>
                  <th className="p-2">Window</th>
                  <th className="p-2">CSI</th>
                  <th className="p-2">Band</th>
                  <th className="p-2">Escalation?</th>
                </tr>
              </thead>
              <tbody>
                {snapshotsQ.data.map((r) => (
                  <tr key={r.id} className="border-b border-navy-light/60">
                    <td className="p-2 font-mono text-[0.75rem] text-slate-400">{r.region_key}</td>
                    <td className="p-2 text-slate-500">{r.snapshot_at}</td>
                    <td className="p-2 text-slate-500">
                      {r.period_start.slice(0, 10)} → {r.period_end.slice(0, 10)}
                    </td>
                    <td className="p-2 font-mono">{r.csi_score}</td>
                    <td className={`p-2 font-medium ${bandClass(r.severity_band)}`}>
                      {r.severity_band}
                    </td>
                    <td className="p-2">{r.detected_escalation ? 'Yes' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-slate-300">Escalation alerts</h2>
        {alertsQ.isLoading ? (
          <div
            className="mt-2 space-y-2"
            role="status"
            aria-busy="true"
            aria-label="Loading escalation alerts"
          >
            <span className="sr-only">Loading escalation alerts…</span>
            <div className="h-3 w-1/2 animate-pulse rounded bg-line/70" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-line/55" />
          </div>
        ) : alertsQ.isError ? (
          <p className="mt-2 text-amber" role="alert">
            {alertsQ.error instanceof Error ? alertsQ.error.message : 'Failed to load.'}
          </p>
        ) : !alertsQ.data?.length ? (
          <p className="mt-2 text-slate-500">No escalation rows yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {alertsQ.data.map((a) => (
              <li
                key={a.id}
                className={`rounded-lg border p-4 ${
                  a.severity_level === 'red'
                    ? 'border-red-500/35 bg-red-500/5'
                    : a.severity_level === 'yellow'
                      ? 'border-amber/35 bg-amber/5'
                      : 'border-navy-light bg-[#0c1219]'
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span
                    className={`font-mono text-[0.8rem] font-semibold ${bandClass(a.severity_level)}`}
                  >
                    {a.severity_level}
                  </span>
                  <span className="text-[0.75rem] text-slate-500">{a.triggered_at}</span>
                </div>
                <p className="mt-1 font-mono text-[0.75rem] text-slate-400">squad {a.squad_id}</p>
                {a.region_key ? (
                  <p className="text-[0.8rem] text-slate-500">region: {a.region_key}</p>
                ) : null}
                {a.recommended_action ? (
                  <p className="mt-2 text-[0.85rem] text-slate-300">{a.recommended_action}</p>
                ) : null}
                <p className="mt-2">
                  <Link
                    to="/admin/rooms"
                    className="text-[0.8rem] font-medium text-teal-light underline decoration-teal/40"
                  >
                    Open rooms
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
