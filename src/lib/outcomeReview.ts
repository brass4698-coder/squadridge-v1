import { supabase } from './supabase';
import { parseDialogueStage, type DialogueStage } from './dialogueStages';

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
