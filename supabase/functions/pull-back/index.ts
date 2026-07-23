/**
 * pull-back Edge Function — time-bounded message retract (Power of Pause).
 *
 * Contract:
 *   POST /functions/v1/pull-back
 *   Authorization: Bearer <user JWT>
 *   Body: { message_id: string, idempotency_key?: string }
 *
 *   200: { ok: true, already_retracted?: boolean }
 *   400: invalid body
 *   401: unauthorized
 *   403: not message owner / not allowed
 *   404: message not found
 *   409: pull-back window elapsed
 *   500: server error
 *
 * Idempotent: repeating the same message_id (or idempotency_key) after success
 * returns 200 with already_retracted: true — safe for conflict-safe retries.
 * Never logs message body content.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';
import { logError, logInfo, safeErrorMessage } from '../_shared/log.ts';

const PULL_BACK_WINDOW_MS = 60_000;

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' }, ch);
  }

  const messageId =
    body &&
    typeof body === 'object' &&
    'message_id' in body &&
    typeof (body as { message_id: unknown }).message_id === 'string'
      ? (body as { message_id: string }).message_id.trim()
      : '';
  const idempotencyKey =
    body &&
    typeof body === 'object' &&
    'idempotency_key' in body &&
    typeof (body as { idempotency_key: unknown }).idempotency_key === 'string'
      ? (body as { idempotency_key: string }).idempotency_key
      : messageId;

  if (!messageId) return jsonResponse(400, { error: 'message_id required' }, ch);

  try {
    const { data: message, error: fetchErr } = await userClient
      .from('messages')
      .select('id, sender_id, status, created_at, squad_id')
      .eq('id', messageId)
      .maybeSingle();

    if (fetchErr) {
      logError('pull_back_fetch_failed', {
        feature: 'pull_back',
        error_message: safeErrorMessage(fetchErr),
      });
      return jsonResponse(500, { error: 'Lookup failed' }, ch);
    }
    if (!message) return jsonResponse(404, { error: 'Not found' }, ch);

    if (message.sender_id !== user.id) {
      return jsonResponse(403, { error: 'Forbidden' }, ch);
    }

    if (message.status === 'retracted') {
      logInfo('pull_back_idempotent_hit', {
        feature: 'pull_back',
        idempotency_key: idempotencyKey,
      });
      return jsonResponse(200, { ok: true, already_retracted: true }, ch);
    }

    const created = message.created_at ? Date.parse(message.created_at) : NaN;
    if (Number.isFinite(created) && Date.now() - created > PULL_BACK_WINDOW_MS) {
      return jsonResponse(409, { error: 'pull_back_window_elapsed' }, ch);
    }

    const { error: updateErr } = await userClient
      .from('messages')
      .update({ status: 'retracted' })
      .eq('id', messageId)
      .eq('sender_id', user.id)
      .neq('status', 'retracted');

    if (updateErr) {
      logError('pull_back_update_failed', {
        feature: 'pull_back',
        error_message: safeErrorMessage(updateErr),
      });
      return jsonResponse(500, { error: 'Update failed' }, ch);
    }

    if (message.squad_id) {
      await userClient.from('interventions').insert({
        squad_id: message.squad_id,
        intervention_type: 'pull_back_used',
      });
    }

    logInfo('pull_back_ok', {
      feature: 'pull_back',
      idempotency_key: idempotencyKey,
    });

    return jsonResponse(200, { ok: true }, ch);
  } catch (e) {
    logError('pull_back_unhandled', {
      feature: 'pull_back',
      error_message: safeErrorMessage(e),
    });
    return jsonResponse(500, { error: 'Server error' }, ch);
  }
});
