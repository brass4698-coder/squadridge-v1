import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, ParticipantReportReason, ParticipantReportType } from './database.types';

export type SubmitParticipantReportInput = {
  squadId: string;
  reporterUserId: string;
  reportType: ParticipantReportType;
  reasonCode: ParticipantReportReason;
  contextNote?: string | null;
  targetUserId?: string | null;
  targetMessageId?: string | null;
};

export type SubmitParticipantReportResult =
  | { ok: true; id: string }
  | { ok: false; error_code: 'unauthorized' | 'forbidden' | 'invalid' | 'server_error' };

export async function submitParticipantReport(
  supabase: SupabaseClient<Database>,
  input: SubmitParticipantReportInput,
): Promise<SubmitParticipantReportResult> {
  const contextNote = input.contextNote?.trim();

  try {
    const { data, error } = await supabase
      .from('participant_reports')
      .insert({
        reporter_user_id: input.reporterUserId,
        squad_id: input.squadId,
        target_user_id: input.targetUserId ?? null,
        target_message_id: input.targetMessageId ?? null,
        report_type: input.reportType,
        reason_code: input.reasonCode,
        context_note: contextNote ? contextNote.slice(0, 1200) : null,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '42501') return { ok: false, error_code: 'forbidden' };
      if (error.code?.startsWith('22') || error.code?.startsWith('23')) {
        return { ok: false, error_code: 'invalid' };
      }
      return { ok: false, error_code: 'server_error' };
    }

    return { ok: true, id: data.id };
  } catch {
    return { ok: false, error_code: 'server_error' };
  }
}

export function describeParticipantReportResult(result: SubmitParticipantReportResult): string {
  if (result.ok) return `Report submitted. Reference ${result.id.slice(0, 8)}.`;

  switch (result.error_code) {
    case 'unauthorized':
      return 'Sign in again before submitting a report.';
    case 'forbidden':
      return 'Only current squad members can submit reports for this room.';
    case 'invalid':
      return 'That report could not be submitted. Check the details and try again.';
    case 'server_error':
      return 'Report submission failed. Keep this room open and contact a facilitator if needed.';
  }
}
