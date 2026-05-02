import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { Database } from '../database.types';
import type { MatchPerspective } from './matchmakingSession';
import { assertEdgeRateLimit } from '../rateLimitEdge';
import { captureAppError } from '../sentry';

const matchedSnapshotSchema = z.object({
  outcome: z.literal('matched'),
  squad_id: z.string().min(1),
  pool_key: z.string().min(1),
});

const idleSnapshotSchema = z.object({
  outcome: z.literal('idle'),
  pool_key: z.string().min(1),
});

const queuedSnapshotSchema = z.object({
  outcome: z.literal('queued'),
  pool_key: z.string().min(1),
  side: z.enum(['A', 'B']),
  // RPC may return numeric strings under some PG drivers; coerce defensively
  // but require the underlying value to parse to a non-negative integer.
  waiting_a: z.coerce.number().int().nonnegative(),
  waiting_b: z.coerce.number().int().nonnegative(),
  queue_position: z.coerce.number().int().positive(),
});

const matchmakingSnapshotSchema = z.discriminatedUnion('outcome', [
  matchedSnapshotSchema,
  idleSnapshotSchema,
  queuedSnapshotSchema,
]);

export type MatchmakingSnapshot = z.infer<typeof matchmakingSnapshotSchema>;

/**
 * Strict parse of an RPC snapshot payload. Returns `null` and reports an
 * `AppError` to Sentry when the shape diverges from the contract; in dev/test
 * the parse error is rethrown so contract drift fails loudly. The previous
 * implementation silently coerced unknown `pool_key` values to `'default'`,
 * which masked RPC contract violations.
 */
export function parseSnapshot(data: unknown): MatchmakingSnapshot | null {
  const result = matchmakingSnapshotSchema.safeParse(data);
  if (result.success) return result.data;
  const issueSummary = result.error.issues
    .slice(0, 5)
    .map((i) => `${i.path.join('.') || '<root>'}: ${i.code}`)
    .join('; ');
  captureAppError(new Error('matchmaking_snapshot_parse_failed'), {
    feature: 'matchmaking_client',
    extra: { issues: issueSummary },
  });
  if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
    throw result.error;
  }
  return null;
}

export async function enqueueMatchmaking(
  supabase: SupabaseClient<Database>,
  poolKey: string,
  side: MatchPerspective,
): Promise<MatchmakingSnapshot | null> {
  await assertEdgeRateLimit(supabase, 'matchmaking_enqueue_and_try');
  const { data, error } = await supabase.rpc('matchmaking_enqueue_and_try', {
    p_pool_key: poolKey,
    p_side: side,
  });
  if (error) throw error;
  return parseSnapshot(data);
}

export async function pollMatchmakingSnapshot(
  supabase: SupabaseClient<Database>,
  poolKey: string,
): Promise<MatchmakingSnapshot | null> {
  const { data, error } = await supabase.rpc('matchmaking_pool_snapshot', {
    p_pool_key: poolKey,
  });
  if (error) throw error;
  return parseSnapshot(data);
}

export async function cancelMatchmaking(
  supabase: SupabaseClient<Database>,
  poolKey: string,
): Promise<void> {
  const { error } = await supabase.rpc('matchmaking_cancel_waiting', {
    p_pool_key: poolKey,
  });
  if (error) throw error;
}
