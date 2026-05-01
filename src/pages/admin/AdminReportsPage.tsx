import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

type ReportRow = {
  id: string;
  squad_id: string;
  report_type: 'room' | 'participant';
  target_user_id: string | null;
  reason: string;
  evidence: string | null;
  status: 'open' | 'triaged' | 'in_review' | 'resolved' | 'dismissed';
  assigned_moderator_user_id: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  reporter_user_id: string;
  created_at: string;
  updated_at: string;
};

/**
 * Moderator queue for persisted participant/room reports.
 */
export function AdminReportsPage() {
  const { supabase, session } = useAuth();
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'session-reports'],
    queryFn: async (): Promise<ReportRow[]> => {
      if (!supabase) return [];
      const { data: rows, error: e } = await supabase
        .from('session_reports')
        .select(
          'id, squad_id, report_type, target_user_id, reason, evidence, status, assigned_moderator_user_id, resolution_notes, resolved_at, reporter_user_id, created_at, updated_at',
        )
        .order('created_at', { ascending: false })
        .limit(150);
      if (e) throw new Error(e.message);
      return (rows ?? []) as ReportRow[];
    },
    enabled: !!supabase,
  });

  const list = useMemo(() => {
    const rows = data ?? [];
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(t) ||
        r.squad_id.toLowerCase().includes(t) ||
        r.reason.toLowerCase().includes(t) ||
        (r.target_user_id && r.target_user_id.toLowerCase().includes(t)),
    );
  }, [data, q]);

  const repeatCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      if (!row.target_user_id) continue;
      counts.set(row.target_user_id, (counts.get(row.target_user_id) ?? 0) + 1);
    }
    return counts;
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async ({ reportId, patch }: { reportId: string; patch: Partial<ReportRow> }) => {
      if (!supabase) throw new Error('No client');
      const { error: updateError } = await supabase
        .from('session_reports')
        .update(patch)
        .eq('id', reportId);
      if (updateError) throw new Error(updateError.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'session-reports'] });
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  return (
    <section className="space-y-4" aria-labelledby="admin-reports">
      <header>
        <h1 id="admin-reports" className="font-heading text-xl font-semibold text-gray-light">
          Report queue
        </h1>
        <p className="mt-1 max-w-[60ch] font-sans text-[0.88rem] text-slate-500">
          Participant and room reports filed from live sessions. Moderators can assign cases,
          advance triage state, and store resolution notes without leaving the queue.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="max-w-sm flex-1 font-sans text-[0.75rem] text-slate-500">
            Search
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-light bg-[#0a1018] px-3 py-2 text-[0.9rem] text-slate-200"
            />
          </label>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-5 inline-flex min-h-[40px] items-center rounded-lg border border-navy-light px-3 text-[0.85rem] text-slate-300 hover:bg-navy-light/30"
          >
            Refresh
          </button>
        </div>
      </header>
      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : isError ? (
        <p className="text-amber" role="alert">
          {error instanceof Error ? error.message : 'Could not load reports.'}
        </p>
      ) : list.length === 0 ? (
        <p className="text-slate-500">No reports in window.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => {
            const repeatCount = r.target_user_id ? (repeatCounts.get(r.target_user_id) ?? 0) : 0;
            const draft = noteDrafts[r.id] ?? r.resolution_notes ?? '';
            return (
              <li
                key={r.id}
                className="rounded-lg border border-navy-light bg-[#0f1623] p-4 font-sans text-[0.85rem] text-slate-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-amber/30 bg-amber/10 px-1.5 py-0.5 text-[0.7rem] text-amber-200">
                        {r.status}
                      </span>
                      <span className="rounded border border-white/10 px-1.5 py-0.5 text-[0.7rem] text-slate-400">
                        {r.report_type}
                      </span>
                    </div>
                    <div className="mt-2 font-mono text-[0.8rem] text-slate-200">report {r.id}</div>
                    <div className="mt-1 text-slate-500">
                      Squad <span className="font-mono text-slate-400">{r.squad_id}</span>
                    </div>
                    {r.target_user_id ? (
                      <div className="mt-1 text-slate-500">
                        Target <span className="font-mono text-slate-400">{r.target_user_id}</span>
                        {repeatCount > 1 ? (
                          <span className="ml-2 rounded border border-rose-300/20 bg-rose-300/10 px-1.5 py-0.5 text-[0.68rem] text-rose-200">
                            {repeatCount} reports on this participant
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="mt-1 text-slate-500">
                      Reporter{' '}
                      <span className="font-mono text-slate-400">{r.reporter_user_id}</span>
                    </div>
                    <p className="mt-3 text-slate-200">{r.reason}</p>
                    {r.evidence ? (
                      <p className="mt-2 whitespace-pre-wrap text-slate-400">{r.evidence}</p>
                    ) : null}
                  </div>
                  <div className="text-right text-[0.72rem] text-slate-500">
                    <div>Created {new Date(r.created_at).toLocaleString()}</div>
                    <div className="mt-1">Updated {new Date(r.updated_at).toLocaleString()}</div>
                    <div className="mt-1">
                      {r.assigned_moderator_user_id
                        ? `Assigned ${r.assigned_moderator_user_id}`
                        : 'Unassigned'}
                    </div>
                    {r.resolved_at ? (
                      <div className="mt-1">
                        Resolved {new Date(r.resolved_at).toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="mt-4 block text-[0.75rem] text-slate-500">
                  Resolution notes
                  <textarea
                    value={draft}
                    onChange={(e) =>
                      setNoteDrafts((prev) => ({
                        ...prev,
                        [r.id]: e.target.value,
                      }))
                    }
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-navy-light bg-[#0a1018] px-3 py-2 text-[0.85rem] text-slate-200"
                    placeholder="Moderator notes, follow-up, external ticket, or outcome"
                  />
                </label>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        reportId: r.id,
                        patch: {
                          assigned_moderator_user_id: session?.user?.id ?? null,
                          status: r.status === 'open' ? 'triaged' : r.status,
                        },
                      })
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-[0.8rem] text-slate-200 hover:border-teal/35 disabled:opacity-50"
                  >
                    Assign to me
                  </button>
                  <button
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        reportId: r.id,
                        patch: {
                          status: 'in_review',
                          assigned_moderator_user_id:
                            r.assigned_moderator_user_id ?? session?.user?.id ?? null,
                        },
                      })
                    }
                    className="rounded-lg border border-white/10 px-3 py-2 text-[0.8rem] text-slate-200 hover:border-teal/35 disabled:opacity-50"
                  >
                    Mark in review
                  </button>
                  <button
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        reportId: r.id,
                        patch: {
                          status: 'resolved',
                          assigned_moderator_user_id:
                            r.assigned_moderator_user_id ?? session?.user?.id ?? null,
                          resolution_notes: draft.trim() || r.resolution_notes,
                          resolved_at: new Date().toISOString(),
                        },
                      })
                    }
                    className="rounded-lg bg-teal px-3 py-2 text-[0.8rem] font-medium text-[#0b0f1a] hover:opacity-90 disabled:opacity-50"
                  >
                    Resolve
                  </button>
                  <button
                    type="button"
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        reportId: r.id,
                        patch: {
                          status: 'dismissed',
                          assigned_moderator_user_id:
                            r.assigned_moderator_user_id ?? session?.user?.id ?? null,
                          resolution_notes: draft.trim() || r.resolution_notes,
                          resolved_at: new Date().toISOString(),
                        },
                      })
                    }
                    className="rounded-lg border border-amber/30 px-3 py-2 text-[0.8rem] text-amber-200 hover:border-amber/45 disabled:opacity-50"
                  >
                    Dismiss
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
