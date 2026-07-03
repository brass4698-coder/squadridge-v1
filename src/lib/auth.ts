// ============================================================
// SquadRidge Auth helpers
// ============================================================
import { supabase } from './supabase';
import type { Profile } from '../types/auth';
import { logError, safeErrorMessage } from './log';

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    logError('auth.fetch_profile_failed', {
      feature: 'auth',
      error_message: safeErrorMessage(error),
    });
    return null;
  }
  return data as Profile;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
