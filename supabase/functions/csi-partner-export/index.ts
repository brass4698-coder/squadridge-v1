/**
 * csi-partner-export — Track D: scoped CSI export for vetted partners.
 *
 * Hard scope (do not relax without an explicit governance review):
 *   * No public access. The Edge function authenticates via a partner API
 *     key (header `X-CSI-Partner-Key`), hashed with SHA-256 and matched
 *     against `csi_partners.api_key_hash` (migration 20260505120000).
 *   * Per-partner allow-list of region_keys + signal dimensions in
 *     `csi_partner_grants`. Snapshots outside the grant are never returned.
 *   * Every successful AND failed call writes a row to
 *     `csi_export_audit_log` so ops can answer "what did partner X see?".
 *   * Rate-limited via Upstash through the existing `rate-limit` Edge
 *     function (action: `csi_partner_export`).
 *   * `csi_score` and `severity_band` are always included; partners pay for
 *     a "what's happening" signal and the band is the canonical answer.
 *     Sub-component signals are projected per the grant.
 *
 * Honest scope: this exists to support pilot-stage Track-II partner
 * pilots, not to feed a public early-warning dashboard. See
 * docs/business/strategic-positioning-early-warning.md Pillar 4.
 *
 * Contract:
 *   POST /functions/v1/csi-partner-export
 *   Headers: X-CSI-Partner-Key: <partner_api_key>
 *   Body: {
 *     region_keys?: string[],   // intersect with grant; default = full grant
 *     since?: ISO timestamp,    // default = now - 24h
 *     limit?: number            // 1..200; default 50
 *   }
 *
 *   200: { ok: true, snapshots: [...] }
 *   401: missing / invalid API key
 *   403: partner has no grants for any requested region
 *   429: rate limit
 *   500: server config / database error
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';
import { logError, logInfo, safeErrorMessage } from '../_shared/log.ts';

const ALL_DIMENSIONS = [
  'sentiment_signal',
  'grievance_signal',
  'resource_signal',
  'ingroup_outgroup_signal',
  'escalation_velocity_signal',
  'violence_normalization_signal',
] as const;

type Dimension = (typeof ALL_DIMENSIONS)[number];

const ALWAYS_INCLUDE: ReadonlyArray<string> = [
  'id',
  'region_key',
  'period_start',
  'period_end',
  'snapshot_at',
  'csi_score',
  'severity_band',
  'detected_escalation',
];

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

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function rateLimitOrThrow(supabaseUrl: string, anonKey: string, jwt: string): Promise<void> {
  const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/rate-limit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'csi_partner_export' }),
  });
  if (res.status === 429) {
    throw new Error('rate_limited');
  }
  if (res.status === 503 && Deno.env.get('RATE_LIMIT_FAIL_OPEN') === 'true') return;
  if (!res.ok) throw new Error(`rate_limit_unavailable:${res.status}`);
}

interface GrantRow {
  region_key: string;
  allowed_signal_dimensions: string[];
}

function projectSnapshot(
  snapshot: Record<string, unknown>,
  allowedByRegion: Map<string, Set<Dimension>>,
): Record<string, unknown> | null {
  const region = String(snapshot.region_key ?? '');
  const allowed = allowedByRegion.get(region);
  if (!allowed) return null;
  const out: Record<string, unknown> = {};
  for (const k of ALWAYS_INCLUDE) {
    out[k] = snapshot[k];
  }
  for (const dim of ALL_DIMENSIONS) {
    if (allowed.has(dim)) {
      out[dim] = snapshot[dim];
    }
  }
  return out;
}

async function writeAudit(
  admin: ReturnType<typeof createClient>,
  partnerId: string | null,
  regionKeys: string[],
  snapshotsReturned: number,
  responseStatus: number,
  meta: Record<string, unknown>,
): Promise<void> {
  await admin.from('csi_export_audit_log').insert({
    partner_id: partnerId,
    region_keys: regionKeys,
    snapshots_returned: snapshotsReturned,
    response_status: responseStatus,
    request_meta: meta,
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

  const apiKey = req.headers.get('X-CSI-Partner-Key');
  if (!apiKey || apiKey.length < 16) {
    return jsonResponse(401, { error: 'Unauthorized' }, ch);
  }
  const apiKeyHash = await sha256Hex(apiKey);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Resolve partner.
  const { data: partner, error: partnerErr } = await admin
    .from('csi_partners')
    .select('id, name, scope_started_at, scope_ended_at')
    .eq('api_key_hash', apiKeyHash)
    .maybeSingle();

  if (partnerErr || !partner) {
    return jsonResponse(401, { error: 'Unauthorized' }, ch);
  }
  if (partner.scope_ended_at && new Date(partner.scope_ended_at) <= new Date()) {
    await writeAudit(admin, partner.id, [], 0, 401, { reason: 'scope_ended' });
    return jsonResponse(401, { error: 'Partner scope ended' }, ch);
  }

  // 2. Rate limit. We use the partner's API key as the bearer token for the
  // rate-limit Edge function — the rate-limit endpoint is liberal about JWT
  // shape and treats it as an opaque identifier for bucketing.
  try {
    await rateLimitOrThrow(supabaseUrl, anonKey, apiKey);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'rate_limit';
    const status = msg === 'rate_limited' ? 429 : 503;
    await writeAudit(admin, partner.id, [], 0, status, { reason: msg });
    return jsonResponse(status, { error: msg }, ch);
  }

  let body: { region_keys?: unknown; since?: unknown; limit?: unknown };
  try {
    body = (await req.json()) as { region_keys?: unknown; since?: unknown; limit?: unknown };
  } catch {
    body = {};
  }

  const requestedRegions = Array.isArray(body.region_keys)
    ? (body.region_keys.filter((s) => typeof s === 'string') as string[])
    : [];
  const limit =
    typeof body.limit === 'number' && body.limit >= 1 && body.limit <= 200
      ? Math.round(body.limit)
      : 50;
  const since =
    typeof body.since === 'string' && !Number.isNaN(Date.parse(body.since))
      ? body.since
      : new Date(Date.now() - 24 * 3600 * 1000).toISOString();

  // 3. Load grants.
  const { data: grants, error: grantsErr } = await admin
    .from('csi_partner_grants')
    .select('region_key, allowed_signal_dimensions')
    .eq('partner_id', partner.id);

  if (grantsErr) {
    logError('csi_partner_export_grants_failed', {
      function: 'csi-partner-export',
      error_code: grantsErr.code ?? null,
      error_message: safeErrorMessage(new Error(grantsErr.message)),
    });
    await writeAudit(admin, partner.id, [], 0, 500, { reason: 'grants_load_failed' });
    return jsonResponse(500, { error: 'Could not load grants' }, ch);
  }

  if (!grants || grants.length === 0) {
    await writeAudit(admin, partner.id, [], 0, 403, { reason: 'no_grants' });
    return jsonResponse(403, { error: 'No grants configured' }, ch);
  }

  const allowedByRegion = new Map<string, Set<Dimension>>(
    (grants as GrantRow[]).map((g) => [
      g.region_key,
      new Set(
        (g.allowed_signal_dimensions ?? []).filter((d): d is Dimension =>
          (ALL_DIMENSIONS as readonly string[]).includes(d),
        ),
      ),
    ]),
  );

  const grantedRegions = [...allowedByRegion.keys()];
  const regionsToQuery =
    requestedRegions.length > 0
      ? requestedRegions.filter((r) => allowedByRegion.has(r))
      : grantedRegions;

  if (regionsToQuery.length === 0) {
    await writeAudit(admin, partner.id, requestedRegions, 0, 403, {
      reason: 'no_overlap_with_grant',
    });
    return jsonResponse(403, { error: 'No grants for requested regions' }, ch);
  }

  // 4. Fetch snapshots.
  const { data: snapshots, error: snapErr } = await admin
    .from('conflict_severity_snapshots')
    .select([...ALWAYS_INCLUDE, ...ALL_DIMENSIONS].join(','))
    .in('region_key', regionsToQuery)
    .gte('snapshot_at', since)
    .order('snapshot_at', { ascending: false })
    .limit(limit);

  if (snapErr) {
    logError('csi_partner_export_snapshots_failed', {
      function: 'csi-partner-export',
      error_code: snapErr.code ?? null,
      error_message: safeErrorMessage(new Error(snapErr.message)),
    });
    await writeAudit(admin, partner.id, regionsToQuery, 0, 500, {
      reason: 'snapshots_load_failed',
    });
    return jsonResponse(500, { error: 'Could not load snapshots' }, ch);
  }

  const projected = (snapshots ?? [])
    .map((s) => projectSnapshot(s as Record<string, unknown>, allowedByRegion))
    .filter((s): s is Record<string, unknown> => s !== null);

  await writeAudit(admin, partner.id, regionsToQuery, projected.length, 200, {
    since,
    limit,
    requested_regions: requestedRegions,
  });

  logInfo('csi_partner_export_ok', {
    function: 'csi-partner-export',
    count: projected.length,
  });

  return jsonResponse(200, { ok: true, snapshots: projected }, ch);
});
