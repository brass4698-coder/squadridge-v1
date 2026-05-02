/**
 * csi-ingest-snapshot — Track C: automated CSI rollup writer.
 *
 * Runs on a Supabase pg_cron schedule (private.csi_ingest_snapshot_cron in
 * 20260504120100) or on demand from ops with service_role auth. Reads
 * facilitator_signal_codes + sentiment_metrics for one region+window via the
 * SQL aggregator `csi_aggregate_signals`, computes the composite CSI score
 * with the math from src/lib/csi/conflictSeverityIndex.ts (re-implemented
 * inline to keep this Edge function self-contained), and writes rows into
 * conflict_severity_snapshots / escalation_alerts.
 *
 * Auth model:
 *   * Caller MUST present the service_role key in `Authorization: Bearer …`,
 *     OR be invoked from a trusted internal source (pg_cron via vault).
 *   * No authenticated user JWTs are accepted — there is no per-user
 *     surface for ingestion. Match the pattern in 20260427120000 RLS.
 *
 * Contract:
 *   POST /functions/v1/csi-ingest-snapshot
 *   Authorization: Bearer <service_role_key>
 *   Body: {
 *     region_keys?: string[],     // default: every distinct region present
 *                                 //          in csi_band_thresholds, fallback
 *                                 //          to facilitator_signal_codes
 *     period_hours?: number       // window length, default 24
 *   }
 *
 *   200: { ok: true, regions_processed, snapshots_inserted, alerts_inserted }
 *   401: missing / non-service-role auth
 *   500: server config / database error
 *
 * Honest scope: this is "internal-stage" CSI per docs/product/csi-spec.md.
 * Partner export ships in Track D as a separate function with stricter auth.
 */
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';
import { logError, logInfo, safeErrorMessage } from '../_shared/log.ts';

interface CsiSignalInputs {
  negativeMessageRatio24h: number;
  grievanceClusterIndex: number;
  resourceKeywordsPer1k: number;
  ingroupOutgroupRate: number;
  sentimentDeltaDayOverDay: number;
  violenceJustifyingPerSession: number;
}

interface AggregatedPayload {
  squadCount: number;
  messageCount: number;
  inputs: CsiSignalInputs;
  topGrievances: Array<{ theme: string; weight: number }>;
}

interface BandThresholdsRow {
  region_key: string;
  green_max: number;
  yellow_max: number;
  sentiment_negative_ref: number;
  grievance_ref: number;
  resource_ref_per_1k: number;
  ingroup_ref: number;
  sentiment_delta_ref: number;
  violence_ref_per_session: number;
}

const DEFAULT_BAND: Pick<BandThresholdsRow, 'green_max' | 'yellow_max'> = {
  green_max: 30,
  yellow_max: 60,
};

const DEFAULT_REFS = {
  sentiment_negative_ref: 0.15,
  grievance_ref: 0.4,
  resource_ref_per_1k: 8,
  ingroup_ref: 0.12,
  sentiment_delta_ref: 0.25,
  violence_ref_per_session: 2.5,
};

const COMPONENT_HIGH = 85;

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

function ratioToSeverity(value: number, ref: number): number {
  if (ref <= 0 || value <= 0) return 0;
  return Math.min(100, (value / ref) * 100);
}

