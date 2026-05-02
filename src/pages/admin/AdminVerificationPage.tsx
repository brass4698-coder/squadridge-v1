import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ZK and verified-attribute triage. Requires moderator SELECT policies (see migration).
 */
export function AdminVerificationPage() {
  const { supabase } = useAuth();

  const proofs = useQuery({
    queryKey: ['admin', 'zk', 'proofs'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('zk_proof_submissions')
        .select('id, user_id, proof_commitment, nullifier_hash, attribute_scope, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!supabase,
  });

  const attrs = useQuery({
    queryKey: ['admin', 'verified', 'attrs'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('verified_attributes')
        .select('id, user_id, attribute_type, attribute_value, verified_at')
        .order('verified_at', { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!supabase,
  });

  return (
    <div className="space-y-8" aria-labelledby="admin-verif">
      <h1 id="admin-verif" className="font-heading text-xl font-semibold text-gray-light">
        Verification
      </h1>
      <p className="max-w-[60ch] font-sans text-[0.88rem] text-slate-500">
        Proof submissions and issued attributes. Approve/escalate actions belong in a future
        workflow; for now this queue is read-only triage.
      </p>

      <section>
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-500">
          ZK proof submissions
        </h2>
        {proofs.isLoading ? (
          <div
            className="mt-2 space-y-2"
            role="status"
            aria-busy="true"
            aria-label="Loading ZK proof submissions"
          >
            <span className="sr-only">Loading ZK proof submissions…</span>
            <div className="h-3 w-2/3 animate-pulse rounded bg-line/70" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-line/55" />
          </div>
        ) : proofs.isError ? (
          <p className="mt-2 text-amber" role="alert">
            {proofs.error instanceof Error ? proofs.error.message : 'Could not load proofs.'}
          </p>
        ) : (
          <ul className="mt-2 space-y-1 font-mono text-[0.75rem] text-slate-400">
            {(proofs.data ?? []).map(
              (p: { id: string; attribute_scope: string; created_at: string }) => (
                <li key={p.id} className="rounded border border-navy-light/60 px-2 py-1">
                  {p.created_at} · {p.attribute_scope} · {p.id.slice(0, 8)}…
                </li>
              ),
            )}
            {(proofs.data ?? []).length === 0 ? <li className="text-slate-600">No rows.</li> : null}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-500">
          Verified attributes
        </h2>
        {attrs.isLoading ? (
          <div
            className="mt-2 space-y-2"
            role="status"
            aria-busy="true"
            aria-label="Loading verified attributes"
          >
            <span className="sr-only">Loading verified attributes…</span>
            <div className="h-3 w-2/3 animate-pulse rounded bg-line/70" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-line/55" />
          </div>
        ) : attrs.isError ? (
          <p className="mt-2 text-amber" role="alert">
            {attrs.error instanceof Error ? attrs.error.message : 'Could not load attributes.'}
          </p>
        ) : (
          <ul className="mt-2 space-y-1 font-mono text-[0.75rem] text-slate-400">
            {(attrs.data ?? []).map(
              (a: {
                id: string;
                attribute_type: string;
                attribute_value: string;
                verified_at: string;
              }) => (
                <li key={a.id} className="rounded border border-navy-light/60 px-2 py-1">
                  {a.verified_at} · {a.attribute_type} · {a.attribute_value}
                </li>
              ),
            )}
            {(attrs.data ?? []).length === 0 ? <li className="text-slate-600">No rows.</li> : null}
          </ul>
        )}
      </section>
    </div>
  );
}
