/**
 * rateLimiter.ts — Redis-backed rate limiter middleware (scaffold)
 *
 * PURPOSE
 * -------
 * Limit how many requests a client (identified by x-anon-ip set by
 * anonymizeRequest.ts) can make in a given time window. Backs the limit
 * counter in Redis so it survives server restarts and works across multiple
 * server instances.
 *
 * THIS IS A SCAFFOLD. It ships with:
 *   - A minimal Redis-client interface (so you can inject any ioredis-compatible
 *     client, Upstash Redis, or the in-memory mock used in tests)
 *   - An in-memory fallback for development / single-instance deployments
 *   - The middleware factory with env-configurable limits
 *
 * HOW IT WORKS (sliding-window counter)
 * ----------------------------------------
 * For each (key, window), we INCR a Redis counter and set its TTL to the
 * window size on first increment. If the counter exceeds maxRequests we return
 * 429 Too Many Requests with a Retry-After header.
 *
 * This is a fixed-window approximation, not a true sliding window. Near the
 * window boundary a client can briefly double the limit (end of one window +
 * start of next). This is acceptable for abuse prevention; if you need strict
 * per-second limits, use a sorted set approach instead.
 *
 * TRADEOFFS
 * ---------
 * - Redis outage: the `failOpen` option (default: true) lets requests through
 *   when Redis is unavailable. Set failOpen=false for stricter enforcement
 *   (will block all requests when Redis is down).
 * - Key granularity: we use x-anon-ip as the key. Pepper rotation invalidates
 *   all existing keys simultaneously — this is a brief spike-allowance, not a
 *   security issue.
 * - Multi-instance: Redis INCR is atomic; this is safe across replicas.
 * - Memory fallback: the in-memory fallback is per-process and non-atomic.
 *   Use it only in development or single-instance environments.
 *
 * ENV VARS
 * --------
 * REDIS_URL         — Redis connection string (used by your server code to
 *                     initialise ioredis; this file does not read it directly)
 * RATE_LIMIT_MAX    — max requests per window (default: 60)
 * RATE_LIMIT_WINDOW — window size in seconds (default: 60)
 *
 * NEXT STEPS (wiring)
 * -------------------
 * 1. Install ioredis: npm install ioredis @types/ioredis
 *    (or use the @upstash/redis REST client for Deno/Edge environments)
 * 2. Create a Redis client in your server entry point:
 *      import Redis from 'ioredis';
 *      const redis = new Redis(process.env.REDIS_URL);
 * 3. Wire the middleware:
 *      import { makeRateLimiter } from './middleware/rateLimiter';
 *      app.use(makeRateLimiter({ redis, maxRequests: 60, windowSeconds: 60 }));
 * 4. Remove the in-memory fallback warning for production.
 * 5. Add a health-check endpoint that verifies Redis connectivity.
 * 6. [ ] Add metric counter for 429s (no key values in metric tags)
 * 7. [ ] Add support for per-route overrides (e.g. tighter limits on /messages)
 */

// ─── Minimal Redis interface ──────────────────────────────────────────────────
// We accept anything with incr() and expire() so you can inject ioredis,
// ioredis-mock, Upstash, or the in-memory implementation below.

export interface RedisLikeClient {
  /** Increment integer at key by 1; return new value. Create key if absent (value becomes 1). */
  incr(key: string): Promise<number>;
  /** Set TTL on key (seconds). No-op if key does not exist. */
  expire(key: string, seconds: number): Promise<number | void>;
}

// ─── In-memory fallback (development / tests) ────────────────────────────────

interface MemoryEntry {
  count: number;
  expiresAt: number;
}

/**
 * Simple in-memory rate-limit store. NOT suitable for production multi-instance
 * deployments. Use this only for local dev and tests.
 */
export class MemoryRedis implements RedisLikeClient {
  private readonly store = new Map<string, MemoryEntry>();

  async incr(key: string): Promise<number> {
    const now = Date.now();
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt <= now) {
      // New or expired — start fresh
      this.store.set(key, { count: 1, expiresAt: Infinity });
      return 1;
    }
    entry.count += 1;
    return entry.count;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    // Only set TTL once (on the first increment) — mimic Redis INCR + EXPIRE pattern
    if (entry.expiresAt === Infinity) {
      entry.expiresAt = Date.now() + seconds * 1000;
    }
    return 1;
  }

  /** Test helper: reset all counters. */
  _flush(): void {
    this.store.clear();
  }

  /** Test helper: inspect current count for a key without incrementing. */
  _count(key: string): number {
    const entry = this.store.get(key);
    if (!entry || entry.expiresAt <= Date.now()) return 0;
    return entry.count;
  }
}

