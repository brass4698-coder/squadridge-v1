import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { ParticipantReportStatus } from '../../lib';

type FlaggedRow = {
  id: string;
  squad_id: string | null;
  sent_at: string;
  status: string;
};

type ParticipantReportRow = {
  id: string;
  squad_id: string;
  report_type: string;
  reason_code: string;
  context_note: string | null;
  status: string;
  created_at: string;
  target_user_id: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  moderator_note: string | null;
};

/**
 * Triage surface for participant-submitted reports and flagged messages.
 */
export function AdminReportsPage() {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');

  const reportsQuery = useQuery({
    queryKey: ['admin', 'participant', 'reports'],
    queryFn: async (): Promise<ParticipantReportRow[]> => {
      if (!supabase) return [];
      const { data: rows, error: e } = await supabase
        .from('participant_reports')
        .select(
          'id, squad_id, report_type, reason_code, context_note, status, created_at, target_user_id, reviewed_at, reviewed_by, moderator_note',
        )
        .in('status', ['open', 'reviewing'])
        .order('created_at', { ascending: false })
        .limit(150);
      if (e) throw new Error(e.message);
      return (rows ?? []) as ParticipantReportRow[];
    },
    enabled: !!supabase,
  });

  const flaggedQuery = useQuery({
    queryKey: ['admin', 'flagged', 'messages'],
    queryFn: async (): Promise<FlaggedRow[]> => {
      if (!supabase) return [];
      const { data: rows, error: e } = await supabase
        .from('messages')
        .select('id, squad_id, sent_at, status')
        .eq('status', 'flagged')
        .order('sent_at', { ascending: false })
        .limit(150);
      if (e) throw new Error(e.message);
      return (rows ?? []) as FlaggedRow[];
    },
    enabled: !!supabase,
  });

  const reportList = useMemo(() => {
    const rows = reportsQuery.data ?? [];
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (r) =>
        r.id.toLowerCase().includes(t) ||
        r.squad_id.toLowerCase().includes(t) ||
        r.report_type.toLowerCase().includes(t) ||
        r.reason_code.toLowerCase().includes(t),
    );
  }, [reportsQuery.data, q]);

  const flaggedList = useMemo(() => {
    const rows = flaggedQuery.data ?? [];
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (r) => r.id.toLowerCase().includes(t) || (r.squad_id && r.squad_id.toLowerCase().includes(t)),
    );
  }, [flaggedQuery.data, q]);

  const isLoading = reportsQuery.isLoading || flaggedQuery.isLoading;
  const isError = reportsQuery.isError || flaggedQuery.isError;
  const error = reportsQuery.error ?? flaggedQuery.error;
  const refetch = () => {
    void reportsQuery.refetch();
    void flaggedQuery.refetch();
  };

  const updateReportStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: Extract<ParticipantReportStatus, 'reviewing' | 'resolved' | 'dismissed'>;
      note?: string | null;
    }) => {
      if (!supabase) throw new Error('Supabase is not configured.');
      const { error } = await supabase.rpc('moderator_update_participant_report', {
        p_report_id: id,
        p_status: status,
        p_moderator_note: note ?? null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'participant', 'reports'] });
    },
  });

  return (
    <section className="space-y-4" aria-labelledby="admin-reports">
      <header>
        <h1 id="admin-reports" className="font-heading text-xl font-semibold text-gray-light">
          Report queue
        </h1>
        <p className="mt-1 max-w-[66ch] font-sans text-[0.88rem] leading-relaxed text-ink-faint">
          Participant-submitted reports plus message rows flagged for review. Treat this as a safety
          ledger: change status deliberately, and open room context only when review requires it.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="max-w-sm flex-1 font-sans text-[0.75rem] text-slate-500">
            Search
            <input value={q} onChange={(e) => setQ(e.target.value)} className="sr-input mt-1" />
          </label>
          <button
            type="button"
            onClick={refetch}
            className="btn-secondary mt-5 min-h-[44px] px-3 text-[0.85rem]"
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
      ) : reportList.length === 0 && flaggedList.length === 0 ? (
        <p className="text-slate-500">No open participant reports or flagged messages in window.</p>
      ) : (
        <div className="space-y-5">
          {reportList.length > 0 ? (
            <section aria-labelledby="participant-report-list">
              <h2
                id="participant-report-list"
                className="font-heading text-[0.9rem] font-semibold text-slate-300"
              >
                Participant reports
              </h2>
              <ul className="mt-2 space-y-2">
                {reportList.map((r) => (
                  <li
                    key={r.id}
                    className="border border-line bg-surface-elevated p-4 font-sans text-[0.85rem] text-ink-secondary"
                  >
                    <span className="text-[0.7rem] text-slate-500">{r.created_at}</span>
                    <div className="mt-1 font-mono text-[0.8rem] text-slate-200">report {r.id}</div>
                    <div className="mt-1 text-slate-500">
                      Squad{' '}
                      <span className="font-mono text-slate-400">
                        {r.squad_id.slice(0, 8)}…{r.squad_id.slice(-4)}
                      </span>
                    </div>
                    {r.target_user_id ? (
                      <div className="mt-1 text-slate-500">
                        Target{' '}
                        <span className="font-mono text-slate-400">
                          {r.target_user_id.slice(0, 8)}…{r.target_user_id.slice(-4)}
                        </span>
                      </div>
                    ) : null}
                    {r.context_note ? (
                      <p className="mt-2 rounded border border-white/[0.06] bg-[#0a1018] px-3 py-2 text-slate-300">
                        {r.context_note}
                      </p>
                    ) : null}
                    {r.moderator_note ? (
                      <p className="mt-2 rounded border border-teal/20 bg-teal/[0.06] px-3 py-2 text-teal-light">
                        Moderator note: {r.moderator_note}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-block rounded border border-amber/30 bg-amber/10 px-1.5 py-0.5 text-[0.7rem] text-amber-200">
                        {r.status}
                      </span>
                      <span className="inline-block rounded border border-slate-700 px-1.5 py-0.5 text-[0.7rem] text-slate-400">
                        {r.report_type}
                      </span>
                      <span className="inline-block rounded border border-slate-700 px-1.5 py-0.5 text-[0.7rem] text-slate-400">
                        {r.reason_code}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-line-divider pt-3">
                      {r.status === 'open' ? (
                        <button
                          type="button"
                          className="btn-secondary min-h-[44px] px-3 text-[0.78rem]"
                          disabled={updateReportStatus.isPending}
                          onClick={() =>
                            updateReportStatus.mutate({ id: r.id, status: 'reviewing' })
                          }
                        >
                          Mark reviewing
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn-secondary min-h-[44px] px-3 text-[0.78rem]"
                        disabled={updateReportStatus.isPending}
                        onClick={() => {
                          const note = window.prompt('Optional moderator note for resolution:');
                          if (note !== null) {
                            updateReportStatus.mutate({ id: r.id, status: 'resolved', note });
                          }
                        }}
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        className="btn-secondary min-h-[44px] px-3 text-[0.78rem]"
                        disabled={updateReportStatus.isPending}
                        onClick={() => {
                          const note = window.prompt('Optional moderator note for dismissal:');
                          if (note !== null) {
                            updateReportStatus.mutate({ id: r.id, status: 'dismissed', note });
                          }
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {flaggedList.length > 0 ? (
            <section aria-labelledby="flagged-message-list">
              <h2
                id="flagged-message-list"
                className="font-heading text-[0.9rem] font-semibold text-slate-300"
              >
                Flagged messages
              </h2>
              <ul className="mt-2 space-y-2">
                {flaggedList.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-lg border border-navy-light bg-[#0f1623] p-3 font-sans text-[0.85rem] text-slate-300"
                  >
                    <span className="text-[0.7rem] text-slate-500">{r.sent_at}</span>
                    <div className="mt-1 font-mono text-[0.8rem] text-slate-200">msg {r.id}</div>
                    {r.squad_id ? (
                      <div className="mt-1 text-slate-500">
                        Squad{' '}
                        <span className="font-mono text-slate-400">
                          {r.squad_id.slice(0, 8)}…{r.squad_id.slice(-4)}
                        </span>
                      </div>
                    ) : null}
                    <span className="mt-2 inline-block rounded border border-amber/30 bg-amber/10 px-1.5 py-0.5 text-[0.7rem] text-amber-200">
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </section>
  );
}