function clamp0to100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function computeCsi(
  inputs: CsiSignalInputs,
  thresholds: BandThresholdsRow | null,
): {
  csiScore: number;
  band: 'green' | 'yellow' | 'red';
  componentScores: {
    sentiment: number;
    grievance: number;
    resource: number;
    ingroup: number;
    velocity: number;
    violence: number;
  };
  detectedEscalation: boolean;
} {
  const refs = {
    sentimentNegative: thresholds?.sentiment_negative_ref ?? DEFAULT_REFS.sentiment_negative_ref,
    grievance: thresholds?.grievance_ref ?? DEFAULT_REFS.grievance_ref,
    resourcePer1k: thresholds?.resource_ref_per_1k ?? DEFAULT_REFS.resource_ref_per_1k,
    ingroup: thresholds?.ingroup_ref ?? DEFAULT_REFS.ingroup_ref,
    sentimentDelta: thresholds?.sentiment_delta_ref ?? DEFAULT_REFS.sentiment_delta_ref,
    violencePerSession:
      thresholds?.violence_ref_per_session ?? DEFAULT_REFS.violence_ref_per_session,
  };
  const greenMax = thresholds?.green_max ?? DEFAULT_BAND.green_max;
  const yellowMax = thresholds?.yellow_max ?? DEFAULT_BAND.yellow_max;

  const sSent = ratioToSeverity(inputs.negativeMessageRatio24h, refs.sentimentNegative);
  const sGri = ratioToSeverity(inputs.grievanceClusterIndex, refs.grievance);
  const sRes = ratioToSeverity(inputs.resourceKeywordsPer1k, refs.resourcePer1k);
  const sIn = ratioToSeverity(inputs.ingroupOutgroupRate, refs.ingroup);
  const sVel = ratioToSeverity(Math.max(0, -inputs.sentimentDeltaDayOverDay), refs.sentimentDelta);
  const sVio = ratioToSeverity(inputs.violenceJustifyingPerSession, refs.violencePerSession);

  const components = {
    sentiment: clamp0to100(sSent),
    grievance: clamp0to100(sGri),
    resource: clamp0to100(sRes),
    ingroup: clamp0to100(sIn),
    velocity: clamp0to100(sVel),
    violence: clamp0to100(sVio),
  };

  const csiScore = clamp0to100(
    (components.sentiment +
      components.grievance +
      components.resource +
      components.ingroup +
      components.velocity +
      components.violence) /
      6,
  );

  const band: 'green' | 'yellow' | 'red' =
    csiScore <= greenMax ? 'green' : csiScore <= yellowMax ? 'yellow' : 'red';

  const componentMax = Math.max(
    components.sentiment,
    components.grievance,
    components.resource,
    components.ingroup,
    components.velocity,
    components.violence,
  );

  const detectedEscalation = band !== 'green' || componentMax >= COMPONENT_HIGH;

  return { csiScore, band, componentScores: components, detectedEscalation };
}

async function discoverRegions(admin: SupabaseClient, override?: string[]): Promise<string[]> {
  if (override && override.length > 0) {
    return override.map((s) => String(s).trim()).filter(Boolean);
  }
  const { data: bands } = await admin.from('csi_band_thresholds').select('region_key');
  const bandKeys = new Set((bands ?? []).map((r: { region_key: string }) => r.region_key));
  if (bandKeys.size > 0) return [...bandKeys];

  // Fallback: use distinct regions seen in the codes table over the last 7d.
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data: codes } = await admin
    .from('facilitator_signal_codes')
    .select('region_key')
    .gte('coded_at', since);
  return [...new Set((codes ?? []).map((r: { region_key: string }) => r.region_key))];
}

