/**
 * admin-csi-sample-insert — moderator-only Edge Function that inserts a single
 * sample `conflict_severity_snapshots` row (and optional escalation alert) so
 * the `/admin/csi` dashboard has demo data to display.
 *
 * Why an Edge Function (not a direct INSERT):
 *   - `conflict_severity_snapshots` and `escalation_alerts` are service-role
 *     write only by design (RLS denies authenticated INSERT). In production,
 *     trusted CSI workers do the inserts. This function is a thin convenience
 *     wrapper so a moderator on a dev/staging build can populate the dashboard
 *     for a walkthrough without granting clients raw write access.
 *
 * Contract:
 *   POST /functions/v1/admin-csi-sample-insert
 *   Authorization: Bearer <user JWT>  (must be a `public.moderators` row)
 *   Body: { region_key?: string, severity_band?: 'green'|'yellow'|'red' }
 *
 *   200: { ok: true, snapshot_id: string }
 *   400: invalid body
 *   401: missing / invalid JWT
 *   403: caller is not a moderator
 *   500: server config / database error
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';
import { logError, logInfo, safeErrorMessage } from '../_shared/log.ts';

type Band = 'green' | 'yellow' | 'red';
const BANDS: ReadonlyArray<Band> = ['green', 'yellow', 'red'];

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

function buildSnapshot(regionKey: string, band: Band) {
  const score = band === 'red' ? 88 : band === 'yellow' ? 70 : 38;
  const base = {
    region_key: regionKey,
    period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    period_end: new Date().toISOString(),
    snapshot_at: new Date().toISOString(),
    csi_score: score,
    severity_band: band,
    sentiment_signal: Math.min(95, score - 5),
    grievance_signal: Math.min(95, score),
    resource_signal: Math.max(10, score - 15),
    ingroup_outgroup_signal: Math.min(95, score - 8),
    escalation_velocity_signal: Math.min(95, score + 2),
    violence_normalization_signal: Math.min(95, score - 12),
    component_scores: { version: 1, rollups: {}, sample: true },
    top_grievances: [{ theme: 'sample_data', weight: 0.45 }],
    squad_count: 1,
    message_count: 50,
    detected_escalation: band !== 'green',
  };
  return base;
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

  const { data: modRow, error: modErr } = await userClient
    .from('moderators')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (modErr || !modRow) {
    return jsonResponse(403, { error: 'Forbidden' }, ch);
  }

  let body: { region_key?: unknown; severity_band?: unknown };
  try {
    body = (await req.json()) as { region_key?: unknown; severity_band?: unknown };
  } catch {
    body = {};
  }
  const regionKey =
    typeof body.region_key === 'string' && body.region_key.trim().length > 0
      ? body.region_key.trim().slice(0, 64)
      : `sample-${new Date().toISOString().slice(0, 10)}`;
  const band = (
    typeof body.severity_band === 'string' && BANDS.includes(body.severity_band as Band)
      ? body.severity_band
      : 'yellow'
  ) as Band;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: inserted, error: insErr } = await admin
    .from('conflict_severity_snapshots')
    .insert(buildSnapshot(regionKey, band))
    .select('id')
    .single();

  if (insErr) {
    logError('admin_csi_sample_insert_failed', {
      function: 'admin-csi-sample-insert',
      error_code: insErr.code ?? null,
      error_message: safeErrorMessage(new Error(insErr.message)),
    });
    return jsonResponse(500, { error: 'Could not insert sample snapshot' }, ch);
  }

  logInfo('admin_csi_sample_insert_ok', {
    function: 'admin-csi-sample-insert',
    error_code: band,
  });

  return jsonResponse(200, { ok: true, snapshot_id: inserted!.id }, ch);
});
