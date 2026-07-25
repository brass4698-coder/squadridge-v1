import { useEffect, useState, useCallback } from 'react';
// TODO(supabase-types): see useAccessRequest.
import { supabase } from '../lib/supabase';
import type { OutcomeRecordClient, OutcomeApproval } from '../lib/supabaseTypes';
import {
  facilitatorAttestOutcomeAuthorship,
  facilitatorGetOutcomeNotes,
  facilitatorGetReleaseReadiness,
  facilitatorSeedOutcomeApprovals,
  facilitatorSetApprovalStatus,
} from '../lib/outcomeReview';
import { releaseErrorMessage, type ReleaseReadiness } from '../lib/releaseIntegrity';

/**
 * `facilitator_notes` and `authorship_attested_by` are withheld from API roles by
 * column grants, so every query lists the columns clients may read.
 */
const OUTCOME_COLUMNS = [
  'id',
  'session_id',
  'summary',
  'agreed_terms',
  'pending_items',
  'status',
  'published_at',
  'ledger_sha',
  'timestamp_token',
  'timestamp_authority',
  'timestamped_at',
  'timestamp_status',
  'authorship_attested_at',
  'attested_content_sha',
  'authorship_statement',
  'created_at',
  'updated_at',
].join(', ');

export function useOutcomeRecord(sessionId: string | undefined) {
  const [outcome, setOutcome] = useState<OutcomeRecordClient | null>(null);
  const [approvals, setApprovals] = useState<OutcomeApproval[]>([]);
  const [facilitatorNotes, setFacilitatorNotes] = useState('');
  const [readiness, setReadiness] = useState<ReleaseReadiness | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    const { data } = await supabase
      .from('outcome_records')
      .select(OUTCOME_COLUMNS)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (data) {
      const row = data as unknown as OutcomeRecordClient;
      setOutcome(row);
      const { data: approvalData } = await supabase
        .from('outcome_approvals')
        .select('*')
        .eq('outcome_id', row.id);
      setApprovals((approvalData ?? []) as OutcomeApproval[]);
      setFacilitatorNotes((await facilitatorGetOutcomeNotes(row.id)) ?? '');
      setReadiness(await facilitatorGetReleaseReadiness(row.id));
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
        .select(OUTCOME_COLUMNS)
        .single();
      if (data) setOutcome(data as unknown as OutcomeRecordClient);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('outcome_records')
        .insert({ session_id: sessionId, status: 'draft', ...fields })
        .select(OUTCOME_COLUMNS)
        .single();
      if (data) setOutcome(data as unknown as OutcomeRecordClient);
    }
    setFacilitatorNotes(fields.facilitator_notes ?? '');
    await fetch();
  }

  async function submitForRelease() {
    if (!outcome) return;
    const seeded = await facilitatorSeedOutcomeApprovals(outcome.id);
    if (!seeded.ok) {
      throw new Error(seeded.error ?? 'Could not open participant review');
    }
    setOutcome((prev) => (prev ? { ...prev, status: 'pending_approval' } : prev));
    await fetch();
  }

  /** @deprecated Prefer submitForRelease which seeds participant-bound approvals. */
  async function seedApprovals(_labels: string[]) {
    await submitForRelease();
  }

  async function setApprovalStatus(approvalId: string, status: OutcomeApproval['status']) {
    const result = await facilitatorSetApprovalStatus(approvalId, status);
    if (!result.ok) {
      throw new Error(result.error ?? 'Could not update approval');
    }
    await fetch();
  }

  /** Bind a facilitator authorship statement to the current instrument text. */
  async function attestAuthorship(statement?: string) {
    if (!outcome) return;
    const result = await facilitatorAttestOutcomeAuthorship(outcome.id, statement);
    if (!result.ok) {
      throw new Error(result.error ?? 'Could not record the authorship attestation');
    }
    await fetch();
  }

  async function publishToLedger() {
    if (!outcome) return;
    const { data, error } = await supabase.rpc('release_outcome', { p_outcome_id: outcome.id });
    if (error) throw error;
    const result = data as { ok?: boolean; ledger_sha?: string; error?: string };
    if (!result?.ok) {
      await fetch();
      throw new Error(releaseErrorMessage(result?.error));
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
    facilitatorNotes,
    readiness,
    loading,
    saveDraft,
    submitForRelease,
    seedApprovals,
    setApprovalStatus,
    attestAuthorship,
    publishToLedger,
    refetch: fetch,
  };
}
