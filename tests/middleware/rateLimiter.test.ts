/**
 * tests/middleware/rateLimiter.test.ts
 *
 * Unit tests for the rateLimiter middleware.
 * Uses an in-memory mock Redis client so no real Redis instance is needed.
 *
 * Run with: npm test (vitest)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  rateLimiter,
  noopRedisClient,
  type RedisClient,
  type RateLimitRequest,
} from '../../src/middleware/rateLimiter';

// ---------------------------------------------------------------------------
// In-memory mock Redis client
// ---------------------------------------------------------------------------

function createMockRedis(): RedisClient & { _store: Map<string, number> } {
  const store = new Map<string, number>();
  return {
    _store: store,
    async incr(key: string): Promise<number> {
      const current = store.get(key) ?? 0;
      const next = current + 1;
      store.set(key, next);
      return next;
    },
    async expire(_key: string, _seconds: number): Promise<void> {
      // no-op in tests
    },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeReq(authToken?: string): RateLimitRequest {
  return {
    headers: authToken ? { authorization: `Bearer ${authToken}` } : { authorization: undefined },
    anonMeta: { anonIp: 'aabbccddeeff0011', isPrivateNetwork: false },
  };
}

interface MockResponse {
  statusCode: number;
  headers: Record<string, string | number>;
  body: unknown;
  ended: boolean;
  status(code: number): MockResponse;
  setHeader(name: string, value: string | number): void;
  json(body: unknown): void;
  end(): void;
}

function makeRes(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    headers: {},
    body: null,
    ended: false,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    setHeader(name: string, value: string | number) {
      res.headers[name] = value;
    },
    json(body: unknown) {
      res.body = body;
    },
    end() {
      res.ended = true;
    },
  };
  return res;
}

// ---------------------------------------------------------------------------
// noopRedisClient
// ---------------------------------------------------------------------------

describe('noopRedisClient', () => {
  it('incr always returns 1', async () => {
    expect(await noopRedisClient.incr('test')).toBe(1);
  });

  it('expire resolves without error', async () => {
    await expect(noopRedisClient.expire('test', 60)).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// rateLimiter factory
// ---------------------------------------------------------------------------

describe('rateLimiter', () => {
  let mockRedis: RedisClient & { _store: Map<string, number> };

  beforeEach(() => {
    mockRedis = createMockRedis();
  });

  it('calls next() when under the limit', async () => {
    const middleware = rateLimiter({ maxRequests: 5, windowMs: 60_000, redis: mockRedis });
    const next = vi.fn();
    await middleware(makeReq('token-abc'), makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('sets X-RateLimit-Limit header', async () => {
    const middleware = rateLimiter({ maxRequests: 10, windowMs: 60_000, redis: mockRedis });
    const res = makeRes();
    await middleware(makeReq(), res, vi.fn());
    expect(res.headers['X-RateLimit-Limit']).toBe(10);
  });

  it('sets X-RateLimit-Remaining header', async () => {
    const middleware = rateLimiter({ maxRequests: 5, windowMs: 60_000, redis: mockRedis });
    const res = makeRes();
    await middleware(makeReq(), res, vi.fn());
    expect(res.headers['X-RateLimit-Remaining']).toBe(4);
  });

  it('returns 429 when over the limit', async () => {
    const middleware = rateLimiter({ maxRequests: 2, windowMs: 60_000, redis: mockRedis });
    const next = vi.fn();

    // Exhaust the limit
    await middleware(makeReq(), makeRes(), vi.fn());
    await middleware(makeReq(), makeRes(), vi.fn());

    // Third request should be blocked
    const res = makeRes();
    await middleware(makeReq(), res, next);
    expect(res.statusCode).toBe(429);
    expect(next).not.toHaveBeenCalled();
  });

  it('sets Retry-After header on 429', async () => {
    const middleware = rateLimiter({ maxRequests: 1, windowMs: 30_000, redis: mockRedis });

    await middleware(makeReq(), makeRes(), vi.fn()); // first: allowed
    const res = makeRes();
    await middleware(makeReq(), res, vi.fn()); // second: blocked
    expect(res.headers['Retry-After']).toBe(30);
  });

  it('X-RateLimit-Remaining is 0 (not negative) when over limit', async () => {
    const middleware = rateLimiter({ maxRequests: 1, windowMs: 60_000, redis: mockRedis });

    await middleware(makeReq(), makeRes(), vi.fn()); // 1st: allowed
    const res = makeRes();
    await middleware(makeReq(), res, vi.fn()); // 2nd: blocked
    expect(res.headers['X-RateLimit-Remaining']).toBe(0);
  });

  it('fails open (calls next) when Redis throws', async () => {
    const brokenRedis: RedisClient = {
      async incr() {
        throw new Error('Redis connection refused');
      },
      async expire() {
        // no-op
      },
    };
    const middleware = rateLimiter({ redis: brokenRedis });
    const next = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await middleware(makeReq(), makeRes(), next);
    expect(next).toHaveBeenCalledOnce();
    consoleSpy.mockRestore();
  });

  it('accepts a custom keyFn', async () => {
    const keyFn = vi.fn().mockReturnValue('rl:custom-key');
    const middleware = rateLimiter({ redis: mockRedis, keyFn });
    await middleware(makeReq(), makeRes(), vi.fn());
    expect(keyFn).toHaveBeenCalledOnce();
    expect(mockRedis._store.has('rl:custom-key')).toBe(true);
  });
});
