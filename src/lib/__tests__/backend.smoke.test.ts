/**
 * Backend smoke tests against local Supabase (http://127.0.0.1:54321).
 * Run with: `npm run test:smoke` (excluded from default `npm test`).
 *
 * Requires Docker + `npm run supabase:start`. Loads `SUPABASE_URL` /
 * `SUPABASE_ANON_KEY` (and optional `SUPABASE_SERVICE_ROLE_KEY` for cleanup)
 * from `.env.test` via dotenv.
 */
import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

loadDotenv({ path: resolve(process.cwd(), '.env.test') });

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, '') ?? '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const localReady =
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) &&
  (SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('localhost'));

function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function adminClient(): SupabaseClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY required in .env.test for smoke cleanup');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isForbidden(error: { code?: string; message?: string; status?: number } | null): boolean {
  if (!error) return false;
  const status = error.status;
  const code = String(error.code ?? '');
  const msg = (error.message ?? '').toLowerCase();
  return (
    status === 403 ||
    status === 401 ||
    code === '42501' ||
    code === 'PGRST301' ||
    msg.includes('permission denied') ||
    msg.includes('row-level security') ||
    msg.includes('forbidden')
  );
}

describe.skipIf(!localReady)('backend smoke (local Supabase)', () => {
  let supabase: SupabaseClient;
  const smokeEmail = `smoke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  let createdUserId: string | null = null;

  beforeAll(async () => {
    supabase = anonClient();
    // Fail fast if the stack is down (clearer than opaque fetch errors mid-suite).
    const { error } = await supabase.rpc('waitlist_signup_count');
    if (error && /fetch|network|econnrefused/i.test(error.message)) {
      throw new Error(`Local Supabase unreachable at ${SUPABASE_URL}. Run: npm run supabase:start`);
    }
  });

  afterAll(async () => {
    if (createdUserId && SUPABASE_SERVICE_ROLE_KEY) {
      await adminClient().auth.admin.deleteUser(createdUserId);
      createdUserId = null;
    }
  });

  it('allows anon INSERT into waitlist_signups', async () => {
    // No SELECT policy for anon — insert without `.select()` (returning needs SELECT).
    const { error } = await supabase.from('waitlist_signups').insert({ email: smokeEmail });

    expect(error).toBeNull();
  });

  it('rejects anon INSERT into match_queue (expect forbidden / 403-class)', async () => {
    // Table is `match_queue` (not matchmaking_queue). Anon has no INSERT grant.
    const { error } = await supabase.from('match_queue').insert({
      user_id: '00000000-0000-4000-8000-000000000001',
      pool_key: 'smoke',
      side: 'A',
      status: 'waiting',
    });

    expect(error).not.toBeNull();
    expect(isForbidden(error)).toBe(true);
  });

  it('returns no profile rows for an unauthenticated caller', async () => {
    const { data, error } = await supabase.from('profiles').select('id').limit(5);

    expect(error).toBeNull();
    expect(data ?? []).toEqual([]);
  });

  it('waitlist_signup_count (get_waitlist_count) returns a number >= 0', async () => {
    // Shipped RPC name is waitlist_signup_count; get_waitlist_count is an alias when present.
    const primary = await supabase.rpc('waitlist_signup_count');
    expect(primary.error).toBeNull();
    expect(typeof primary.data).toBe('number');
    expect(Number(primary.data)).toBeGreaterThanOrEqual(0);

    const alias = await supabase.rpc('get_waitlist_count');
    if (!alias.error) {
      expect(typeof alias.data).toBe('number');
      expect(Number(alias.data)).toBeGreaterThanOrEqual(0);
    }
  });

  it('signs up a user, auto-creates a profiles row, then deletes the user', async () => {
    const password = `Smoke-${Math.random().toString(36).slice(2)}-Aa1!`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: `user-${smokeEmail}`,
      password,
    });

    expect(signUpError).toBeNull();
    const userId = signUpData.user?.id;
    expect(userId).toBeTruthy();
    createdUserId = userId ?? null;

    // Session client so RLS profiles_select_own applies.
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          Authorization: `Bearer ${signUpData.session?.access_token ?? ''}`,
        },
      },
    });

    // Trigger is AFTER INSERT; allow a brief retry for profile materialization.
    let profileId: string | null = null;
    for (let i = 0; i < 10; i++) {
      const { data: profile } = await userClient
        .from('profiles')
        .select('id')
        .eq('id', userId!)
        .maybeSingle();
      if (profile?.id) {
        profileId = profile.id;
        break;
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    expect(profileId).toBe(userId);

    const admin = adminClient();
    const { error: delError } = await admin.auth.admin.deleteUser(userId!);
    expect(delError).toBeNull();
    createdUserId = null;

    const { data: gone } = await admin
      .from('profiles')
      .select('id')
      .eq('id', userId!)
      .maybeSingle();
    expect(gone).toBeNull();
  });
});
