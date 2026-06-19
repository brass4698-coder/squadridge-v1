import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
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
      setOutcome(data);
      const { data: approvalData } = await supabase
        .from('outcome_approvals')
        .select('*')
        .eq('outcome_id', data.id);
      setApprovals(approvalData ?? []);
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => { fetch(); }, [fetch]);

  async function saveDraft(fields: { summary: string; agreed_terms?: string; pending_items?: string; facilitator_notes?: string }) {
    if (!sessionId) return;
    if (outcome) {
      const { data } = await supabase
        .from('outcome_records')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', outcome.id)
        .select()
        .single();
      if (data) setOutcome(data);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('outcome_records')
        .insert({ session_id: sessionId, status: 'draft', ...fields })
        .select()
        .single();
      if (data) setOutcome(data);
    }
  }

  async function submitForRelease() {
    if (!outcome) return;
    await supabase
      .from('outcome_records')
      .update({ status: 'pending_approval', updated_at: new Date().toISOString() })
      .eq('id', outcome.id);
    setOutcome((prev) => prev ? { ...prev, status: 'pending_approval' } : prev);
  }

  async function publishToLedger() {
    if (!outcome) return;
    const sha = await computeSha256(JSON.stringify({ ...outcome, facilitator_notes: undefined }));
    await supabase
      .from('outcome_records')
      .update({ status: 'published', published_at: new Date().toISOString(), ledger_sha: sha })
      .eq('id', outcome.id);
    await supabase
      .from('sessions')
      .update({ status: 'released', updated_at: new Date().toISOString() })
      .eq('id', sessionId);
    setOutcome((prev) => prev ? { ...prev, status: 'published', ledger_sha: sha } : prev);
  }

  return { outcome, approvals, loading, saveDraft, submitForRelease, publishToLedger, refetch: fetch };
}

async function computeSha256(input: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
