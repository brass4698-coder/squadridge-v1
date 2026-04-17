import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { MatchPerspective } from './matchmakingSession';
import { assertEdgeRateLimit } from './rateLimitEdge';

export type MatchmakingSnapshot =
  | {
      outcome: 'matched';
      squad_id: string;
      pool_key: string;
    }
  | {
      outcome: 'queued';
      pool_key: string;
      side: MatchPerspective;
      waiting_a: number;
      waiting_b: number;
      queue_position: number;
    }
  | {
      outcome: 'idle';
      pool_key: string;
    };

function parseSnapshot(data: unknown): MatchmakingSnapshot | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  const outcome = o.outcome;
  const pool_key = typeof o.pool_key === 'string' ? o.pool_key : 'default';
  if (outcome === 'matched' && typeof o.squad_id === 'string') {
    return { outcome: 'matched', squad_id: o.squad_id, pool_key };
  }
  if (outcome === 'idle') {
    return { outcome: 'idle', pool_key };
  }
  if (outcome === 'queued') {
    const side = o.side === 'A' || o.side === 'B' ? o.side : 'A';
    return {
      outcome: 'queued',
      pool_key,
      side,
      waiting_a: typeof o.waiting_a === 'number' ? o.waiting_a : Number(o.waiting_a) || 0,
      waiting_b: typeof o.waiting_b === 'number' ? o.waiting_b : Number(o.waiting_b) || 0,
      queue_position:
        typeof o.queue_position === 'number' ? o.queue_position : Number(o.queue_position) || 1,
    };
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
