/**
 * @vitest-environment node
 *
 * rateLimiter.test.ts — unit tests for the Redis-backed rate limiter middleware
 *
 * Test strategy:
 *   - Uses the in-memory MemoryRedis mock so tests run without a real Redis
 *     instance. This is the intended approach for CI.
 *   - Tests the 429 behaviour: requests beyond the limit get a 429 with
 *     Retry-After and X-RateLimit-* headers.
 *   - Tests the pass-through behaviour: requests within the limit are forwarded
 *     to next() with X-RateLimit headers set.
 *   - Tests the failOpen behaviour when the Redis store throws.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeRateLimiter, MemoryRedis } from '../../src/middleware/rateLimiter';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeReq(anonIp = 'abc123') {
  return {
    headers: {
      'x-anon-ip': anonIp,
    } as Record<string, string | string[] | undefined>,
  };
}

function makeRes() {
  const headers: Record<string, string | number> = {};
  let statusCode = 200;
  let jsonBody: unknown;
  let headersSent = false;

  const res = {
    headers,
    get statusCode() {
      return statusCode;
    },
    get jsonBody() {
      return jsonBody;
    },
    get headersSent() {
      return headersSent;
    },
    setHeader(name: string, value: string | number) {
      headers[name.toLowerCase()] = value;
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(body: unknown) {
      jsonBody = body;
      headersSent = true;
      return res;
    },
  };
  return res;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('makeRateLimiter (with MemoryRedis)', () => {
  let redis: MemoryRedis;

  beforeEach(() => {
    redis = new MemoryRedis();
  });

  it('calls next() for the first request within the limit', async () => {
    const mw = makeRateLimiter({ redis, maxRequests: 5, windowSeconds: 60 });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(200);
  });

  it('sets X-RateLimit-Limit and X-RateLimit-Remaining headers on passing requests', async () => {
    const mw = makeRateLimiter({ redis, maxRequests: 10, windowSeconds: 60 });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(res.headers['x-ratelimit-limit']).toBe(10);
    expect(res.headers['x-ratelimit-remaining']).toBe(9);
  });

  it('increments the counter across multiple requests from the same key', async () => {
    const mw = makeRateLimiter({ redis, maxRequests: 5, windowSeconds: 60 });
    const next = vi.fn();

    for (let i = 0; i < 5; i++) {
      const req = makeReq('same-ip-key');
      const res = makeRes();
      await mw(req, res, next);
      expect(next).toHaveBeenCalledTimes(i + 1);
    }
  });

  it('returns 429 when the request count exceeds maxRequests', async () => {
    const mw = makeRateLimiter({ redis, maxRequests: 3, windowSeconds: 60 });
    const next = vi.fn();

    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      await mw(makeReq('blocked-ip'), makeRes(), vi.fn());
    }

    // 4th request should be rejected
    const req = makeReq('blocked-ip');
    const res = makeRes();
    await mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(429);
  });

  it('sets Retry-After header on 429 response', async () => {
    const mw = makeRateLimiter({ redis, maxRequests: 1, windowSeconds: 30 });

    // Use up the limit
    await mw(makeReq('retry-test'), makeRes(), vi.fn());

    // Second request should 429
    const req = makeReq('retry-test');
    const res = makeRes();
    await mw(req, res, vi.fn());

    expect(res.statusCode).toBe(429);
    expect(res.headers['retry-after']).toBe('30');
  });

  it('different keys have independent counters', async () => {
    const mw = makeRateLimiter({ redis, maxRequests: 2, windowSeconds: 60 });
    const nextA = vi.fn();
    const nextB = vi.fn();

    // Key A: 2 requests (at limit)
    await mw(makeReq('key-A'), makeRes(), nextA);
    await mw(makeReq('key-A'), makeRes(), nextA);
    // Key B: 1 request (well within limit)
    await mw(makeReq('key-B'), makeRes(), nextB);

    expect(nextA).toHaveBeenCalledTimes(2);
    expect(nextB).toHaveBeenCalledTimes(1);

    // Key A: 3rd request → 429
    const resA3 = makeRes();
    await mw(makeReq('key-A'), resA3, vi.fn());
    expect(resA3.statusCode).toBe(429);

    // Key B: 2nd request → still within limit
    const resB2 = makeRes();
    await mw(makeReq('key-B'), resB2, nextB);
    expect(resB2.statusCode).toBe(200);
    expect(nextB).toHaveBeenCalledTimes(2);
  });

  it('uses __unknown__ key when x-anon-ip header is missing', async () => {
    const mw = makeRateLimiter({ redis, maxRequests: 2, windowSeconds: 60 });
    const req = { headers: {} as Record<string, string | undefined> };
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it('calls next() and does NOT 429 when failOpen=true and Redis throws', async () => {
    const brokenRedis = {
      incr: vi.fn().mockRejectedValue(new Error('Redis connection refused')),
      expire: vi.fn(),
    };
    const mw = makeRateLimiter({
      redis: brokenRedis,
      maxRequests: 5,
      windowSeconds: 60,
      failOpen: true,
    });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(200);
  });

  it('returns 503 and does NOT call next() when failOpen=false and Redis throws', async () => {
    const brokenRedis = {
      incr: vi.fn().mockRejectedValue(new Error('Redis connection refused')),
      expire: vi.fn(),
    };
    const mw = makeRateLimiter({
      redis: brokenRedis,
      maxRequests: 5,
      windowSeconds: 60,
      failOpen: false,
    });
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await mw(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(503);
  });

  it('MemoryRedis._count() reflects increments correctly', async () => {
    await redis.incr('test-key');
    await redis.incr('test-key');
    await redis.expire('test-key', 60);

    expect(redis._count('test-key')).toBe(2);
  });

  it('MemoryRedis._flush() resets all counters', async () => {
    await redis.incr('flush-key');
    redis._flush();

    expect(redis._count('flush-key')).toBe(0);
  });
});
