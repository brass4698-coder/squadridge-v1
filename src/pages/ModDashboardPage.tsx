import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type SquadSummary = {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  expires_at: string;
  archived_at: string | null;
};

export function ModDashboardPage() {
  const { supabase } = useAuth();

  const squadsQuery = useQuery({
    queryKey: ['mod', 'squads', 'recent'],
    queryFn: async (): Promise<SquadSummary[]> => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('squads')
        .select('id, topic, status, created_at, expires_at, archived_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return (data ?? []) as SquadSummary[];
    },
    enabled: !!supabase,
  });

  const auditQuery = useQuery({
    queryKey: ['mod', 'audit', 'recent'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('moderation_audit_log')
        .select('id, action, target_type, target_id, created_at, actor_user_id')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!supabase,
  });

  const squads = squadsQuery.data ?? [];
  const audits = auditQuery.data ?? [];

  return (
    <section className="mx-auto flex w-full max-w-[960px] flex-col gap-10 pb-16 pt-[72px]" aria-labelledby="mod-title">
      <header>
        <h1 id="mod-title" className="font-heading text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-[#f1f5f9]">
          Moderation
        </h1>
        <p className="mt-2 max-w-[52ch] font-sans text-[0.9rem] leading-relaxed text-[#8892a4]">
          Read-only triage of squads and audit entries. Moderator accounts are provisioned in the database — not
          self-service.
        </p>
      </header>

      <div className="rounded-[10px] border border-[#1a2236] bg-[#0f1623] p-6">
        <h2 className="font-heading text-[1rem] font-semibold text-[#e2e8f0]">Recent squads</h2>
        {squadsQuery.isPending ? (
          <p className="mt-4 font-sans text-[0.875rem] text-[#4b5563]">Loading…</p>
        ) : squadsQuery.isError ? (
          <p className="mt-4 font-sans text-[0.875rem] text-amber" role="alert">
            {squadsQuery.error instanceof Error ? squadsQuery.error.message : 'Could not load squads.'}
          </p>
        ) : squads.length === 0 ? (
          <p className="mt-4 font-sans text-[0.875rem] text-[#4b5563]">No squads found.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#1a2236]">
            {squads.map((s) => (
              <li key={s.id} className="flex flex-wrap items-baseline justify-between gap-3 py-3 first:pt-0">
                <div>
                  <p className="font-sans text-[0.9rem] font-medium text-[#e2e8f0]">{s.topic}</p>
                  <p className="mt-1 font-mono text-[0.7rem] text-[#4b5563]">{s.id}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 font-sans text-[0.75rem] text-[#8892a4]">
                  <span>{s.status}</span>
                  {s.archived_at ? <span className="text-amber">Archived</span> : null}
                  <Link
                    to={`/session/${s.id}`}
                    className="text-teal underline-offset-4 hover:underline"
                  >
                    Open session
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-[10px] border border-[#1a2236] bg-[#0f1623] p-6">
        <h2 className="font-heading text-[1rem] font-semibold text-[#e2e8f0]">Moderation audit log</h2>
        {auditQuery.isPending ? (
          <p className="mt-4 font-sans text-[0.875rem] text-[#4b5563]">Loading…</p>
        ) : auditQuery.isError ? (
          <p className="mt-4 font-sans text-[0.875rem] text-amber" role="alert">
            {auditQuery.error instanceof Error ? auditQuery.error.message : 'Could not load audit log.'}
          </p>
        ) : audits.length === 0 ? (
          <p className="mt-4 font-sans text-[0.875rem] text-[#4b5563]">No audit entries yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#1a2236]">
            {audits.map((row) => (
              <li key={row.id} className="py-3 font-sans text-[0.8rem] text-[#a8b2c1] first:pt-0">
                <span className="text-[#e2e8f0]">{row.action}</span>
                {row.target_type ? <span className="ml-2 text-[#4b5563]">{row.target_type}</span> : null}
                <span className="ml-2 text-[#4b5563]">{new Date(row.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
