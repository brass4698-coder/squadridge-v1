/**
 * Participant identity document upload (token-gated Edge Function).
 */
import { getSupabasePublicKey, getSupabaseUrl } from './env';

export interface VerificationUploadResult {
  ok: boolean;
  error?: string;
}

export async function uploadParticipantVerificationDocument(
  token: string,
  file: File,
  documentType = 'identity',
): Promise<VerificationUploadResult> {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabasePublicKey();
  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  const formData = new FormData();
  formData.append('token', token);
  formData.append('document_type', documentType);
  formData.append('file', file);

  const res = await fetch(`${supabaseUrl}/functions/v1/participant-verification-upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: formData,
  });

  let body: { error?: string; ok?: boolean } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    /* non-json */
  }

  if (!res.ok) {
    return { ok: false, error: body.error ?? `Upload failed (${res.status})` };
  }

  return { ok: true };
}
