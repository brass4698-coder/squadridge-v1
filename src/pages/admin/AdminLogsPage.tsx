import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type AuditRow = {
  id: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  created_at: string;
  actor_user_id: string;
  metadata: Record<string, unknown>;
};

/**
 * Read-only view of `moderation_audit_log` (append-only; moderators RLS).
 */
export function AdminLogsPage() {
  const { supabase } = useAuth();
  const [q, setQ] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'audit', 'full'],
    queryFn: async (): Promise<AuditRow[]> => {
      if (!supabase) return [];
      const { data: rows, error: e } = await supabase
        .from('moderation_audit_log')
        .select('id, action, target_type, target_id, created_at, actor_user_id, metadata')
        .order('created_at', { ascending: false })
        .limit(200);
      if (e) throw new Error(e.message);
      return (rows ?? []) as AuditRow[];
    },
    enabled: !!supabase,
  });

  const rows = useMemo(() => {
    const list = data ?? [];
    const t = q.trim().toLowerCase();
    if (!t) return list;
    return list.filter(
      (r) =>
        r.action.toLowerCase().includes(t) ||
        (r.target_type?.toLowerCase().includes(t) ?? false) ||
        r.id.toLowerCase().includes(t),
    );
  }, [data, q]);

  return (
    <section className="space-y-4" aria-labelledby="admin-logs">
      <header>
        <h1 id="admin-logs" className="font-heading text-xl font-semibold text-gray-light">
          Audit log
        </h1>
        <p className="mt-1 max-w-[60ch] font-sans text-[0.88rem] text-slate-500">
          Human moderation events: actor, timestamp, action, and target. Search filters the loaded
          window.
        </p>
        <label className="mt-3 block max-w-sm font-sans text-[0.75rem] text-slate-500">
          Search
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-light bg-[#0a1018] px-3 py-2 text-[0.9rem] text-slate-200"
            placeholder="action, type, id…"
          />
        </label>
      </header>
      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : isError ? (
        <p className="text-amber" role="alert">
          {error instanceof Error ? error.message : 'Could not load log.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-navy-light">
          <table className="w-full min-w-[640px] font-sans text-left text-[0.8rem] text-slate-300">
            <thead className="bg-[#0f1623] text-[0.7rem] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="p-2">Time</th>
                <th className="p-2">Action</th>
                <th className="p-2">Target</th>
                <th className="p-2">Actor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-navy-light/80">
                  <td className="p-2 font-mono text-slate-400">
                    {new Date(r.created_at).toISOString().replace('T', ' ').slice(0, 19)}
                  </td>
                  <td className="p-2">
                    <span className="rounded border border-amber/40 bg-amber/10 px-1.5 py-0.5 text-amber-200">
                      {r.action}
                    </span>
                  </td>
                  <td className="max-w-xs truncate p-2 font-mono text-[0.75rem] text-slate-500">
                    {r.target_type ?? '—'} {r.target_id ? `· ${r.target_id.slice(0, 8)}…` : ''}
                  </td>
                  <td className="p-2 font-mono text-[0.75rem] text-slate-500">
                    {r.actor_user_id.slice(0, 8)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
