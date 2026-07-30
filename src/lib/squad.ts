import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Ensures a Supabase session exists for squad flows. If none, signs in anonymously.
 * Anonymous sessions are a **fallback** for frictionless demos; production rooms should
 * prefer magic-link (email) sessions for durability. See `docs/technical/auth-and-sessions.md`.
 */

export const LAST_SQUAD_KEY = 'mendguild_last_squad_id';

export function getLastSquadIdFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(LAST_SQUAD_KEY);
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

export function setLastSquadIdInStorage(squadId: string): void {
  try {
    localStorage.setItem(LAST_SQUAD_KEY, squadId);
  } catch {
    /* ignore */
  }
}

export async function ensureAnonymousSession(supabase: SupabaseClient<Database>): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return;
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
}

/**
 * Creates a demo squad and the caller's membership row atomically via the
 * `create_demo_squad` RPC (migration `20260428220000`). The RPC is `SECURITY DEFINER`
 * and runs both inserts in a single transaction, so a failure on the membership row
 * rolls back the squad — replacing the previous brittle two-INSERT client flow.
 *
 * `message_encryption_key` is omitted from the insert; the server-side trigger
 * `squads_set_default_message_encryption_key` (migration `20260417150000`) generates
 * one with `pgcrypto.gen_random_bytes(32)`. See `docs/security/secrets-rotation.md`.
 */
export async function createDemoSquad(supabase: SupabaseClient<Database>): Promise<string> {
  await ensureAnonymousSession(supabase);

  const { data, error } = await supabase.rpc('create_demo_squad');
  if (error) throw error;
  if (!data || typeof data !== 'string') {
    throw new Error('create_demo_squad RPC returned no squad id');
  }

  setLastSquadIdInStorage(data);
  return data;
}
