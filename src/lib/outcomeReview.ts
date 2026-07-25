import { supabase } from './supabase';
import { parseDialogueStage, type DialogueStage } from './dialogueStages';
import { parseReleaseBlockReason, type ReleaseReadiness } from './releaseIntegrity';

export async function facilitatorAdvanceDialogueStage(
  sessionId: string,
  stage: DialogueStage,
): Promise<{ ok: boolean; error?: string; dialogue_stage?: DialogueStage }> {
  const { data, error } = await supabase.rpc('facilitator_advance_dialogue_stage', {
    p_session_id: sessionId,
    p_stage: stage,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string; dialogue_stage?: string };
  if (!row?.ok) {
    return {
      ok: false,
      error:
        row?.error === 'STAGE_SKIP_BLOCKED'
          ? 'Advance one stage at a time.'
          : (row?.error ?? 'STAGE_ADVANCE_FAILED'),
    };
  }
  return {
    ok: true,
    dialogue_stage: parseDialogueStage(row.dialogue_stage),
  };
}

export interface ParticipantOutcomeReview {
  valid: boolean;
  available?: boolean;
  error?: string;
  message?: string;
  outcome_id?: string;
  outcome_status?: string;
  summary?: string;
  agreed_terms?: string | null;
  pending_items?: string | null;
  outcome_public?: boolean;
  session_title?: string;
  approval_id?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  dispute_note?: string | null;
  can_decide?: boolean;
  /** Hash of the exact text shown here; the decision is bound to it. */
  content_sha?: string;
  reviewed_content_sha?: string | null;
  decision_matches_current_text?: boolean;
}

export async function participantGetOutcomeReview(
  token: string,
): Promise<ParticipantOutcomeReview> {
  const { data, error } = await supabase.rpc('participant_get_outcome_review', {
    p_token: token,
  });
  if (error) return { valid: false, error: error.message };
  return data as ParticipantOutcomeReview;
}

export async function participantReviewOutcome(
  token: string,
  decision: 'approved' | 'rejected',
  disputeNote?: string,
): Promise<ParticipantOutcomeReview> {
  const { data, error } = await supabase.rpc('participant_review_outcome', {
    p_token: token,
    p_decision: decision,
    p_dispute_note: disputeNote ?? null,
  });
  if (error) return { valid: false, error: error.message };
  return data as ParticipantOutcomeReview;
}

export async function facilitatorSeedOutcomeApprovals(
  outcomeId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('facilitator_seed_outcome_approvals', {
    p_outcome_id: outcomeId,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string };
  if (!row?.ok) return { ok: false, error: row?.error ?? 'SEED_FAILED' };
  return { ok: true };
}

export async function facilitatorAttestOutcomeAuthorship(
  outcomeId: string,
  statement?: string,
): Promise<{ ok: boolean; error?: string; content_sha?: string }> {
  const { data, error } = await supabase.rpc('facilitator_attest_outcome_authorship', {
    p_outcome_id: outcomeId,
    p_statement: statement ?? null,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string; content_sha?: string };
  if (!row?.ok) {
    return {
      ok: false,
      error:
        row?.error === 'ALREADY_RELEASED'
          ? 'This instrument is already released.'
          : row?.error === 'SUMMARY_REQUIRED'
            ? 'Add a decision memo summary before attesting authorship.'
            : (row?.error ?? 'ATTESTATION_FAILED'),
    };
  }
  return { ok: true, content_sha: row.content_sha };
}

interface ReleaseReadinessRow {
  ok?: boolean;
  error?: string;
  outcome_id?: string;
  content_sha?: string;
  outcome_status?: string;
  session_status?: string;
  outcome_public?: boolean;
  authorship_attested?: boolean;
  authorship_attested_at?: string | null;
  authorship_statement?: string | null;
  approvals_total?: number;
  approvals_approved?: number;
  approvals_rejected?: number;
  approvals_stale?: number;
  verbatim_conflict?: boolean;
  can_release?: boolean;
  blocking_reason?: string | null;
}

export async function facilitatorGetReleaseReadiness(
  outcomeId: string,
): Promise<ReleaseReadiness | null> {
  const { data, error } = await supabase.rpc('facilitator_get_release_readiness', {
    p_outcome_id: outcomeId,
  });
  if (error) return null;
  const row = data as ReleaseReadinessRow | null;
  if (!row?.ok) return null;

  return {
    ok: true,
    outcomeId: row.outcome_id,
    contentSha: row.content_sha,
    outcomeStatus: row.outcome_status,
    sessionStatus: row.session_status,
    outcomePublic: row.outcome_public,
    authorshipAttested: row.authorship_attested === true,
    authorshipAttestedAt: row.authorship_attested_at ?? null,
    authorshipStatement: row.authorship_statement ?? null,
    approvalsTotal: row.approvals_total ?? 0,
    approvalsApproved: row.approvals_approved ?? 0,
    approvalsRejected: row.approvals_rejected ?? 0,
    approvalsStale: row.approvals_stale ?? 0,
    verbatimConflict: row.verbatim_conflict === true,
    canRelease: row.can_release === true,
    blockingReason: parseReleaseBlockReason(row.blocking_reason),
  };
}

/** Facilitator notes are not selectable by API roles — read them through this RPC. */
export async function facilitatorGetOutcomeNotes(outcomeId: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('facilitator_get_outcome_notes', {
    p_outcome_id: outcomeId,
  });
  if (error) return null;
  const row = data as { ok?: boolean; facilitator_notes?: string | null };
  if (!row?.ok) return null;
  return row.facilitator_notes ?? null;
}

export async function facilitatorSetApprovalStatus(
  approvalId: string,
  status: 'pending' | 'approved' | 'rejected',
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('facilitator_set_approval_status', {
    p_approval_id: approvalId,
    p_status: status,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string; message?: string };
  if (!row?.ok) {
    return {
      ok: false,
      error:
        row?.error === 'PARTICIPANT_MUST_SELF_REVIEW'
          ? (row.message ?? 'Participants must approve via their review link.')
          : (row?.error ?? 'APPROVAL_UPDATE_FAILED'),
    };
  }
  return { ok: true };
}
