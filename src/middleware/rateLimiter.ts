/**
 * Rate limiter middleware — client-side abstraction.
 *
 * This module provides a typed, environment-configurable interface over the
 * Upstash Redis-backed rate-limit Edge Function (supabase/functions/rate-limit).
 *
 * The Edge Function enforces the actual limits server-side; this client layer:
 *  - Provides a consistent `RateLimitResult` interface.
 *  - Supports environment overrides for window size and per-window cap.
 *  - Allows callers to fail-open or fail-closed via `failOpen` option.
 *  - Wraps `src/lib/rateLimitEdge.ts` with richer error typing.
 *
 * Environment variables (set in .env / secret manager):
 *  - VITE_ENABLE_EDGE_RATE_LIMIT  — set to "false" to disable (e.g. local dev).
 *  - VITE_RATE_LIMIT_WINDOW_SEC   — override window size in seconds (default: 60).
 *  - VITE_RATE_LIMIT_MAX_REQUESTS — override max requests per window (default: 10).
 *
 * Usage:
 *
 *   const result = await checkRateLimit(supabase, 'matchmaking');
 *   if (!result.allowed) {
 *     throw new Error(`Rate limited. Retry in ${result.retryAfterSeconds}s`);
 *   }
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

// ── Configuration ─────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  /** Sliding-window size in seconds. Default: 60. */
  windowSec: number;
  /** Maximum requests allowed per window per (user, action) key. Default: 10. */
  maxPerWindow: number;
  /**
   * When true, a 503 (Redis unavailable) or network error is treated as "allowed"
   * so messaging/matchmaking still works without Redis.
   * Default: true (fail open) — set false for strict enforcement.
   */
  failOpen: boolean;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowSec: (() => {
    const raw =
      typeof import.meta !== 'undefined'
        ? (import.meta.env?.VITE_RATE_LIMIT_WINDOW_SEC as string | undefined)
        : undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 60;
  })(),
  maxPerWindow: (() => {
    const raw =
      typeof import.meta !== 'undefined'
        ? (import.meta.env?.VITE_RATE_LIMIT_MAX_REQUESTS as string | undefined)
        : undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 10;
  })(),
  failOpen: true,
};

// ── Result types ──────────────────────────────────────────────────────────────

export type RateLimitResultAllowed = {
  allowed: true;
};

export type RateLimitResultDenied = {
  allowed: false;
  /** Seconds until the rate-limit window resets (from Retry-After header). */
  retryAfterSeconds: number;
  /** Human-readable reason for display to the user. */
  reason: string;
};

export type RateLimitResultError = {
  allowed: boolean; // depends on `failOpen`
  error: string;
};

export type RateLimitResult = RateLimitResultAllowed | RateLimitResultDenied | RateLimitResultError;

// ── Core function ────────────────────────────────────────────────────────────

/**
 * Checks the server-side rate limit for `(authenticated user, action)`.
 *
 * @param supabase  Authenticated Supabase client (session must have a valid JWT).
 * @param action    Logical action key (e.g. "matchmaking", "message", "mod_action").
 * @param config    Optional overrides for window/limit/failOpen behaviour.
 */
export async function checkRateLimit(
  supabase: SupabaseClient<Database>,
  action: string,
  config: Partial<RateLimitConfig> = {},
): Promise<RateLimitResult> {
  const cfg: RateLimitConfig = { ...DEFAULT_CONFIG, ...config };

  // Feature flag: VITE_ENABLE_EDGE_RATE_LIMIT=false skips entirely.
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_ENABLE_EDGE_RATE_LIMIT === 'false'
  ) {
    return { allowed: true };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    // No authenticated session — treat as allowed (caller should enforce auth separately).
    return { allowed: true };
  }

  const supabaseUrl = (
    typeof import.meta !== 'undefined'
      ? (import.meta.env?.VITE_SUPABASE_URL as string | undefined)
      : undefined
  )?.replace(/\/$/, '');

  const apiKey =
    typeof import.meta !== 'undefined'
      ? ((import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ??
          import.meta.env?.VITE_SUPABASE_ANON_KEY) as string | undefined)
      : undefined;

  if (!supabaseUrl || !apiKey) {
    return cfg.failOpen
      ? { allowed: true }
      : { allowed: false, error: 'Rate limit configuration missing' };
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/rate-limit`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        window_sec: cfg.windowSec,
        max_per_window: cfg.maxPerWindow,
      }),
    });

    if (res.status === 429) {
      const ra = res.headers.get('retry-after');
      const retryAfterSeconds = ra && /^\d+$/.test(ra.trim()) ? Number(ra.trim()) : 60;
      return {
        allowed: false,
        retryAfterSeconds,
        reason: `You're sending requests too quickly. Try again in ${retryAfterSeconds} seconds.`,
      };
    }

    if (res.status === 503) {
      // Redis unavailable
      return cfg.failOpen
        ? { allowed: true }
        : { allowed: false, error: 'Rate limit service unavailable' };
    }

    if (!res.ok) {
      return cfg.failOpen
        ? { allowed: true }
        : { allowed: false, error: `Rate limit check failed (HTTP ${res.status})` };
    }

    return { allowed: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return cfg.failOpen
      ? { allowed: true }
      : { allowed: false, error: `Rate limit network error: ${message}` };
  }
}

/**
 * Asserts that a rate limit check passes, throwing if the user is rate-limited.
 * Convenience wrapper for call sites that prefer exceptions over result objects.
 *
 * @throws Error with a user-facing message when rate-limited.
 */
export async function assertRateLimit(
  supabase: SupabaseClient<Database>,
  action: string,
  config: Partial<RateLimitConfig> = {},
): Promise<void> {
  const result = await checkRateLimit(supabase, action, config);
  if (!result.allowed) {
    const msg =
      'reason' in result
        ? result.reason
        : 'error' in result
          ? result.error
          : 'Rate limit check failed';
    throw new Error(msg);
  }
}
