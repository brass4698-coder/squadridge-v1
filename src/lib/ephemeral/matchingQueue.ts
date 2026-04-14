/**
 * Ephemeral matching queue abstraction.
 * Production: back with Redis (lists/streams) or a dedicated worker. Use `docker-compose.yml` to run Redis locally for backend services.
 */

export type MatchEnqueueResult = 'queued' | 'skipped';

export interface MatchingQueue {
  /** Enqueue the current user for squad matching (non-PII handle only). */
  enqueueUserMatch(userId: string): Promise<MatchEnqueueResult>;
}

export function createNoOpMatchingQueue(): MatchingQueue {
  return {
    async enqueueUserMatch() {
      return 'skipped';
    },
  };
}

/**
 * Placeholder for a Redis-backed implementation in a Node/Edge worker (not wired in the browser bundle).
 */
export function createRedisMatchingQueueFromEnv(): MatchingQueue {
  return createNoOpMatchingQueue();
}
