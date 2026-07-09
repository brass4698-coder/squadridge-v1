import { useEffect, useState, useCallback } from 'react';
// TODO(supabase-types): see useAccessRequest.
import { supabase } from '../lib/supabase';
import type { OutcomeRecord, OutcomeApproval } from '../lib/supabaseTypes';

export function useOutcomeRecord(sessionId: string | undefined) {
  const [outcome, setOutcome] = useState<OutcomeRecord | null>(null);
  const [approvals, setApprovals] = useState<OutcomeApproval[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    const { data } = await supabase
      .from('outcome_records')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (data) {
      const row = data as OutcomeRecord;
      setOutcome(row);
      const { data: approvalData } = await supabase
        .from('outcome_approvals')
        .select('*')
        .eq('outcome_id', row.id);
      setApprovals((approvalData ?? []) as OutcomeApproval[]);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function saveDraft(fields: {
    summary: string;
    agreed_terms?: string;
    pending_items?: string;
    facilitator_notes?: string;
  }) {
    if (!sessionId) return;
    if (outcome) {
      const { data } = await supabase
        .from('outcome_records')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', outcome.id)
        .select()
        .single();
      if (data) setOutcome(data as OutcomeRecord);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('outcome_records')
        .insert({ session_id: sessionId, status: 'draft', ...fields })
        .select()
        .single();
      if (data) setOutcome(data as OutcomeRecord);
    }
  }

  async function submitForRelease() {
    if (!outcome) return;
    await supabase
      .from('outcome_records')
      .update({ status: 'pending_approval', updated_at: new Date().toISOString() })
      .eq('id', outcome.id);
    setOutcome((prev) => (prev ? { ...prev, status: 'pending_approval' } : prev));
  }

  async function seedApprovals(labels: string[]) {
    if (!outcome) return;
    const rows = labels.map((label) => ({
      outcome_id: outcome.id,
      approver_label: label,
      status: 'pending' as const,
    }));
    const { data } = await supabase.from('outcome_approvals').insert(rows).select();
    if (data) setApprovals(data as OutcomeApproval[]);
  }

  async function setApprovalStatus(approvalId: string, status: OutcomeApproval['status']) {
    const patch = {
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    };
    await supabase.from('outcome_approvals').update(patch).eq('id', approvalId);
    setApprovals((prev) => prev.map((a) => (a.id === approvalId ? { ...a, ...patch } : a)));
  }

  async function publishToLedger() {
    if (!outcome) return;
    const { data, error } = await supabase.rpc('release_outcome', { p_outcome_id: outcome.id });
    if (error) throw error;
    const result = data as { ok?: boolean; ledger_sha?: string; error?: string };
    if (!result?.ok) {
      const message =
        result?.error === 'APPROVALS_PENDING'
          ? 'All parties must approve before release.'
          : result?.error === 'VERBATIM_ROOM_CONTENT'
            ? 'Outcome text matches room dialogue verbatim. Rewrite in facilitator-authored language.'
            : result?.error === 'SESSION_NOT_ENDED'
              ? 'End the session before releasing the outcome.'
              : (result?.error ?? 'Release failed');
      throw new Error(message);
    }
    setOutcome((prev) =>
      prev
        ? {
            ...prev,
            status: 'published',
            ledger_sha: result.ledger_sha ?? prev.ledger_sha,
            published_at: new Date().toISOString(),
          }
        : prev,
    );
  }

  return {
    outcome,
    approvals,
    loading,
    saveDraft,
    submitForRelease,
    seedApprovals,
    setApprovalStatus,
    publishToLedger,
    refetch: fetch,
  };
}
