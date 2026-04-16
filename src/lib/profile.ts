import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/** DB row — column names match Supabase `profiles` (see migration `20260415120000_profiles_phase1.sql`). */
export type Profile = Database['public']['Tables']['profiles']['Row'];

export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/** @deprecated alias for onboarding imports */
export type ProfileRow = Profile;

/** Min/max trimmed length for `role_other_detail` when `role_archetype === 'other'` (onboarding + `isProfileComplete`). */
export const PROFILE_ROLE_OTHER_MIN_LEN = 8;
export const PROFILE_ROLE_OTHER_MAX_LEN = 80;

/** Product-facing role list (DB `role_archetype`; display name for `field` is practitioner). */
export const PROFILE_ROLE_VALUES = [
  'strategist',
  'analyst',
  'policy',
  'mediator',
  'field',
  'other',
] as const;

export type ProfileRole = (typeof PROFILE_ROLE_VALUES)[number];

export function isProfileComplete(p: Profile | null): boolean {
  if (!p) return false;
  const cs = p.callsign?.trim() ?? '';
  if (cs.length < 2) return false;
  const role = (p.role_archetype ?? '').trim();
  if (!role) return false;
  if (role === 'other') {
    const d = (p.role_other_detail ?? '').trim();
    if (d.length < PROFILE_ROLE_OTHER_MIN_LEN || d.length > PROFILE_ROLE_OTHER_MAX_LEN) return false;
  }
  return true;
}

export async function fetchProfile(
  supabase: SupabaseClient<Database> | null,
  userId: string | null | undefined,
): Promise<Profile | null> {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function upsertProfile(
  supabase: SupabaseClient<Database> | null,
  userId: string,
  patch: Partial<Omit<ProfileInsert, 'id'>>,
): Promise<{ error: Error | null }> {
  if (!supabase) return { error: new Error('Supabase is not configured.') };
  const row: ProfileInsert = {
    id: userId,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
  return { error: error ? new Error(error.message) : null };
}

/** Merge patch; omits undefined keys. */
export async function upsertProfilePatch(
  supabase: SupabaseClient<Database> | null,
  userId: string | null | undefined,
  patch: Partial<Omit<ProfileInsert, 'id'>>,
): Promise<{ error: Error | null }> {
  if (!supabase || !userId) return { error: null };
  const partial = Object.fromEntries(
    Object.entries({ ...patch, updated_at: new Date().toISOString() }).filter(([, v]) => v !== undefined),
  ) as Partial<Omit<ProfileInsert, 'id'>>;
  return upsertProfile(supabase, userId, partial);
}

export async function completeOnboardingProfile(
  supabase: SupabaseClient<Database> | null,
  userId: string | null | undefined,
  row: Partial<Omit<ProfileInsert, 'id' | 'onboarding_completed_at'>>,
): Promise<{ error: Error | null }> {
  return upsertProfilePatch(supabase, userId, {
    ...row,
    onboarding_completed_at: new Date().toISOString(),
  });
}
