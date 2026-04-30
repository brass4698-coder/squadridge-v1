import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured, type Database, type LedgerProposalVote } from '../lib';

export type LedgerProposalRow = Database['public']['Tables']['ledger_proposals']['Row'];
export type LedgerProposalVoteRow = Database['public']['Tables']['ledger_proposal_votes']['Row'];
export type LedgerProposalVoteSummary =
  Database['public']['Views']['ledger_proposal_vote_summary']['Row'];

const proposalQueryKey = (squadId: string | undefined) =>
  ['ledger', 'squad-draft', squadId ?? '__none__'] as const;
const voteQueryKey = (proposalId: string | undefined, userId: string | undefined) =>
  ['ledger', 'proposal-vote', proposalId ?? '__none__', userId ?? '__none__'] as const;
const summaryQueryKey = (proposalId: string | undefined) =>
  ['ledger', 'proposal-summary', proposalId ?? '__none__'] as const;

/**
 * Fetch the active draft proposal for `squadId` (newest non-archived draft, if any).
 * Returns `null` when no draft exists — the panel renders the compose form in
 * that case and switches to the vote tally when a draft exists.
 */
export function useSquadDraftProposal(squadId: string | undefined) {
  const { supabase } = useAuth();
  return useQuery({
    queryKey: proposalQueryKey(squadId),
    queryFn: async (): Promise<LedgerProposalRow | null> => {
      if (!supabase || !squadId) return null;
      const { data, error } = await supabase
        .from('ledger_proposals')
        .select('*')
        .eq('squad_id', squadId)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1);
      if (error) throw new Error(error.message);
      return ((data ?? [])[0] ?? null) as LedgerProposalRow | null;
    },
    enabled: isSupabaseConfigured() && !!supabase && !!squadId,
  });
}

export interface CreateDraftInput {
  squadId: string;
  title: string;
  summary: string;
  consensusItems: string[];
  tags: string[];
}

/** Create a draft `ledger_proposal` for `squadId`. RLS scopes inserts to squad members. */
export function useCreateLedgerDraft() {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateDraftInput): Promise<LedgerProposalRow> => {
      if (!supabase) throw new Error('Supabase client unavailable');
      const slug = `draft-${input.squadId.slice(0, 8)}-${Date.now().toString(36)}`;
      const { data, error } = await supabase
        .from('ledger_proposals')
        .insert({
          squad_id: input.squadId,
          slug,
          title: input.title.trim(),
          summary: input.summary.trim(),
          consensus_items: input.consensusItems.map((s) => s.trim()).filter(Boolean),
          tags: input.tags.map((t) => t.trim()).filter(Boolean),
          status: 'draft',
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as LedgerProposalRow;
    },
    onSuccess: (_row, input) => {
      void queryClient.invalidateQueries({ queryKey: proposalQueryKey(input.squadId) });
    },
  });
}

