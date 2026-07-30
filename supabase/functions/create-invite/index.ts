/**
 * create-invite Edge Function — idempotent invite issuance.
 *
 * POST /functions/v1/create-invite
 * Authorization: Bearer <user JWT>
 * Body: {
 *   email, invite_type, role_key,
 *   institution_id?, workspace_id?, expires_hours?,
 *   idempotency_key?, metadata?
 * }
 *
 * Never logs email or other PII — only role_key + idempotency_key.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';
import { logError, logInfo, safeErrorMessage } from '../_shared/log.ts';

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

Deno.serve(async (req) => {
  const ch = corsHeadersFor(req, { 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: ch });
  if (req.method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' }, ch);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  if (!supabaseUrl || !anonKey) {
    return jsonResponse(500, { error: 'Server configuration error' }, ch);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse(401, { error: 'Unauthorized' }, ch);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) return jsonResponse(401, { error: 'Unauthorized' }, ch);

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' }, ch);
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const inviteType = typeof body.invite_type === 'string' ? body.invite_type.trim() : '';
  const roleKey = typeof body.role_key === 'string' ? body.role_key.trim() : '';
  const idempotencyKey =
    typeof body.idempotency_key === 'string' ? body.idempotency_key.trim() : '';
  if (!email || !inviteType || !roleKey) {
    return jsonResponse(400, { error: 'email, invite_type, and role_key required' }, ch);
  }

  const baseMeta =
    body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
      ? (body.metadata as Record<string, unknown>)
      : {};
  const metadata = {
    ...baseMeta,
    ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
  };

  try {
    const { data, error } = await userClient.rpc('create_invite', {
      p_email: email,
      p_invite_type: inviteType,
      p_role_key: roleKey,
      p_institution_id: typeof body.institution_id === 'string' ? body.institution_id : null,
      p_workspace_id: typeof body.workspace_id === 'string' ? body.workspace_id : null,
      p_expires_hours: typeof body.expires_hours === 'number' ? body.expires_hours : 72,
      p_metadata: metadata,
    });

    if (error) {
      logError('create_invite_rpc_failed', {
        feature: 'invites',
        error_message: safeErrorMessage(error),
      });
      const status = /unauthorized/i.test(error.message) ? 403 : 500;
      return jsonResponse(status, { error: 'create_invite_failed' }, ch);
    }

    logInfo('create_invite_ok', {
      feature: 'invites',
      idempotency_key: idempotencyKey || null,
    });

    return jsonResponse(200, { ok: true, ...(data as Record<string, unknown>) }, ch);
  } catch (e) {
    logError('create_invite_unhandled', {
      feature: 'invites',
      error_message: safeErrorMessage(e),
    });
    return jsonResponse(500, { error: 'Server error' }, ch);
  }
});
