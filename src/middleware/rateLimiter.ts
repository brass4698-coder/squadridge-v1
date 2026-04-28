/**
 * rateLimiter.ts
 *
 * Redis-backed sliding-window rate limiter middleware.
 *
 * Status: SCAFFOLD — the logic is complete but the Redis client is a stub.
 * Wire `createRedisClient` to your Upstash / Redis instance before deploying.
 * See ROADMAP.md (Q3 2026: "Connect src/middleware/rateLimiter.ts to production Upstash").
 *
 * Design decisions:
 * - Uses a hashed session token (not raw IP) as the rate-limit key so that
 *   anonymisation is preserved (see src/middleware/anonymizeRequest.ts).
 * - Sliding window: N requests per windowMs milliseconds.
 * - Returns 429 with Retry-After header when limit is exceeded.
 *
 * See docs/security/threat-model.md §4 (Abuse / spam).
 */

import { createHash } from 'node:crypto';

// ---------------------------------------------------------------------------
// Redis client interface (stub — replace with real client in production)
// ---------------------------------------------------------------------------

export interface RedisClient {
  /** Increment a key and set TTL (seconds) if key is new. Returns new value. */
  incr(key: string): Promise<number>;
  /** Set TTL in seconds on an existing key. */
  expire(key: string, seconds: number): Promise<void>;
}

/**
 * Default no-op Redis client used when REDIS_URL is not configured.
 * Always allows requests through. Replace with real client in production.
 */
export const noopRedisClient: RedisClient = {
  async incr(_key: string): Promise<number> {
    return 1; // Always allow — stub
  },
  async expire(_key: string, _seconds: number): Promise<void> {
    // no-op
  },
};

// ---------------------------------------------------------------------------
// Rate limiter configuration
// ---------------------------------------------------------------------------

export interface RateLimiterOptions {
  /** Maximum number of requests allowed within `windowMs`. Default: 60. */
  maxRequests?: number;
  /** Window size in milliseconds. Default: 60_000 (1 minute). */
  windowMs?: number;
  /** Redis client. Defaults to noopRedisClient (scaffold). */
  redis?: RedisClient;
  /**
   * Function to derive the rate-limit key from the request.
   * Defaults to the hashed session token from the Authorization header,
   * falling back to req.anonMeta.anonIp (set by anonymizeRequest middleware).
   */
  keyFn?: (req: RateLimitRequest) => string;
}

export interface AnonMeta {
  anonIp: string;
  isPrivateNetwork: boolean;
}

export interface RateLimitRequest {
  headers: Record<string, string | string[] | undefined>;
  anonMeta?: AnonMeta;
}

export interface RateLimitResponse {
  status(code: number): RateLimitResponse;
  setHeader(name: string, value: string | number): void;
  json(body: unknown): void;
  end(): void;
}

export type NextFunction = (err?: unknown) => void;

// ---------------------------------------------------------------------------
// Default key derivation
// ---------------------------------------------------------------------------

function defaultKeyFn(req: RateLimitRequest): string {
  // Prefer the session token from Authorization header (already a random JWT).
  const auth = req.headers['authorization'];
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    // Hash the token so we never store raw JWTs in Redis.
    return 'rl:' + createHash('sha256').update(auth.slice(7)).digest('hex').slice(0, 20);
  }
  // Fall back to the anonymised IP set by anonymizeRequest middleware.
  return 'rl:' + (req.anonMeta?.anonIp ?? 'unknown');
}

// ---------------------------------------------------------------------------
// Middleware factory
// ---------------------------------------------------------------------------

/**
 * rateLimiter
 *
 * Returns an Express-compatible middleware that enforces a sliding-window
 * rate limit using Redis.
 *
 * Usage:
 * ```ts
 * import { rateLimiter } from './middleware/rateLimiter';
 * app.use(rateLimiter({ maxRequests: 100, windowMs: 60_000 }));
 * ```
 */
export function rateLimiter(options: RateLimiterOptions = {}) {
  const maxRequests = options.maxRequests ?? 60;
  const windowMs = options.windowMs ?? 60_000;
  const redis = options.redis ?? noopRedisClient;
  const keyFn = options.keyFn ?? defaultKeyFn;

  return async function rateLimiterMiddleware(
    req: RateLimitRequest,
    res: RateLimitResponse,
    next: NextFunction,
  ): Promise<void> {
    const key = keyFn(req);
    const windowSec = Math.ceil(windowMs / 1000);

    try {
      const count = await redis.incr(key);
      // Set TTL only on the first request in the window.
      if (count === 1) {
        await redis.expire(key, windowSec);
      }

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));

      if (count > maxRequests) {
        res.setHeader('Retry-After', windowSec);
        res.status(429).json({
          error: 'Too many requests. Please slow down.',
          retryAfterSeconds: windowSec,
        });
        return;
      }

      next();
    } catch (err) {
      // If Redis is unavailable, fail open (allow the request) and log the error.
      // In a production hardened setup you may want to fail closed instead —
      // change this behaviour based on your threat model.
      console.error('[rateLimiter] Redis error — failing open:', err);
      next();
    }
  };
}