// ─── Middleware interfaces ────────────────────────────────────────────────────

export interface RateLimitableRequest {
  headers: Record<string, string | string[] | undefined>;
}

export interface RateLimitableResponse {
  status(code: number): RateLimitableResponse;
  setHeader(name: string, value: string | number): void;
  json(body: unknown): void;
  headersSent?: boolean;
}

export type RateLimitNextFunction = (err?: Error) => void;

// ─── Rate limiter options ─────────────────────────────────────────────────────

export interface RateLimiterOptions {
  /**
   * Redis (or compatible) client for shared counter storage.
   * If not provided, falls back to in-memory (single-instance only).
   */
  redis?: RedisLikeClient;

  /** Maximum requests allowed per window per key. Default: 60. */
  maxRequests?: number;

  /** Window size in seconds. Default: 60. */
  windowSeconds?: number;

  /**
   * When true (default), requests pass through if Redis is unavailable.
   * Set to false for strict enforcement at the cost of availability.
   */
  failOpen?: boolean;

  /**
   * Header to read the client identifier from.
   * Default: 'x-anon-ip' (set by anonymizeRequest.ts).
   */
  keyHeader?: string;
}

// ─── Middleware factory ───────────────────────────────────────────────────────

/**
 * Create a rate-limiter middleware.
 *
 * @example
 * ```ts
 * import Redis from 'ioredis';
 * import { makeRateLimiter } from './middleware/rateLimiter';
 *
 * const redis = new Redis(process.env.REDIS_URL);
 * app.use(makeRateLimiter({ redis, maxRequests: 60, windowSeconds: 60 }));
 * ```
 */
export function makeRateLimiter(opts: RateLimiterOptions = {}) {
  // Parse env-var integers safely: parseInt returns NaN for empty/invalid strings,
  // which falls back to the default cleanly (unlike Number('0') which is falsy).
  const envMax = parseInt(process.env.RATE_LIMIT_MAX ?? '', 10);
  const envWindow = parseInt(process.env.RATE_LIMIT_WINDOW ?? '', 10);
  const {
    maxRequests = !isNaN(envMax) && envMax > 0 ? envMax : 60,
    windowSeconds = !isNaN(envWindow) && envWindow > 0 ? envWindow : 60,
    failOpen = true,
    keyHeader = 'x-anon-ip',
  } = opts;

  // Use the provided Redis client or fall back to in-memory.
  const store: RedisLikeClient =
    opts.redis ??
    (() => {
      // Startup diagnostic — runs once, no PII. console.warn is in the ESLint allow-list.
      console.warn(
        '[rateLimiter] No Redis client provided; using in-memory fallback. ' +
          'This is not suitable for multi-instance deployments.',
      );
      return new MemoryRedis();
    })();

  return async function rateLimiter(
    req: RateLimitableRequest,
    res: RateLimitableResponse,
    next: RateLimitNextFunction,
  ): Promise<void> {
    const rawKey = req.headers[keyHeader];
    // If there's no identifier (anonymizeRequest didn't run, or failed), use a
    // sentinel key. This avoids a crash but means all unidentified requests
    // share one bucket — adjust based on your security requirements.
    const key = typeof rawKey === 'string' && rawKey.length > 0 ? rawKey : '__unknown__';

    const redisKey = `rl:${key}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;

    let count: number;
    try {
      count = await store.incr(redisKey);
      // Set TTL only on first increment (subsequent expire() calls are no-ops
      // because the MemoryRedis and ioredis both preserve existing TTLs).
      if (count === 1) {
        await store.expire(redisKey, windowSeconds);
      }
    } catch {
      // Redis error — apply failOpen policy.
      if (failOpen) {
        next();
        return;
      }
      // failOpen=false: block the request.
      if (!res.headersSent) {
        res.setHeader('Retry-After', String(windowSeconds));
        res.status(503).json({ error: 'rate_limit_unavailable' });
      }
      return;
    }

    if (count > maxRequests) {
      // Standard 429 with Retry-After.
      if (!res.headersSent) {
        res.setHeader('Retry-After', String(windowSeconds));
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', '0');
        res.status(429).json({ error: 'rate_limit_exceeded' });
      }
      return;
    }

    // Within limit — annotate remaining for client transparency.
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
    next();
  };
}
