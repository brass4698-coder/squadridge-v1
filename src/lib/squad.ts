import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const LAST_SQUAD_KEY = 'squadridge_last_squad_id';

export function getLastSquadIdFromStorage(): string | null {
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

export async function ensureAnonymousSession(
  supabase: SupabaseClient<Database>,
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return;
  // TODO(ZK): Prefer authenticated magic-link sessions for production rooms; anonymous sign-in remains a dev/low-friction fallback.
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
}

export async function createDemoSquad(supabase: SupabaseClient<Database>): Promise<string> {
  await ensureAnonymousSession(supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Client-chosen id avoids SELECT after INSERT: RLS only allows squads SELECT for members,
  // and membership row does not exist until the next insert.
  const squadId = crypto.randomUUID();

  const expires = new Date();
  expires.setDate(expires.getDate() + 1);

  const { error: squadError } = await supabase.from('squads').insert({
    id: squadId,
    topic: 'Demo dialogue',
    status: 'active',
    expires_at: expires.toISOString(),
  });

  if (squadError) throw squadError;

  const { error: memberError } = await supabase.from('squad_members').insert({
    squad_id: squadId,
    user_id: user.id,
  });

  if (memberError) throw memberError;

  setLastSquadIdInStorage(squadId);
  return squadId;
}
