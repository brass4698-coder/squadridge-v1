/**
 * Unit tests for the rate-limiter middleware.
 *
 * We mock the Supabase client and the global `fetch` to avoid network calls.
 * Tests verify:
 *  - Correct pass-through when rate limit is satisfied (HTTP 200).
 *  - Correct denial with retryAfterSeconds when HTTP 429.
 *  - Fail-open behaviour on 503 (Redis unavailable).
 *  - Fail-closed option on 503.
 *  - No-op (allowed) when VITE_ENABLE_EDGE_RATE_LIMIT=false.
 *  - No-op (allowed) when no authenticated session.
 *  - assertRateLimit throws on denial.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';
import { assertRateLimit, checkRateLimit } from './rateLimiter';

// ── Helpers ───────────────────────────────────────────────────────────────────

type MockSupabase = {
  auth: {
    getSession: ReturnType<typeof vi.fn>;
  };
};

function makeSupabase(token: string | null): SupabaseClient<Database> {
  const mock: MockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: token ? { access_token: token } : null },
      }),
    },
  };
  return mock as unknown as SupabaseClient<Database>;
}

function mockFetch(status: number, headers: Record<string, string> = {}) {
  return vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ ok: status < 400 }), {
      status,
      headers: new Headers(headers),
    }),
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('checkRateLimit', () => {
  const origEnv = { ...import.meta.env };

  beforeEach(() => {
    // Provide minimal env so the module resolves the Edge Function URL.
    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'test-anon-key';
    import.meta.env.VITE_ENABLE_EDGE_RATE_LIMIT = 'true';
  });

  afterEach(() => {
    Object.assign(import.meta.env, origEnv);
    vi.restoreAllMocks();
  });

  it('returns allowed: true when Edge Function returns 200', async () => {
    vi.stubGlobal('fetch', mockFetch(200));
    const result = await checkRateLimit(makeSupabase('tok'), 'test-action');
    expect(result.allowed).toBe(true);
  });

  it('returns allowed: false with retryAfterSeconds when 429', async () => {
    vi.stubGlobal('fetch', mockFetch(429, { 'retry-after': '30' }));
    const result = await checkRateLimit(makeSupabase('tok'), 'test-action');
    expect(result.allowed).toBe(false);
    if (!result.allowed && 'retryAfterSeconds' in result) {
      expect(result.retryAfterSeconds).toBe(30);
      expect(result.reason).toContain('30');
    }
  });

  it('fails open (allowed) on 503 by default', async () => {
    vi.stubGlobal('fetch', mockFetch(503));
    const result = await checkRateLimit(makeSupabase('tok'), 'test-action');
    expect(result.allowed).toBe(true);
  });

  it('fails closed (denied) on 503 when failOpen: false', async () => {
    vi.stubGlobal('fetch', mockFetch(503));
    const result = await checkRateLimit(makeSupabase('tok'), 'test-action', {
      failOpen: false,
    });
    expect(result.allowed).toBe(false);
  });

  it('fails open on network error by default', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));
    const result = await checkRateLimit(makeSupabase('tok'), 'test-action');
    expect(result.allowed).toBe(true);
  });

  it('returns allowed: true when no session (no token)', async () => {
    const result = await checkRateLimit(makeSupabase(null), 'test-action');
    expect(result.allowed).toBe(true);
  });

  it('returns allowed: true when VITE_ENABLE_EDGE_RATE_LIMIT=false', async () => {
    import.meta.env.VITE_ENABLE_EDGE_RATE_LIMIT = 'false';
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const result = await checkRateLimit(makeSupabase('tok'), 'test-action');
    expect(result.allowed).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('uses Retry-After header value of 60 when header is missing on 429', async () => {
    vi.stubGlobal('fetch', mockFetch(429));
    const result = await checkRateLimit(makeSupabase('tok'), 'test-action');
    expect(result.allowed).toBe(false);
    if (!result.allowed && 'retryAfterSeconds' in result) {
      expect(result.retryAfterSeconds).toBe(60);
    }
  });
});

describe('assertRateLimit', () => {
  beforeEach(() => {
    import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'test-anon-key';
    import.meta.env.VITE_ENABLE_EDGE_RATE_LIMIT = 'true';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not throw when allowed', async () => {
    vi.stubGlobal('fetch', mockFetch(200));
    await expect(assertRateLimit(makeSupabase('tok'), 'action')).resolves.toBeUndefined();
  });

  it('throws with user-facing message when rate-limited', async () => {
    vi.stubGlobal('fetch', mockFetch(429, { 'retry-after': '45' }));
    await expect(assertRateLimit(makeSupabase('tok'), 'action')).rejects.toThrow(/45/);
  });
});
