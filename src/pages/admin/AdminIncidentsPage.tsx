import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

type CrisisAlertRow = {
  id: string;
  actor_user_id: string;
  squad_id: string;
  reason_code: 'immediate_danger' | 'request_pause' | 'request_facilitator';
  created_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
};

const REASON_LABELS: Record<CrisisAlertRow['reason_code'], string> = {
  immediate_danger: 'Immediate danger',
  request_pause: 'Request pause',
  request_facilitator: 'Ask for facilitator',
};

const REASON_SEVERITY: Record<CrisisAlertRow['reason_code'], 'red' | 'amber' | 'teal'> = {
  immediate_danger: 'red',
  request_pause: 'amber',
  request_facilitator: 'teal',
};

function severityClasses(sev: 'red' | 'amber' | 'teal') {
  switch (sev) {
    case 'red':
      return 'border-red-500/40 bg-red-500/10 text-red-300';
    case 'amber':
      return 'border-amber/40 bg-amber/10 text-amber-200';
    default:
      return 'border-teal/40 bg-teal/10 text-teal-light';
  }
}

function formatAge(createdAt: string): string {
  const secs = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const OPEN_CARD_CLASSES: Record<'red' | 'amber' | 'teal', string> = {
  red: 'border-red-500/35 bg-red-500/5',
  amber: 'border-amber/35 bg-amber/5',
  teal: 'border-teal/35 bg-teal/5',
};

function openCardClass(sev: 'red' | 'amber' | 'teal'): string {
  return OPEN_CARD_CLASSES[sev];
}

function buildExportText(rows: CrisisAlertRow[]): string {
  const lines = [
    'SquadRidge Incident Summary Export',
    `Generated: ${new Date().toISOString()}`,
    `Total incidents: ${rows.length}`,
    `Open (unacknowledged): ${rows.filter((r) => !r.acknowledged_at).length}`,
    `Acknowledged: ${rows.filter((r) => !!r.acknowledged_at).length}`,
    '',
    '--- Incident log ---',
  ];
  for (const r of rows) {
    lines.push(
      `[${r.id.slice(0, 8)}] ${r.created_at.slice(0, 19).replace('T', ' ')}Z  ` +
        `reason=${r.reason_code}  squad=${r.squad_id.slice(0, 8)}  ` +
        (r.acknowledged_at ? `acked=${r.acknowledged_at.slice(0, 19).replace('T', ' ')}Z` : 'OPEN'),
    );
  }
  return lines.join('\n');
}

/**
 * Full crisis-alert incident console for moderators.
 *
 * - Lists all alerts (open + acknowledged), newest first.
 * - Allows one-click acknowledgement (flips `acknowledged_at` / `acknowledged_by`).
 * - Shows response-time SLA colour (green < 5 min, amber 5-15 min, red > 15 min).
 * - "Export summary" downloads a plain-text partner report.
 */
export function AdminIncidentsPage() {
  const { supabase, session } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'open' | 'acked'>('open');
  const [squadFilter, setSquadFilter] = useState('');

  const alertsQ = useQuery({
    queryKey: ['admin', 'incidents', 'all'],
    queryFn: async (): Promise<CrisisAlertRow[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('crisis_alerts')
        .select(
          'id, actor_user_id, squad_id, reason_code, created_at, acknowledged_at, acknowledged_by',
        )
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw new Error(error.message);
      return (data ?? []) as CrisisAlertRow[];
    },
    enabled: !!supabase,
    refetchInterval: 20_000,
  });

  const ackMutation = useMutation({
    mutationFn: async (alertId: string) => {
      if (!supabase || !session?.user?.id) throw new Error('Not signed in');
      const { error } = await supabase
        .from('crisis_alerts')
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: session.user.id,
        })
        .eq('id', alertId);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'incidents'] });
      toast.success('Alert acknowledged and logged.');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = alertsQ.data ?? [];

  const filtered = useMemo(() => {
    let list = rows;
    if (filter === 'open') list = list.filter((r) => !r.acknowledged_at);
    if (filter === 'acked') list = list.filter((r) => !!r.acknowledged_at);
    const sq = squadFilter.trim().toLowerCase();
    if (sq) list = list.filter((r) => r.squad_id.toLowerCase().includes(sq));
    return list;
  }, [rows, filter, squadFilter]);

  const openCount = rows.filter((r) => !r.acknowledged_at).length;
  const dangerCount = rows.filter(
    (r) => !r.acknowledged_at && r.reason_code === 'immediate_danger',
  ).length;

  function handleExport() {
    const text = buildExportText(rows);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `squadridge-incidents-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function slaColour(createdAt: string, ackedAt: string | null): 'green' | 'amber' | 'red' {
    const endMs = ackedAt ? new Date(ackedAt).getTime() : Date.now();
    const mins = (endMs - new Date(createdAt).getTime()) / 60_000;
    if (mins < 5) return 'green';
    if (mins < 15) return 'amber';
    return 'red';
  }

  const slaClass = {
    green: 'text-teal-light',
    amber: 'text-amber-200',
    red: 'text-red-400',
  };

  return (
    <section className="space-y-8" aria-labelledby="incidents-title">
      <header>
        <h1 id="incidents-title" className="font-heading text-xl font-semibold text-gray-light">
          Incident console
        </h1>
        <p className="mt-1 max-w-[66ch] font-sans text-[0.88rem] text-slate-500">
          Out-of-band crisis alerts from squad participants. Acknowledge to close the open count.
          Response-time SLA: green &lt;5 min · amber &lt;15 min · red ≥15 min.
        </p>

        {dangerCount > 0 ? (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 font-sans text-[0.88rem] font-semibold text-red-300"
          >
            ⚠ {dangerCount} unacknowledged <strong>immediate danger</strong> alert
            {dangerCount > 1 ? 's' : ''} — respond now.
          </div>
        ) : openCount > 0 ? (
          <div
            role="status"
            className="mt-4 rounded-lg border border-amber/35 bg-amber/10 px-4 py-3 font-sans text-[0.85rem] text-amber-200"
          >
            {openCount} open alert{openCount > 1 ? 's' : ''} awaiting acknowledgement.
          </div>
        ) : (
          <div
            role="status"
            className="mt-4 rounded-lg border border-teal/30 bg-teal/5 px-4 py-3 font-sans text-[0.85rem] text-teal-light"
          >
            No open incidents. All alerts acknowledged.
          </div>
        )}
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-md border border-navy-light overflow-hidden">
          {(['open', 'acked', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 font-sans text-[0.8rem] capitalize transition-colors ${
                filter === f
                  ? 'bg-white/[0.08] text-slate-100'
                  : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
              }`}
            >
              {f === 'acked' ? 'Acknowledged' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1 font-sans text-[0.75rem] text-slate-500">
          <span className="sr-only">Filter by squad ID</span>
          <input
            type="search"
            value={squadFilter}
            onChange={(e) => setSquadFilter(e.target.value)}
            placeholder="Filter by squad ID…"
            className="min-h-[36px] rounded-lg border border-navy-light bg-[#0a1018] px-3 text-[0.85rem] text-slate-200 placeholder:text-slate-600 focus:border-teal/40 focus:outline-none"
          />
        </label>

        <button
          type="button"
          onClick={handleExport}
          className="ml-auto inline-flex min-h-[36px] items-center rounded-lg border border-navy-light px-3 font-sans text-[0.8rem] text-slate-300 transition-colors hover:bg-white/[0.04]"
        >
          Export summary
        </button>
      </div>

      {/* Table */}
      {alertsQ.isPending ? (
        <p className="font-sans text-[0.875rem] text-slate-500">Loading…</p>
      ) : alertsQ.isError ? (
        <p className="font-sans text-[0.875rem] text-amber" role="alert">
          {alertsQ.error instanceof Error ? alertsQ.error.message : 'Could not load alerts.'}
        </p>
      ) : filtered.length === 0 ? (
        <p className="font-sans text-[0.875rem] text-slate-500">No incidents in this view.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => {
            const sev = REASON_SEVERITY[r.reason_code];
            const sla = slaColour(r.created_at, r.acknowledged_at);
            const open = !r.acknowledged_at;
            return (
              <li
                key={r.id}
                className={`rounded-lg border p-4 ${open ? openCardClass(sev) : 'border-navy-light bg-[#0c1219]'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[0.68rem] font-semibold uppercase tracking-wide ${severityClasses(sev)}`}
                      >
                        {REASON_LABELS[r.reason_code]}
                      </span>
                      {open ? (
                        <span className="rounded border border-amber/30 bg-amber/10 px-1.5 py-0.5 font-mono text-[0.65rem] text-amber-200">
                          OPEN
                        </span>
                      ) : (
                        <span className="rounded border border-teal/25 bg-teal/8 px-1.5 py-0.5 font-mono text-[0.65rem] text-teal-light">
                          ACKED
                        </span>
                      )}
                    </div>

                    <p className="font-mono text-[0.75rem] text-slate-400">
                      Squad{' '}
                      <Link
                        to={`/session/${r.squad_id}`}
                        className="text-teal-light underline decoration-teal/30 underline-offset-2 hover:decoration-teal"
                      >
                        {r.squad_id.slice(0, 8)}…
                      </Link>
                      <span className="ml-3 text-slate-600">{r.id.slice(0, 8)}…</span>
                    </p>

                    <p className="font-sans text-[0.78rem] text-slate-500">
                      Raised {formatAge(r.created_at)} ·{' '}
                      <span className="font-medium text-slate-400">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </p>

                    {r.acknowledged_at && (
                      <p className="font-sans text-[0.78rem] text-slate-500">
                        Acknowledged {formatAge(r.acknowledged_at)} ·{' '}
                        <span className="font-medium text-slate-400">
                          {new Date(r.acknowledged_at).toLocaleString()}
                        </span>
                      </p>
                    )}

                    <p className="font-sans text-[0.78rem]">
                      Response time:{' '}
                      <span className={`font-medium ${slaClass[sla]}`}>
                        {(() => {
                          const endMs = r.acknowledged_at
                            ? new Date(r.acknowledged_at).getTime()
                            : Date.now();
                          const secs = Math.floor(
                            (endMs - new Date(r.created_at).getTime()) / 1000,
                          );
                          if (secs < 60) return `${secs}s`;
                          if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
                          return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
                        })()}
                        {open ? ' (ongoing)' : ''}
                      </span>
                    </p>
                  </div>

                  {open && (
                    <button
                      type="button"
                      disabled={ackMutation.isPending}
                      onClick={() => ackMutation.mutate(r.id)}
                      className="inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-md border border-teal/40 bg-teal/10 px-3 font-heading text-[0.8rem] font-semibold text-teal-light transition-colors hover:border-teal/60 hover:bg-teal/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {ackMutation.isPending ? 'Saving…' : 'Acknowledge'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
