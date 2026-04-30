/**
 * publish-ledger-proposal Edge Function — atomically promotes a draft
 * `ledger_proposals` row to `status='published'` once the squad's vote
 * threshold has been met.
 *
 * Why an Edge Function (not a direct UPDATE):
 *   - The publish transition is a privileged action: once a row is
 *     `published`, RLS exposes it to anonymous readers (see
 *     `ledger_proposals_select_published` policy). Granting clients raw
 *     UPDATE on `ledger_proposals` would let any moderator publish without
 *     the threshold check; here the threshold is enforced server-side with
 *     a service-role connection and the moderator JWT only acts as the
 *     authorization gate.
 *   - Future authorities (named facilitator role, multi-signer release
 *     ceremony) plug into this single function rather than scattering
 *     publish logic across the client.
 *
 * Contract:
 *   POST /functions/v1/publish-ledger-proposal
 *   Authorization: Bearer <user JWT>  (must be a `public.moderators` row)
 *   Body: { proposal_id: string }
 *
 *   200: { ok: true, published_at: ISOString }
 *   400: invalid body
 *   401: missing / invalid JWT
 *   403: caller is not a moderator
 *   404: proposal not found, not a draft, or has no squad
 *   409: vote threshold not met (returns { ok: false, error_code, summary })
 *   500: server config / database error
 *
 * Threshold (v1, configurable per pilot):
 *   - At least 2/3 of squad members have voted (`approve | reject | abstain`).
 *   - Of those who voted, > 50% chose `approve`.
 * The threshold is intentionally simple: enough cohort participation +
 * majority approval. Pilots that need a stricter rule (unanimity, supermajority,
 * facilitator veto) should layer it on top of this baseline rather than
 * loosen it.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';
import { logError, logInfo, safeErrorMessage } from '../_shared/log.ts';
import { meetsThreshold, type VoteSummary } from './threshold.ts';

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
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceKey) {
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
  const b = body as { proposal_id?: unknown };
  const proposalId = typeof b.proposal_id === 'string' ? b.proposal_id.trim() : '';
  if (!proposalId || !/^[0-9a-fA-F-]{36}$/.test(proposalId)) {
    return jsonResponse(400, { error: 'Missing or invalid proposal_id' }, ch);
  }

  // Authorization: caller must be a moderator. The mod roster is the only
  // role with publish authority in v1; future named-facilitator roles plug
  // in here.
  const { data: modRow, error: modErr } = await userClient
    .from('moderators')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (modErr || !modRow) {
    return jsonResponse(403, { error: 'Forbidden' }, ch);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Fetch the proposal + its current vote summary in one round-trip.
  const [{ data: proposal, error: pErr }, { data: summary, error: sErr }] = await Promise.all([
    admin
      .from('ledger_proposals')
      .select('id, status, squad_id, slug')
      .eq('id', proposalId)
      .maybeSingle(),
    admin
      .from('ledger_proposal_vote_summary')
      .select(
        'proposal_id, squad_id, status, approve_count, reject_count, abstain_count, total_eligible',
      )
      .eq('proposal_id', proposalId)
      .maybeSingle(),
  ]);

  if (pErr || sErr) {
    logError('publish_ledger_lookup_failed', {
      function: 'publish-ledger-proposal',
      error_code: (pErr ?? sErr)?.code ?? null,
      error_message: safeErrorMessage(new Error((pErr ?? sErr)!.message)),
    });
    return jsonResponse(500, { error: 'Lookup failed' }, ch);
  }
  if (!proposal) return jsonResponse(404, { error: 'Proposal not found' }, ch);
  if (proposal.status !== 'draft') {
    return jsonResponse(404, { error: 'Proposal is not a draft' }, ch);
  }
  if (!proposal.squad_id) {
    return jsonResponse(404, { error: 'Proposal has no squad' }, ch);
  }
  if (!summary) {
    return jsonResponse(500, { error: 'Vote summary unavailable' }, ch);
  }

  const threshold = meetsThreshold(summary as VoteSummary);
  if (!threshold.ok) {
    return jsonResponse(
      409,
      {
        ok: false,
        error_code: threshold.error_code,
        summary: {
          approve_count: summary.approve_count,
          reject_count: summary.reject_count,
          abstain_count: summary.abstain_count,
          total_eligible: summary.total_eligible,
        },
      },
      ch,
    );
  }

  const publishedAt = new Date().toISOString();
  const { error: updErr } = await admin
    .from('ledger_proposals')
    .update({ status: 'published', published_at: publishedAt })
    .eq('id', proposalId)
    .eq('status', 'draft');
  if (updErr) {
    logError('publish_ledger_update_failed', {
      function: 'publish-ledger-proposal',
      error_code: updErr.code ?? null,
      error_message: safeErrorMessage(new Error(updErr.message)),
    });
    return jsonResponse(500, { error: 'Could not publish' }, ch);
  }

  logInfo('publish_ledger_proposal_ok', {
    function: 'publish-ledger-proposal',
    error_code: proposal.slug,
  });

  return jsonResponse(200, { ok: true, published_at: publishedAt }, ch);
});
