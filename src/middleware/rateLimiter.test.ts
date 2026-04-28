/**
 * rateLimiter.test.ts
 *
 * Unit tests for src/middleware/rateLimiter.ts
 *
 * We test:
 *  1. Requests below the max are allowed.
 *  2. Exactly at the max is allowed.
 *  3. One over the max returns allowed=false with retryAfterMs set.
 *  4. Counter resets after the window expires.
 *  5. Different keys have independent counters.
 *  6. reset() clears the counter.
 *  7. RedisRateLimitStore scaffold throws a helpful error (not a silent no-op).
 *
 * All tests use InMemoryRateLimitStore — no Redis required.
 */

import { describe, expect, it } from 'vitest';
import { InMemoryRateLimitStore, RedisRateLimitStore, checkRateLimit } from './rateLimiter';

const WINDOW_MS = 60_000; // 1 minute
const MAX = 5;

describe('InMemoryRateLimitStore', () => {
  it('starts at count=1 for a fresh key', async () => {
    const store = new InMemoryRateLimitStore();
    const { count } = await store.increment('key-a', WINDOW_MS);
    expect(count).toBe(1);
  });

  it('increments on each call', async () => {
    const store = new InMemoryRateLimitStore();
    await store.increment('key-a', WINDOW_MS);
    await store.increment('key-a', WINDOW_MS);
    const { count } = await store.increment('key-a', WINDOW_MS);
    expect(count).toBe(3);
  });

  it('returns a positive ttlMs', async () => {
    const store = new InMemoryRateLimitStore();
    const { ttlMs } = await store.increment('key-a', WINDOW_MS);
    expect(ttlMs).toBeGreaterThan(0);
    expect(ttlMs).toBeLessThanOrEqual(WINDOW_MS);
  });

  it('resets the counter after the window expires', async () => {
    const store = new InMemoryRateLimitStore();
    // Use a very short window so we can fake expiry.
    const SHORT_WINDOW = 100; // 100ms
    await store.increment('key-a', SHORT_WINDOW);
    await store.increment('key-a', SHORT_WINDOW);

    // Artificially expire: directly manipulate by resetting and re-adding with a past timestamp.
    // Easiest: wait for the window to expire (100ms is acceptable in tests).
    await new Promise((r) => setTimeout(r, 110));

    const { count } = await store.increment('key-a', SHORT_WINDOW);
    expect(count).toBe(1); // Should restart from 1 after expiry.
  });

  it('tracks different keys independently', async () => {
    const store = new InMemoryRateLimitStore();
    await store.increment('key-a', WINDOW_MS);
    await store.increment('key-a', WINDOW_MS);
    const { count: countA } = await store.increment('key-a', WINDOW_MS);
    const { count: countB } = await store.increment('key-b', WINDOW_MS);
    expect(countA).toBe(3);
    expect(countB).toBe(1);
  });

  it('reset() clears the counter for the given key', async () => {
    const store = new InMemoryRateLimitStore();
    await store.increment('key-a', WINDOW_MS);
    await store.increment('key-a', WINDOW_MS);
    await store.reset('key-a');
    const { count } = await store.increment('key-a', WINDOW_MS);
    expect(count).toBe(1);
  });

  it('reset() does not affect other keys', async () => {
    const store = new InMemoryRateLimitStore();
    await store.increment('key-a', WINDOW_MS);
    await store.increment('key-b', WINDOW_MS);
    await store.increment('key-b', WINDOW_MS);
    await store.reset('key-a');
    const { count: countB } = await store.increment('key-b', WINDOW_MS);
    expect(countB).toBe(3);
  });
});

describe('checkRateLimit', () => {
  it('allows requests below the max', async () => {
    const store = new InMemoryRateLimitStore();
    for (let i = 0; i < MAX - 1; i++) {
      const result = await checkRateLimit(store, 'ip-a', { windowMs: WINDOW_MS, max: MAX });
      expect(result.allowed).toBe(true);
    }
  });

  it('allows the request exactly at the max', async () => {
    const store = new InMemoryRateLimitStore();
    for (let i = 0; i < MAX - 1; i++) {
      await checkRateLimit(store, 'ip-a', { windowMs: WINDOW_MS, max: MAX });
    }
    const result = await checkRateLimit(store, 'ip-a', { windowMs: WINDOW_MS, max: MAX });
    expect(result.allowed).toBe(true);
    expect(result.count).toBe(MAX);
  });

  it('blocks the request one over the max and returns retryAfterMs', async () => {
    const store = new InMemoryRateLimitStore();
    for (let i = 0; i < MAX; i++) {
      await checkRateLimit(store, 'ip-a', { windowMs: WINDOW_MS, max: MAX });
    }
    const result = await checkRateLimit(store, 'ip-a', { windowMs: WINDOW_MS, max: MAX });
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.count).toBe(MAX + 1);
  });

  it('allows requests again after the window resets', async () => {
    const store = new InMemoryRateLimitStore();
    const SHORT_WINDOW = 100;
    for (let i = 0; i < MAX; i++) {
      await checkRateLimit(store, 'ip-a', { windowMs: SHORT_WINDOW, max: MAX });
    }
    // Over the limit
    const blocked = await checkRateLimit(store, 'ip-a', { windowMs: SHORT_WINDOW, max: MAX });
    expect(blocked.allowed).toBe(false);

    // Wait for the window to expire.
    await new Promise((r) => setTimeout(r, 110));

    const allowed = await checkRateLimit(store, 'ip-a', { windowMs: SHORT_WINDOW, max: MAX });
    expect(allowed.allowed).toBe(true);
    expect(allowed.count).toBe(1);
  });

  it('429-equivalent: count is exposed for constructing rate limit response headers', async () => {
    const store = new InMemoryRateLimitStore();
    for (let i = 0; i < MAX; i++) {
      await checkRateLimit(store, 'ip-a', { windowMs: WINDOW_MS, max: MAX });
    }
    const result = await checkRateLimit(store, 'ip-a', { windowMs: WINDOW_MS, max: MAX });
    expect(result.allowed).toBe(false);
    // A server would do:
    // const statusCode = result.allowed ? 200 : 429;
    expect(result.allowed ? 200 : 429).toBe(429);
  });
});

describe('RedisRateLimitStore (scaffold)', () => {
  it('throws a helpful error from increment() since it is not yet implemented', async () => {
    const store = new RedisRateLimitStore(null);
    await expect(store.increment('key', 60_000)).rejects.toThrow('scaffold');
  });

  it('throws a helpful error from reset() since it is not yet implemented', async () => {
    const store = new RedisRateLimitStore(null);
    await expect(store.reset('key')).rejects.toThrow('scaffold');
  });
});
