/**
 * participant-verification-upload — token-gated identity document upload.
 *
 * POST /functions/v1/participant-verification-upload
 * Authorization: Bearer <anon/publishable key> (required by Supabase; token is in body)
 * multipart/form-data: token, document_type, file
 *
 * Validates participant token server-side, uploads to private storage, registers
 * verification_requests via participant_register_verification_document RPC.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'application/pdf']);

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  ch: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...ch, 'Content-Type': 'application/json' },
  });
}

function extForMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'application/pdf') return 'pdf';
  return 'bin';
}

Deno.serve(async (req) => {
  const ch = corsHeadersFor(req, { 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: ch });
  if (req.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' }, ch);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse(500, { error: 'Server configuration error' }, ch);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonResponse(400, { error: 'Invalid form data' }, ch);
  }

  const tokenRaw = form.get('token');
  const token = typeof tokenRaw === 'string' ? tokenRaw.trim() : '';
  const documentTypeRaw = form.get('document_type');
  const documentType =
    typeof documentTypeRaw === 'string' && documentTypeRaw.trim()
      ? documentTypeRaw.trim().slice(0, 80)
      : 'identity';
  const file = form.get('file');

  if (!token || token.length < 8) {
    return jsonResponse(400, { error: 'INVALID_TOKEN' }, ch);
  }
  if (!(file instanceof File)) {
    return jsonResponse(400, { error: 'FILE_REQUIRED' }, ch);
  }
  if (file.size < 1 || file.size > MAX_BYTES) {
    return jsonResponse(400, { error: 'INVALID_SIZE' }, ch);
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return jsonResponse(400, { error: 'INVALID_MIME' }, ch);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: ctx, error: ctxErr } = await admin.rpc('validate_participant_token', {
    p_token: token,
  });
  if (ctxErr) {
    return jsonResponse(400, { error: 'TOKEN_VALIDATION_FAILED' }, ch);
  }
  const row = ctx as {
    valid?: boolean;
    error?: string;
    session_id?: string;
    participant_id?: string;
  };
  if (!row?.valid || !row.session_id || !row.participant_id) {
    return jsonResponse(403, { error: row?.error ?? 'INVALID_TOKEN' }, ch);
  }

  const fileId = crypto.randomUUID();
  const storagePath = `${row.session_id}/${row.participant_id}/${fileId}.${extForMime(file.type)}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadErr } = await admin.storage
    .from('participant-verification')
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    return jsonResponse(500, { error: 'UPLOAD_FAILED' }, ch);
  }

  const { data: reg, error: regErr } = await admin.rpc(
    'participant_register_verification_document',
    {
      p_token: token,
      p_storage_path: storagePath,
      p_document_type: documentType,
      p_byte_size: file.size,
    },
  );

  if (regErr) {
    await admin.storage.from('participant-verification').remove([storagePath]);
    return jsonResponse(500, { error: 'REGISTER_FAILED' }, ch);
  }

  const registered = reg as { valid?: boolean; error?: string };
  if (!registered?.valid) {
    await admin.storage.from('participant-verification').remove([storagePath]);
    return jsonResponse(400, { error: registered?.error ?? 'REGISTER_FAILED' }, ch);
  }

  return jsonResponse(200, { ok: true }, ch);
});
