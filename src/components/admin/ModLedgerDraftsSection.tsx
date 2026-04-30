import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib';

type DraftRow = Pick<
  Database['public']['Tables']['ledger_proposals']['Row'],
  'id' | 'slug' | 'title' | 'summary' | 'squad_id' | 'created_at'
>;

type SummaryRow = Database['public']['Views']['ledger_proposal_vote_summary']['Row'];

interface DraftWithSummary extends DraftRow {
  summary_counts: {
    approve: number;
    reject: number;
    abstain: number;
    eligible: number;
  };
}

/**
 * Moderator-facing list of pending ledger drafts. Shows the current vote tally
 * for each so a moderator can see at a glance which drafts have hit the
 * threshold and are ready to publish via the in-room panel.
 */
export function ModLedgerDraftsSection() {
  const { supabase } = useAuth();
  const draftsQ = useQuery({
    queryKey: ['mod', 'ledger', 'drafts'],
    queryFn: async (): Promise<DraftWithSummary[]> => {
      if (!supabase) return [];
      const { data: drafts, error: dErr } = await supabase
        .from('ledger_proposals')
        .select('id, slug, title, summary, squad_id, created_at')
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(50);
      if (dErr) throw new Error(dErr.message);
      const rows = (drafts ?? []) as DraftRow[];
      if (rows.length === 0) return [];
      const ids = rows.map((r) => r.id);
      const { data: summaries, error: sErr } = await supabase
        .from('ledger_proposal_vote_summary')
        .select(
          'proposal_id, squad_id, status, approve_count, reject_count, abstain_count, total_eligible',
        )
        .in('proposal_id', ids);
      if (sErr) throw new Error(sErr.message);
      const byId = new Map<string, SummaryRow>();
      for (const s of (summaries ?? []) as SummaryRow[]) byId.set(s.proposal_id, s);
      return rows.map((r) => {
        const s = byId.get(r.id);
        return {
          ...r,
          summary_counts: {
            approve: s?.approve_count ?? 0,
            reject: s?.reject_count ?? 0,
            abstain: s?.abstain_count ?? 0,
            eligible: s?.total_eligible ?? 0,
          },
        };
      });
    },
    enabled: !!supabase,
    refetchInterval: 15000,
  });

  return (
    <section
      aria-labelledby="mod-ledger-drafts-heading"
      className="rounded-lg border border-navy-light bg-[#0c1219] p-4"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2
          id="mod-ledger-drafts-heading"
          className="font-heading text-[1rem] font-semibold text-slate-200"
        >
          Pending ledger drafts
        </h2>
        <p className="font-sans text-[0.78rem] text-slate-500">
          Open the originating room to publish.
        </p>
      </header>
      {draftsQ.isLoading ? (
        <p className="mt-3 font-sans text-[0.85rem] text-slate-500">Loading…</p>
      ) : draftsQ.isError ? (
        <p className="mt-3 font-sans text-[0.85rem] text-amber" role="alert">
          {draftsQ.error instanceof Error ? draftsQ.error.message : 'Could not load drafts.'}
        </p>
      ) : !draftsQ.data?.length ? (
        <p className="mt-3 font-sans text-[0.85rem] text-slate-500">
          No drafts waiting. Drafts appear here once squads compose a consensus record in-room.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {draftsQ.data.map((d) => {
            const cast =
              d.summary_counts.approve + d.summary_counts.reject + d.summary_counts.abstain;
            return (
              <li
                key={d.id}
                className="rounded-md border border-navy-light/70 bg-[#0a0f17] px-3 py-2.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-heading text-[0.9rem] font-semibold text-slate-200">
                    {d.title}
                  </p>
                  <p className="font-mono text-[0.72rem] text-slate-500">
                    Approve {d.summary_counts.approve} · Reject {d.summary_counts.reject} · Abstain{' '}
                    {d.summary_counts.abstain} ({cast}/{d.summary_counts.eligible})
                  </p>
                </div>
                <p className="mt-1 line-clamp-2 font-sans text-[0.8rem] text-slate-400">
                  {d.summary}
                </p>
                <p className="mt-2 font-mono text-[0.72rem] text-slate-500">
                  squad {d.squad_id ?? '—'}{' '}
                  {d.squad_id ? (
                    <Link
                      to={`/session/${d.squad_id}`}
                      className="text-teal-light underline decoration-teal/40"
                    >
                      Open room
                    </Link>
                  ) : null}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
