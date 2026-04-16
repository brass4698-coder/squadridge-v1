/**
 * Ephemeral matching queue abstraction.
 * Production: primary path is Supabase RPC + Postgres (`matchmaking_*`); Redis remains an option for very high churn.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import { enqueueMatchmaking, pollMatchmakingSnapshot } from '../matchmakingClient';
import type { MatchPerspective } from '../matchmakingSession';

export type MatchEnqueueResult = 'queued' | 'skipped';

export interface MatchingQueue {
  /** Enqueue the current user for squad matching (non-PII pool key + side only). */
  enqueueUserMatch(userId: string, options: { poolKey: string; side: MatchPerspective }): Promise<MatchEnqueueResult>;
}

export function createNoOpMatchingQueue(): MatchingQueue {
  return {
    async enqueueUserMatch() {
      return 'skipped';
    },
  };
}

export function createSupabaseMatchingQueue(client: SupabaseClient<Database>): MatchingQueue {
  return {
    async enqueueUserMatch(_userId, options) {
      const snap = await enqueueMatchmaking(client, options.poolKey, options.side);
      if (!snap) return 'skipped';
      return snap.outcome === 'queued' || snap.outcome === 'matched' ? 'queued' : 'skipped';
    },
  };
}

/** Readiness probe for UI: snapshot without re-inserting a queue row. */
export function createMatchingSnapshotReader(client: SupabaseClient<Database>) {
  return (poolKey: string) => pollMatchmakingSnapshot(client, poolKey);
}

/**
 * Placeholder for a Redis-backed implementation in a Node worker (not wired in the browser bundle).
 */
export function createRedisMatchingQueueFromEnv(): MatchingQueue {
  return createNoOpMatchingQueue();
}
