import { isDemoParticipantToken } from './participantDemo';
import { supabase } from './supabase';

export interface ParticipantTokenContext {
  valid: boolean;
  error?: string;
  participant_id?: string;
  session_id?: string;
  codename?: string;
  verification_status?: 'pending' | 'verified' | 'denied';
  document_submitted?: boolean;
  consented_at?: string | null;
  admitted_at?: string | null;
  participation_reason?: string | null;
  session_title?: string;
  session_status?: string;
  session_language?: string;
  conflict_type?: string;
  max_participants?: number;
  outcome_public?: boolean;
  identity_verification_required?: boolean;
  dialogue_stage?: string;
  issue_goal?: string | null;
  disclosure_boundaries?: string | null;
  participant_posting_allowed?: boolean;
}

export interface ParticipantMessageRow {
  id: string;
  sender_label: string;
  sender_role: 'facilitator' | 'participant';
  body: string;
  sent_at: string;
}

/** Synthetic context so demo-token can reach `/p/room` without a live DB row. */
export function demoParticipantContext(): ParticipantTokenContext {
  return {
    valid: true,
    participant_id: 'demo-participant',
    session_id: 'demo-session',
    codename: 'Demo Participant',
    verification_status: 'verified',
    document_submitted: true,
    consented_at: new Date().toISOString(),
    admitted_at: new Date().toISOString(),
    participation_reason: 'Representing a watershed stewardship partner for this consultation.',
    session_title: 'Northern Watershed Consultation',
    session_status: 'live',
    session_language: 'English',
    conflict_type: 'Environmental',
    max_participants: 8,
    outcome_public: true,
    identity_verification_required: false,
    dialogue_stage: 'story',
    issue_goal: 'Agree a joint water-allocation statement parties can stand behind.',
    disclosure_boundaries: 'Room dialogue stays private; only approved summary may leave.',
    participant_posting_allowed: true,
  };
}

export async function recordParticipantReason(
  token: string,
  reason: string,
): Promise<ParticipantTokenContext> {
  if (isDemoParticipantToken(token)) {
    return { ...demoParticipantContext(), participation_reason: reason.trim() };
  }
  const { data, error } = await supabase.rpc('record_participant_reason', {
    p_token: token,
    p_reason: reason,
  });
  if (error) return { valid: false, error: error.message };
  return data as ParticipantTokenContext;
}

export async function validateParticipantToken(token: string): Promise<ParticipantTokenContext> {
  if (isDemoParticipantToken(token)) return demoParticipantContext();
  const { data, error } = await supabase.rpc('validate_participant_token', { p_token: token });
  if (error) return { valid: false, error: error.message };
  return data as ParticipantTokenContext;
}

export async function recordParticipantConsent(token: string): Promise<ParticipantTokenContext> {
  if (isDemoParticipantToken(token)) return demoParticipantContext();
  const { data, error } = await supabase.rpc('record_participant_consent', { p_token: token });
  if (error) return { valid: false, error: error.message };
  return data as ParticipantTokenContext;
}

export async function markParticipantDocumentSubmitted(
  token: string,
): Promise<ParticipantTokenContext> {
  /** @deprecated Use uploadParticipantVerificationDocument — server rejects bare flag RPC. */
  const { data, error } = await supabase.rpc('participant_mark_document_submitted', {
    p_token: token,
  });
  if (error) return { valid: false, error: error.message };
  return data as ParticipantTokenContext;
}

export async function recordParticipantContactHash(
  token: string,
  email: string,
): Promise<{ valid: boolean; error?: string }> {
  if (isDemoParticipantToken(token)) {
    void email;
    return { valid: true };
  }
  const { data, error } = await supabase.rpc('participant_record_contact_hash', {
    p_token: token,
    p_email: email,
  });
  if (error) return { valid: false, error: error.message };
  return data as { valid: boolean; error?: string };
}

export async function participantSendMessage(
  token: string,
  body: string,
): Promise<{ valid: boolean; error?: string; message_id?: string }> {
  if (isDemoParticipantToken(token)) {
    return { valid: true, message_id: `demo-msg-${Date.now()}` };
  }
  const { data, error } = await supabase.rpc('participant_send_message', {
    p_token: token,
    p_body: body,
  });
  if (error) return { valid: false, error: error.message };
  return data as { valid: boolean; error?: string; message_id?: string };
}

export async function participantListMessages(
  token: string,
): Promise<{ valid: boolean; error?: string; messages?: ParticipantMessageRow[] }> {
  if (isDemoParticipantToken(token)) {
    return {
      valid: true,
      messages: [
        {
          id: 'demo-msg-1',
          sender_label: 'Facilitator',
          sender_role: 'facilitator',
          body: 'Welcome. This is a demo room for walkthroughs.',
          sent_at: new Date().toISOString(),
        },
      ],
    };
  }
  const { data, error } = await supabase.rpc('participant_list_messages', { p_token: token });
  if (error) return { valid: false, error: error.message };
  const row = data as { valid: boolean; error?: string; messages?: ParticipantMessageRow[] };
  return row;
}

export function generateInviteToken(): string {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

export async function hashEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
