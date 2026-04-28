/**
 * rateLimiter.ts
 *
 * A configurable sliding-window rate limiter with a pluggable store interface.
 * The in-memory store is suitable for single-process tests; production should
 * wire the RedisRateLimitStore (or the existing Upstash Edge Function at
 * supabase/functions/rate-limit/) instead.
 *
 * Usage (pseudocode):
 *   const store = new InMemoryRateLimitStore();   // or RedisRateLimitStore
 *   const result = await checkRateLimit(store, anonIp, { windowMs: 60_000, max: 10 });
 *   if (!result.allowed) {
 *     return new Response('Too Many Requests', {
 *       status: 429,
 *       headers: { 'Retry-After': String(Math.ceil((result.retryAfterMs ?? 0) / 1000)) },
 *     });
 *   }
 *
 * Scaffold note:
 *   InMemoryRateLimitStore is fully implemented and tested.
 *   RedisRateLimitStore is a scaffold — wire your Redis client (Upstash REST,
 *   ioredis, etc.) into the increment() and reset() methods before deploying.
 *
 * Design notes:
 *   - We key on x-anon-ip (hashed IP) rather than raw IP to avoid storing PII.
 *   - Window is fixed per call; you can combine multiple windows (e.g. per-minute
 *     burst + per-hour quota) by calling checkRateLimit twice with different opts.
 *   - The in-memory store is not shared across workers / processes — use Redis
 *     for any multi-instance deployment.
 */

/** Minimum interface a store must implement. */
export interface RateLimitStore {
  /**
   * Increment the request counter for `key` and return the new count and
   * the TTL of the current window in milliseconds.
   * Must be atomic (or close enough) for the use case.
   */
  increment(key: string, windowMs: number): Promise<{ count: number; ttlMs: number }>;

  /** Reset the counter for `key` (used in tests and manual intervention). */
  reset(key: string): Promise<void>;
}

export interface RateLimitResult {
  allowed: boolean;
  /** How many milliseconds until the window resets (only set when not allowed). */
  retryAfterMs?: number;
  /** Current count in the window. */
  count: number;
}

export interface RateLimitOptions {
  /** Window duration in milliseconds. Default: 60 000 (1 minute). */
  windowMs: number;
  /** Maximum requests allowed per window. */
  max: number;
}

/**
 * Check whether a request from `key` is within the rate limit.
 * Returns { allowed: true } if under the limit, { allowed: false, retryAfterMs }
 * if the limit is exceeded.
 */
export async function checkRateLimit(
  store: RateLimitStore,
  key: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  const { count, ttlMs } = await store.increment(key, opts.windowMs);

  if (count > opts.max) {
    return { allowed: false, retryAfterMs: ttlMs, count };
  }
  return { allowed: true, count };
}

// ---------------------------------------------------------------------------
// In-memory store (tests and single-process dev environments)
// ---------------------------------------------------------------------------

interface Bucket {
  count: number;
  resetAt: number; // epoch ms
}

/**
 * Simple in-memory sliding-window store. Not suitable for multi-process
 * deployments — use RedisRateLimitStore in production.
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, Bucket>();

  async increment(key: string, windowMs: number): Promise<{ count: number; ttlMs: number }> {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || now >= existing.resetAt) {
      const resetAt = now + windowMs;
      this.buckets.set(key, { count: 1, resetAt });
      return { count: 1, ttlMs: windowMs };
    }

    existing.count += 1;
    return { count: existing.count, ttlMs: existing.resetAt - now };
  }

  async reset(key: string): Promise<void> {
    this.buckets.delete(key);
  }

  /** Test helper: inspect current state without incrementing. */
  peek(key: string): Bucket | undefined {
    return this.buckets.get(key);
  }
}

// ---------------------------------------------------------------------------
// Redis store scaffold
// ---------------------------------------------------------------------------

/**
 * Redis-backed rate limit store scaffold.
 *
 * Scaffold — this class is not yet implemented. Wiring notes:
 *   1. Install your Redis client: Upstash REST client, ioredis, or node-redis.
 *   2. Replace the TODO bodies with actual INCR + EXPIRE / PEXPIRE commands.
 *   3. Use a Lua script or Redis pipeline to make increment + expiry atomic.
 *
 * Example pattern (pseudo-Redis):
 *   const count = await redis.incr(key);
 *   if (count === 1) await redis.pexpire(key, windowMs);
 *   const ttlMs = await redis.pttl(key);
 *   return { count, ttlMs };
 */
export class RedisRateLimitStore implements RateLimitStore {
  constructor(private readonly _redis: unknown) {
    // _redis: your Redis client instance (Upstash, ioredis, etc.)
    // Stored but not yet used — implement increment() and reset() below.
    void this._redis;
  }

  // TODO: implement using Redis INCR + PEXPIRE (atomic via pipeline or Lua script)
  async increment(_key: string, _windowMs: number): Promise<{ count: number; ttlMs: number }> {
    throw new Error(
      'RedisRateLimitStore.increment is a scaffold. Wire your Redis client before deploying.',
    );
  }

  // TODO: implement using Redis DEL
  async reset(_key: string): Promise<void> {
    throw new Error(
      'RedisRateLimitStore.reset is a scaffold. Wire your Redis client before deploying.',
    );
  }
}