/** Vote summary for a proposal (uses RLS-scoped view). */
export function useLedgerProposalVoteSummary(proposalId: string | undefined) {
  const { supabase } = useAuth();
  return useQuery({
    queryKey: summaryQueryKey(proposalId),
    queryFn: async (): Promise<LedgerProposalVoteSummary | null> => {
      if (!supabase || !proposalId) return null;
      const { data, error } = await supabase
        .from('ledger_proposal_vote_summary')
        .select(
          'proposal_id, squad_id, status, approve_count, reject_count, abstain_count, total_eligible',
        )
        .eq('proposal_id', proposalId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as LedgerProposalVoteSummary | null;
    },
    enabled: isSupabaseConfigured() && !!supabase && !!proposalId,
    refetchInterval: 5000,
  });
}

/** The current user's existing vote on `proposalId`, if any. */
export function useMyLedgerVote(proposalId: string | undefined) {
  const { supabase, session } = useAuth();
  const userId = session?.user?.id;
  return useQuery({
    queryKey: voteQueryKey(proposalId, userId),
    queryFn: async (): Promise<LedgerProposalVoteRow | null> => {
      if (!supabase || !proposalId || !userId) return null;
      const { data, error } = await supabase
        .from('ledger_proposal_votes')
        .select('*')
        .eq('proposal_id', proposalId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as LedgerProposalVoteRow | null;
    },
    enabled: isSupabaseConfigured() && !!supabase && !!proposalId && !!userId,
  });
}

export interface CastVoteInput {
  proposalId: string;
  squadId: string;
  vote: LedgerProposalVote;
}

/**
 * Insert or update the caller's vote on `proposalId`. RLS pins `user_id =
 * auth.uid()` and bars cross-squad ballots; the `UNIQUE(proposal_id, user_id)`
 * constraint converts a re-vote into an upsert.
 */
export function useCastLedgerVote() {
  const { supabase, session } = useAuth();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;
  const mutate = useCallback(
    async (input: CastVoteInput): Promise<LedgerProposalVoteRow> => {
      if (!supabase) throw new Error('Supabase client unavailable');
      if (!userId) throw new Error('Not signed in');
      const { data, error } = await supabase
        .from('ledger_proposal_votes')
        .upsert(
          {
            proposal_id: input.proposalId,
            squad_id: input.squadId,
            user_id: userId,
            vote: input.vote,
          },
          { onConflict: 'proposal_id,user_id' },
        )
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as LedgerProposalVoteRow;
    },
    [supabase, userId],
  );
  return useMutation({
    mutationFn: mutate,
    onSuccess: (_row, input) => {
      void queryClient.invalidateQueries({ queryKey: voteQueryKey(input.proposalId, userId) });
      void queryClient.invalidateQueries({ queryKey: summaryQueryKey(input.proposalId) });
    },
  });
}

export interface PublishResult {
  ok: true;
  published_at: string;
}

export interface PublishFailure {
  ok: false;
  error_code:
    | 'unauthorized'
    | 'forbidden'
    | 'not_found'
    | 'insufficient_participation'
    | 'majority_not_approve'
    | 'server_error';
  summary?: Pick<
    LedgerProposalVoteSummary,
    'approve_count' | 'reject_count' | 'abstain_count' | 'total_eligible'
  >;
}

/**
 * Calls the moderator-only `publish-ledger-proposal` Edge Function. The
 * function checks the moderator JWT, fetches the vote summary, applies the
 * threshold, and flips `status='published'` atomically. The client never
 * decides whether to publish — it only displays the verdict.
 */
export function usePublishLedgerProposal() {
  const { supabase } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (proposalId: string): Promise<PublishResult | PublishFailure> => {
      if (!supabase) return { ok: false, error_code: 'server_error' };
      const { data, error } = await supabase.functions.invoke<{
        ok?: boolean;
        published_at?: string;
        error_code?: PublishFailure['error_code'];
        summary?: PublishFailure['summary'];
      }>('publish-ledger-proposal', { body: { proposal_id: proposalId } });
      if (error) {
        const ctx = error.context as { status?: number } | undefined;
        const status = ctx?.status ?? 0;
        if (status === 401) return { ok: false, error_code: 'unauthorized' };
        if (status === 403) return { ok: false, error_code: 'forbidden' };
        if (status === 404) return { ok: false, error_code: 'not_found' };
        if (status === 409) {
          return {
            ok: false,
            error_code: data?.error_code ?? 'insufficient_participation',
            summary: data?.summary,
          };
        }
        return { ok: false, error_code: 'server_error' };
      }
      if (data?.ok && typeof data.published_at === 'string') {
        return { ok: true, published_at: data.published_at };
      }
      return { ok: false, error_code: 'server_error' };
    },
    onSuccess: (_result, proposalId) => {
      void queryClient.invalidateQueries({ queryKey: summaryQueryKey(proposalId) });
      void queryClient.invalidateQueries({ queryKey: ['ledger', 'squad-draft'] });
      void queryClient.invalidateQueries({ queryKey: ['ledger', 'published'] });
    },
  });
}