async function ingestForRegion(
  admin: SupabaseClient,
  regionKey: string,
  periodStart: string,
  periodEnd: string,
): Promise<{ snapshotInserted: boolean; alertInserted: boolean }> {
  const { data: agg, error: aggErr } = await admin.rpc('csi_aggregate_signals', {
    p_region_key: regionKey,
    p_period_start: periodStart,
    p_period_end: periodEnd,
  });
  if (aggErr) throw new Error(`aggregate_failed:${aggErr.message}`);
  if (!agg) return { snapshotInserted: false, alertInserted: false };

  const payload = agg as AggregatedPayload;

  const { data: thresholds } = await admin
    .from('csi_band_thresholds')
    .select('*')
    .eq('region_key', regionKey)
    .maybeSingle();

  const result = computeCsi(payload.inputs, (thresholds ?? null) as BandThresholdsRow | null);

  const { data: snapshotRow, error: insErr } = await admin
    .from('conflict_severity_snapshots')
    .insert({
      region_key: regionKey,
      period_start: periodStart,
      period_end: periodEnd,
      csi_score: result.csiScore,
      severity_band: result.band,
      sentiment_signal: result.componentScores.sentiment,
      grievance_signal: result.componentScores.grievance,
      resource_signal: result.componentScores.resource,
      ingroup_outgroup_signal: result.componentScores.ingroup,
      escalation_velocity_signal: result.componentScores.velocity,
      violence_normalization_signal: result.componentScores.violence,
      component_scores: {
        version: 3,
        inputs: payload.inputs,
        thresholds: thresholds ?? null,
        ingestion: { source: 'csi-ingest-snapshot', cron: true },
      },
      top_grievances: payload.topGrievances ?? [],
      squad_count: payload.squadCount,
      message_count: payload.messageCount,
      detected_escalation: result.detectedEscalation,
    })
    .select('id')
    .single();

  if (insErr) {
    logError('csi_snapshot_insert_failed', {
      function: 'csi-ingest-snapshot',
      error_code: insErr.code ?? null,
      error_message: safeErrorMessage(new Error(insErr.message)),
    });
    return { snapshotInserted: false, alertInserted: false };
  }

  if (!result.detectedEscalation || !snapshotRow) {
    return { snapshotInserted: true, alertInserted: false };
  }

  // Region-level alert: scoped to a placeholder squad row when the region has
  // no specific squad above-threshold. The CSI spec (csi-spec.md) is explicit
  // that human-in-the-loop review is mandatory before any external action.
  // We only insert when squad_count > 0 — if there are no squads in the
  // window, alerting on a phantom region adds noise, not signal.
  if (payload.squadCount <= 0) {
    return { snapshotInserted: true, alertInserted: false };
  }

  // Find a representative squad in the region (most recent code) to anchor
  // the alert. The escalation_alerts row points to one squad_id by design.
  const { data: anchorSquad } = await admin
    .from('facilitator_signal_codes')
    .select('squad_id')
    .eq('region_key', regionKey)
    .gte('coded_at', periodStart)
    .lt('coded_at', periodEnd)
    .not('squad_id', 'is', null)
    .order('coded_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!anchorSquad?.squad_id) {
    return { snapshotInserted: true, alertInserted: false };
  }

  const { error: alertErr } = await admin.from('escalation_alerts').insert({
    squad_id: anchorSquad.squad_id,
    region_key: regionKey,
    csi_score: result.csiScore,
    severity_level: result.band,
    recommended_action:
      result.band === 'red'
        ? 'Mandatory moderator review; consider pausing matched session and consulting escalation runbook.'
        : 'Increase facilitator attention; review codes and message trace.',
    source_snapshot_id: snapshotRow.id,
    metadata: { source: 'csi-ingest-snapshot', anchor_strategy: 'most_recent_code' },
  });

  if (alertErr) {
    logError('csi_alert_insert_failed', {
      function: 'csi-ingest-snapshot',
      error_code: alertErr.code ?? null,
      error_message: safeErrorMessage(new Error(alertErr.message)),
    });
    return { snapshotInserted: true, alertInserted: false };
  }

  return { snapshotInserted: true, alertInserted: true };
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

  // Auth: require the bearer token to match the service-role key. Keeps the
  // function private even though pg_cron / ops invoke it directly.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse(401, { error: 'Unauthorized' }, ch);
  }
  const token = authHeader.slice(7).trim();
  if (token !== serviceKey) {
    return jsonResponse(401, { error: 'Unauthorized' }, ch);
  }

  let body: { region_keys?: unknown; period_hours?: unknown };
  try {
    body = (await req.json()) as { region_keys?: unknown; period_hours?: unknown };
  } catch {
    body = {};
  }

  const periodHours =
    typeof body.period_hours === 'number' && body.period_hours > 0 && body.period_hours <= 168
      ? Math.round(body.period_hours)
      : 24;

  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - periodHours * 3600 * 1000);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const overrideRegions = Array.isArray(body.region_keys)
    ? (body.region_keys.filter((s) => typeof s === 'string') as string[])
    : undefined;

  const regions = await discoverRegions(admin, overrideRegions);

  let snapshotsInserted = 0;
  let alertsInserted = 0;

  for (const regionKey of regions) {
    try {
      const { snapshotInserted, alertInserted } = await ingestForRegion(
        admin,
        regionKey,
        periodStart.toISOString(),
        periodEnd.toISOString(),
      );
      if (snapshotInserted) snapshotsInserted += 1;
      if (alertInserted) alertsInserted += 1;
    } catch (e) {
      logError('csi_region_ingest_failed', {
        function: 'csi-ingest-snapshot',
        error_message: safeErrorMessage(e),
      });
    }
  }

  logInfo('csi_ingest_done', {
    function: 'csi-ingest-snapshot',
    count: regions.length,
  });

  return jsonResponse(
    200,
    {
      ok: true,
      regions_processed: regions.length,
      snapshots_inserted: snapshotsInserted,
      alerts_inserted: alertsInserted,
    },
    ch,
  );
});
