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
  session_title?: string;
  session_status?: string;
  session_language?: string;
  identity_verification_required?: boolean;
}

export interface ParticipantMessageRow {
  id: string;
  sender_label: string;
  sender_role: 'facilitator' | 'participant';
  body: string;
  sent_at: string;
}

export async function validateParticipantToken(token: string): Promise<ParticipantTokenContext> {
  const { data, error } = await supabase.rpc('validate_participant_token', { p_token: token });
  if (error) return { valid: false, error: error.message };
  return data as ParticipantTokenContext;
}

export async function recordParticipantConsent(token: string): Promise<ParticipantTokenContext> {
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
