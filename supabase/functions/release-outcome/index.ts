/**
 * release-outcome Edge Function — idempotent outcome publish to ledger path.
 *
 * POST /functions/v1/release-outcome
 * Authorization: Bearer <user JWT>
 * Body: { outcome_id: string, ledger_sha: string, idempotency_key?: string }
 *
 * Never logs outcome summary text or facilitator notes.
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

  const outcomeId = typeof body.outcome_id === 'string' ? body.outcome_id.trim() : '';
  const ledgerSha = typeof body.ledger_sha === 'string' ? body.ledger_sha.trim() : '';
  const idempotencyKey =
    typeof body.idempotency_key === 'string' ? body.idempotency_key.trim() : '';

  if (!outcomeId || !ledgerSha) {
    return jsonResponse(400, { error: 'outcome_id and ledger_sha required' }, ch);
  }

  try {
    const { data, error } = await userClient.rpc('release_outcome', {
      p_outcome_id: outcomeId,
      p_ledger_sha: ledgerSha,
      p_idempotency_key: idempotencyKey || null,
    });

    if (error) {
      logError('release_outcome_rpc_failed', {
        feature: 'release',
        error_message: safeErrorMessage(error),
      });
      const msg = error.message ?? '';
      if (/unauthorized/i.test(msg)) return jsonResponse(403, { error: 'Forbidden' }, ch);
      if (/not_found/i.test(msg)) return jsonResponse(404, { error: 'Not found' }, ch);
      if (/not_ready/i.test(msg)) return jsonResponse(409, { error: 'outcome_not_ready' }, ch);
      return jsonResponse(500, { error: 'release_failed' }, ch);
    }

    logInfo('release_outcome_ok', {
      feature: 'release',
      idempotency_key: idempotencyKey || null,
    });

    return jsonResponse(200, { ok: true, ...(data as Record<string, unknown>) }, ch);
  } catch (e) {
    logError('release_outcome_unhandled', {
      feature: 'release',
      error_message: safeErrorMessage(e),
    });
    return jsonResponse(500, { error: 'Server error' }, ch);
  }
});
