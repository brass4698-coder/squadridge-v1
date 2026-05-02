/**
 * Map `computeConflictSeverityIndex` output to a `conflict_severity_snapshots` **Insert** row shape.
 * Intended for **trusted workers** (Edge Function, batch job) that use the **service role** client —
 * do **not** call this from the browser to insert (RLS: no `authenticated` INSERT on CSI tables).
 */
import type { CsiResult } from './conflictSeverityIndex';
import type { Database, Json } from '../database.types';

export type ConflictSeveritySnapshotInsert =
  Database['public']['Tables']['conflict_severity_snapshots']['Insert'];

function clamp0to100(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Build a row payload from a `CsiResult`. Persists the full `trace` and `meta` under `component_scores` JSON
 * (version 2) so moderators can audit "why" in internal tools; align with
 * `docs/product/conflict-severity-index.md`.
 */
export function conflictSeveritySnapshotInsertFromResult(
  result: CsiResult,
  params: {
    regionKey: string;
    periodStart: string;
    periodEnd: string;
    snapshotAt?: string;
    squadCount?: number;
    messageCount?: number;
  },
): ConflictSeveritySnapshotInsert {
  const cs = result.componentScores;
  /** Persist structured CSI audit blob — cast via unknown because typed structs are not assignable to recursive Json without assertion. */
  const component_scores = {
    version: 2,
    trace: result.trace,
    meta: result.meta,
  } as unknown as Json;

  const top: Json =
    result.topGrievances.length > 0 ? (result.topGrievances as unknown as Json) : [];

  return {
    region_key: params.regionKey,
    period_start: params.periodStart,
    period_end: params.periodEnd,
    snapshot_at: params.snapshotAt,
    csi_score: result.csiScore,
    severity_band: result.band,
    sentiment_signal: clamp0to100(cs.sentimentTrajectory),
    grievance_signal: clamp0to100(cs.grievanceClustering),
    resource_signal: clamp0to100(cs.resourceScarcity),
    ingroup_outgroup_signal: clamp0to100(cs.ingroupOutgroup),
    escalation_velocity_signal: clamp0to100(cs.escalationVelocity),
    violence_normalization_signal: clamp0to100(cs.violenceNormalization),
    component_scores,
    top_grievances: top,
    squad_count: params.squadCount ?? 0,
    message_count: params.messageCount ?? 0,
    detected_escalation: result.detectedEscalation,
  };
}
