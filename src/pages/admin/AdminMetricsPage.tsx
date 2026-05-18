import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';

type QueueDepthRow = {
  pool_key: string;
  side: string;
  status: string;
  row_count: number;
  oldest_enqueued_at: string | null;
};

type LatencyRow = {
  pool_key: string;
  matched_count: number;
  avg_match_seconds: number | null;
  max_match_seconds: number | null;
};

type DecryptAuditRow = {
  hour_bucket: string;
  decrypt_count: number;
  distinct_moderators: number;
  distinct_squads: number;
};

type KeyCreationRow = {
  hour_bucket: string;
  squads_created: number;
};

type CrisisOpenRow = {
  id: string;
  squad_id: string;
  reason_code: string;
  created_at: string;
  open_seconds: number;
};

type ClaimFinalizeRow = {
  finalized_count: number;
  pending_count: number;
  finalized_without_verified_user: number;
};

function Stat({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${alert ? 'border-amber/35 bg-amber/5' : 'border-navy-light bg-[#0c1219]'}`}
    >
      <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 font-heading text-[1.4rem] font-bold tabular-nums ${alert ? 'text-amber-200' : 'text-gray-light'}`}
      >
        {value}
      </p>
      {sub ? <p className="mt-0.5 font-sans text-[0.75rem] text-slate-600">{sub}</p> : null}
    </div>
  );
}

