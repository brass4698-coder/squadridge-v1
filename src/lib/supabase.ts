/**
 * Canonical Supabase browser client for SquadRidge.
 *
 * Exactly one `createClient` call in the whole app. Do not instantiate your
 * own — import `supabase` (or `getSupabase()` for injection in tests) from
 * here. Two clients in the same tab would hold two auth sessions and diverge
 * on anonymous-to-verified promotion.
 *
 * @see https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabasePublicKey, getSupabaseUrl } from './env';
import type { Database } from './database.types';

const url = getSupabaseUrl() ?? '';
const key = getSupabasePublicKey() ?? '';

/** Typed singleton. Keys may be empty in demo-only builds; callers must guard. */
export const supabase: SupabaseClient<Database> = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Preferred accessor for tests / DI. In production, reading the module-level
 * `supabase` is equivalent. `isSupabaseConfigured` lives in `./env`.
 */
export function getSupabase(): SupabaseClient<Database> {
  return supabase;
}
