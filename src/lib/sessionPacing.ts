import { supabase } from './supabase';
import { isDemoParticipantToken } from './participantDemo';

export type RoomPacingMode = 'normal' | 'slow' | 'paused' | 'pull_back';
export type ParticipantWarningLevel = 'none' | 'notice' | 'slow' | 'pause';

export interface ParticipantPacingState {
  valid: boolean;
  error?: string;
  pacing_mode?: RoomPacingMode;
  warning_level?: ParticipantWarningLevel;
  warning_message?: string | null;
  acknowledge_required?: boolean;
  posting_blocked?: boolean;
  posting_blocked_until?: string | null;
  session_status?: string;
  dialogue_stage?: string;
  participant_posting_allowed?: boolean;
}

const DEMO_PACING: ParticipantPacingState = {
  valid: true,
  pacing_mode: 'normal',
  warning_level: 'none',
  warning_message: null,
  acknowledge_required: false,
  posting_blocked: false,
  session_status: 'live',
  dialogue_stage: 'story',
  participant_posting_allowed: true,
};

export async function facilitatorSetRoomPacing(
  sessionId: string,
  mode: RoomPacingMode,
  message?: string,
  restrictMinutes?: number,
): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('facilitator_set_room_pacing', {
    p_session_id: sessionId,
    p_mode: mode,
    p_message: message ?? null,
    p_restrict_minutes: restrictMinutes ?? null,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as { ok?: boolean; error?: string };
  if (!row?.ok) return { ok: false, error: row?.error ?? 'PACING_FAILED' };
  return { ok: true };
}

export async function participantGetPacing(token: string): Promise<ParticipantPacingState> {
  if (isDemoParticipantToken(token)) return DEMO_PACING;
  const { data, error } = await supabase.rpc('participant_get_pacing', { p_token: token });
  if (error) return { valid: false, error: error.message };
  return data as ParticipantPacingState;
}

export async function participantAcknowledgePause(token: string): Promise<ParticipantPacingState> {
  if (isDemoParticipantToken(token)) {
    return { ...DEMO_PACING, acknowledge_required: false, posting_blocked: false };
  }
  const { data, error } = await supabase.rpc('participant_acknowledge_pause', { p_token: token });
  if (error) return { valid: false, error: error.message };
  return data as ParticipantPacingState;
}

export async function participantRequestSlowDown(token: string): Promise<ParticipantPacingState> {
  if (isDemoParticipantToken(token)) {
    return {
      ...DEMO_PACING,
      pacing_mode: 'slow',
      warning_level: 'slow',
      warning_message: 'You chose to slow down. Take a short pause before sending.',
      posting_blocked: true,
    };
  }
  const { data, error } = await supabase.rpc('participant_request_slow_down', { p_token: token });
  if (error) return { valid: false, error: error.message };
  return data as ParticipantPacingState;
}

export function pacingCopy(mode: RoomPacingMode): { title: string; body: string } {
  switch (mode) {
    case 'slow':
      return {
        title: 'Slow down',
        body: 'Shorter contributions help the room stay workable. Posting may pause briefly.',
      };
    case 'paused':
      return {
        title: 'Power of Pause',
        body: 'The facilitator paused posting so the room can settle. Acknowledge when you are ready.',
      };
    case 'pull_back':
      return {
        title: 'Pull back',
        body: 'Intensity is rising. Reframe the concern without targeting people. Posting is limited briefly.',
      };
    default:
      return {
        title: 'Room pacing',
        body: 'Normal pacing. Contribute when ready.',
      };
  }
}