function fmtSecs(s: number | null | undefined): string {
  if (s == null) return '—';
  if (s < 60) return `${Math.round(s)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

/**
 * Pilot evidence dashboard — read-only metrics from the observability views.
 * All views return aggregates only; no PII, no message content.
 */
export function AdminMetricsPage() {
  const { supabase } = useAuth();

  const queueQ = useQuery({
    queryKey: ['admin', 'metrics', 'queue-depth'],
    queryFn: async (): Promise<QueueDepthRow[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('pilot_match_queue_depth')
        .select('pool_key, side, status, row_count, oldest_enqueued_at');
      if (error) throw new Error(error.message);
      return (data ?? []) as QueueDepthRow[];
    },
    enabled: !!supabase,
    refetchInterval: 30_000,
  });

  const latencyQ = useQuery({
    queryKey: ['admin', 'metrics', 'latency'],
    queryFn: async (): Promise<LatencyRow[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('pilot_match_latency_24h')
        .select('pool_key, matched_count, avg_match_seconds, max_match_seconds');
      if (error) throw new Error(error.message);
      return (data ?? []) as LatencyRow[];
    },
    enabled: !!supabase,
    refetchInterval: 30_000,
  });

  const decryptQ = useQuery({
    queryKey: ['admin', 'metrics', 'decrypt-audit'],
    queryFn: async (): Promise<DecryptAuditRow[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('pilot_decrypt_audit_24h')
        .select('hour_bucket, decrypt_count, distinct_moderators, distinct_squads');
      if (error) throw new Error(error.message);
      return (data ?? []) as DecryptAuditRow[];
    },
    enabled: !!supabase,
  });

  const keyQ = useQuery({
    queryKey: ['admin', 'metrics', 'key-creation'],
    queryFn: async (): Promise<KeyCreationRow[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('pilot_key_creation_events_24h')
        .select('hour_bucket, squads_created');
      if (error) throw new Error(error.message);
      return (data ?? []) as KeyCreationRow[];
    },
    enabled: !!supabase,
  });

  const crisisOpenQ = useQuery({
    queryKey: ['admin', 'metrics', 'crisis-open'],
    queryFn: async (): Promise<CrisisOpenRow[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('pilot_crisis_alerts_open')
        .select('id, squad_id, reason_code, created_at, open_seconds');
      if (error) throw new Error(error.message);
      return (data ?? []) as CrisisOpenRow[];
    },
    enabled: !!supabase,
    refetchInterval: 20_000,
  });

  const claimQ = useQuery({
    queryKey: ['admin', 'metrics', 'claims'],
    queryFn: async (): Promise<ClaimFinalizeRow | null> => {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('pilot_claim_finalize_24h')
        .select('finalized_count, pending_count, finalized_without_verified_user')
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as ClaimFinalizeRow | null;
    },
    enabled: !!supabase,
  });

  const totalWaiting = (queueQ.data ?? [])
    .filter((r) => r.status === 'waiting')
    .reduce((s, r) => s + r.row_count, 0);

  const totalMatched24h = (latencyQ.data ?? []).reduce((s, r) => s + r.matched_count, 0);

  const avgLatency =
    (latencyQ.data ?? []).length > 0
      ? (latencyQ.data ?? []).reduce((s, r) => s + (r.avg_match_seconds ?? 0), 0) /
        (latencyQ.data ?? []).length
      : null;

  const totalDecrypts24h = (decryptQ.data ?? []).reduce((s, r) => s + r.decrypt_count, 0);

  const squadsCreated24h = (keyQ.data ?? []).reduce((s, r) => s + r.squads_created, 0);

  const openCrisis = (crisisOpenQ.data ?? []).length;
  const dangerOpen = (crisisOpenQ.data ?? []).filter(
    (r) => r.reason_code === 'immediate_danger',
  ).length;

  return (
    <section className="space-y-10" aria-labelledby="metrics-title">
      <header>
        <h1 id="metrics-title" className="font-heading text-xl font-semibold text-gray-light">
          Pilot metrics
        </h1>
        <p className="mt-1 max-w-[66ch] font-sans text-[0.88rem] text-slate-500">
          Read-only operational metrics from the pilot observability views. No PII or message
          content is shown. Auto-refreshes every 30 seconds.
        </p>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Stat
          label="Squads created (24h)"
          value={squadsCreated24h}
          sub="Proxy: squad encryption keys generated"
        />
        <Stat
          label="Participants matched (24h)"
          value={totalMatched24h}
          sub="match_queue rows → matched"
        />
        <Stat
          label="Avg match latency (24h)"
          value={fmtSecs(avgLatency)}
          sub="enqueued_at → matched_at"
        />
        <Stat
          label="Currently waiting"
          value={totalWaiting}
          sub="Active queue entries, last hour"
        />
        <Stat
          label="Moderator decrypts (24h)"
          value={totalDecrypts24h}
          alert={totalDecrypts24h > 10}
          sub="Justify-and-audit decrypt-for-review actions"
        />
        <Stat
          label="Open crisis alerts"
          value={openCrisis}
          alert={openCrisis > 0}
          sub={dangerOpen > 0 ? `${dangerOpen} immediate danger — respond now` : 'Unacknowledged'}
        />
        <Stat
          label="Demo claims finalized (24h)"
          value={claimQ.data?.finalized_count ?? '—'}
          alert={(claimQ.data?.finalized_without_verified_user ?? 0) > 0}
          sub={
            (claimQ.data?.finalized_without_verified_user ?? 0) > 0
              ? '⚠ Claims finalized without verified user — data integrity alert'
              : 'Demo session claims'
          }
        />
        <Stat
          label="Demo claims pending"
          value={claimQ.data?.pending_count ?? '—'}
          sub="Unconsumed claim tokens (24h)"
        />
      </div>

      {/* Match latency by pool */}
      <div className="rounded-[10px] border border-navy-light bg-[#0f1623] p-5">
        <h2 className="font-heading text-[0.95rem] font-semibold text-gray-light">
          Match latency by pool (24h)
        </h2>
        {latencyQ.isPending ? (
          <p className="mt-3 font-sans text-[0.85rem] text-slate-500">Loading…</p>
        ) : (latencyQ.data ?? []).length === 0 ? (
          <p className="mt-3 font-sans text-[0.85rem] text-slate-500">No matched rows in 24h.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse font-sans text-[0.82rem] text-slate-300">
              <thead>
                <tr className="border-b border-navy-light text-left text-[0.72rem] uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4">Pool</th>
                  <th className="pb-2 pr-4">Matched</th>
                  <th className="pb-2 pr-4">Avg latency</th>
                  <th className="pb-2">Max latency</th>
                </tr>
              </thead>
              <tbody>
                {(latencyQ.data ?? []).map((r) => (
                  <tr key={r.pool_key} className="border-b border-navy-light/40">
                    <td className="py-2 pr-4 font-mono text-[0.75rem] text-slate-400">
                      {r.pool_key}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{r.matched_count}</td>
                    <td className="py-2 pr-4 tabular-nums">{fmtSecs(r.avg_match_seconds)}</td>
                    <td className="py-2 tabular-nums">{fmtSecs(r.max_match_seconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Moderator decrypt volume */}
      <div className="rounded-[10px] border border-navy-light bg-[#0f1623] p-5">
        <h2 className="font-heading text-[0.95rem] font-semibold text-gray-light">
          Moderator decrypt volume (24h, hourly)
        </h2>
        <p className="mt-1 font-sans text-[0.8rem] text-slate-500">
          Alert if multiple moderators decrypt many squads in the same hour (potential abuse).
        </p>
        {decryptQ.isPending ? (
          <p className="mt-3 font-sans text-[0.85rem] text-slate-500">Loading…</p>
        ) : (decryptQ.data ?? []).length === 0 ? (
          <p className="mt-3 font-sans text-[0.85rem] text-slate-500">No decrypt events in 24h.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse font-sans text-[0.82rem] text-slate-300">
              <thead>
                <tr className="border-b border-navy-light text-left text-[0.72rem] uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4">Hour (UTC)</th>
                  <th className="pb-2 pr-4">Decrypts</th>
                  <th className="pb-2 pr-4">Moderators</th>
                  <th className="pb-2">Squads</th>
                </tr>
              </thead>
              <tbody>
                {(decryptQ.data ?? []).map((r) => (
                  <tr
                    key={r.hour_bucket}
                    className={`border-b border-navy-light/40 ${r.decrypt_count > 5 ? 'text-amber-200' : ''}`}
                  >
                    <td className="py-2 pr-4 font-mono text-[0.75rem] text-slate-400">
                      {r.hour_bucket.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{r.decrypt_count}</td>
                    <td className="py-2 pr-4 tabular-nums">{r.distinct_moderators}</td>
                    <td className="py-2 tabular-nums">{r.distinct_squads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Queue depth snapshot */}
      <div className="rounded-[10px] border border-navy-light bg-[#0f1623] p-5">
        <h2 className="font-heading text-[0.95rem] font-semibold text-gray-light">
          Match queue depth (last hour)
        </h2>
        {queueQ.isPending ? (
          <p className="mt-3 font-sans text-[0.85rem] text-slate-500">Loading…</p>
        ) : (queueQ.data ?? []).length === 0 ? (
          <p className="mt-3 font-sans text-[0.85rem] text-slate-500">
            No queue activity in the last hour.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse font-sans text-[0.82rem] text-slate-300">
              <thead>
                <tr className="border-b border-navy-light text-left text-[0.72rem] uppercase tracking-wide text-slate-500">
                  <th className="pb-2 pr-4">Pool</th>
                  <th className="pb-2 pr-4">Side</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Count</th>
                  <th className="pb-2">Oldest</th>
                </tr>
              </thead>
              <tbody>
                {(queueQ.data ?? []).map((r, i) => (
                  <tr key={i} className="border-b border-navy-light/40">
                    <td className="py-2 pr-4 font-mono text-[0.75rem] text-slate-400">
                      {r.pool_key}
                    </td>
                    <td className="py-2 pr-4">{r.side}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`rounded px-1 py-0.5 font-mono text-[0.65rem] ${
                          r.status === 'waiting'
                            ? 'bg-amber/10 text-amber-200'
                            : 'bg-teal/10 text-teal-light'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{r.row_count}</td>
                    <td className="py-2 font-mono text-[0.72rem] text-slate-500">
                      {r.oldest_enqueued_at
                        ? new Date(r.oldest_enqueued_at).toLocaleTimeString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open crisis alerts quick view */}
      {openCrisis > 0 && (
        <div className="rounded-[10px] border border-amber/35 bg-amber/5 p-5">
          <h2 className="font-heading text-[0.95rem] font-semibold text-amber-200">
            Open crisis alerts (unacknowledged)
          </h2>
          <ul className="mt-3 space-y-2">
            {(crisisOpenQ.data ?? []).map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded border border-navy-light bg-[#0c1219] px-3 py-2 font-sans text-[0.82rem]"
              >
                <span className="font-mono text-[0.75rem] text-slate-400">
                  {r.id.slice(0, 8)}… · squad {r.squad_id.slice(0, 8)}…
                </span>
                <span className="text-amber-200">{r.reason_code}</span>
                <span className="text-slate-500">
                  Open {Math.round(Number(r.open_seconds) / 60)}m
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
