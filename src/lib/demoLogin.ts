// ============================================================
// Demo login (Phase 5)
//
// Uses `supabase.auth.signInWithPassword` against a pre-seeded demo account.
// The account itself is created out-of-band via `scripts/seedDemo.mjs`
// (needs SERVICE_ROLE_KEY, must NOT be committed to git — see README) or
// via the Supabase dashboard.
//
// Credentials live in Vite env vars so the demo password isn't hardcoded in
// source and can be rotated without a code change:
//   VITE_DEMO_EMAIL      = demo@squadridge.com   (default)
//   VITE_DEMO_PASSWORD   = SquadRidgeDemo2026!   (default — override for prod)
//
// Consumers use `isDemoUser(session)` to detect the demo session and show
// the persistent DemoBanner.
// ============================================================
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { logError, safeErrorMessage } from './log';

/** Canonical email for the demo account. Overridable via `VITE_DEMO_EMAIL`. */
export const DEMO_EMAIL: string =
  (import.meta.env.VITE_DEMO_EMAIL as string | undefined)?.trim() || 'demo@squadridge.com';

/** Default password in bundle — never enable demo login in production without explicit override. */
export const DEMO_PASSWORD: string =
  (import.meta.env.VITE_DEMO_PASSWORD as string | undefined) || 'SquadRidgeDemo2026!';

/**
 * Demo password login is disabled in production builds unless
 * VITE_ENABLE_DEMO_LOGIN=true (internal staging only).
 */
export function isDemoLoginEnabled(): boolean {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';
  }
  return import.meta.env.VITE_ENABLE_DEMO_LOGIN !== 'false';
}

/**
 * Sign the browser in as the demo user. Returns `{ ok: true }` on success or
 * `{ ok: false, error }` on failure — callers should show `error` inline.
 */
export async function signInWithDemo(): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (error) {
    logError('demo.signin_failed', {
      feature: 'demo_login',
      error_message: safeErrorMessage(error),
    });
    // The most common cause is that the demo user hasn't been seeded yet.
    // Point the operator at the runbook instead of a raw Postgres message.
    if (/invalid login credentials/i.test(error.message)) {
      return {
        ok: false,
        error:
          'Demo account not available. Ask the operator to run `scripts/seedDemo.mjs` (see README) or create the demo user in the Supabase dashboard.',
      };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * True when `session` belongs to the demo user (matches on lowercased email).
 * Safe to call with a null / undefined session.
 */
export function isDemoUser(session: Session | null | undefined): boolean {
  const email = session?.user?.email?.toLowerCase() ?? '';
  return email === DEMO_EMAIL.toLowerCase();
}
