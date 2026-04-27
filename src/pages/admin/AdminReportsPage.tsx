import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type FlaggedRow = {
  id: string;
  squad_id: string | null;
  sent_at: string;
  status: string;
};

/**
 * Triage surface for `messages.status = 'flagged'` (moderator read-all policy).
 */
export function AdminReportsPage() {
  const { supabase } = useAuth();
  const [q, setQ] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
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

  const list = useMemo(() => {
    const rows = data ?? [];
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter(
      (r) => r.id.toLowerCase().includes(t) || (r.squad_id && r.squad_id.toLowerCase().includes(t)),
    );
  }, [data, q]);

  return (
    <section className="space-y-4" aria-labelledby="admin-reports">
      <header>
        <h1 id="admin-reports" className="font-heading text-xl font-semibold text-gray-light">
          Report queue
        </h1>
        <p className="mt-1 max-w-[60ch] font-sans text-[0.88rem] text-slate-500">
          Message rows flagged for review. Ciphertext is stored in DB; open the room in Rooms for
          context.
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
        <p className="text-slate-500">No flagged messages in window.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((r) => (
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
      )}
    </section>
  );
}
