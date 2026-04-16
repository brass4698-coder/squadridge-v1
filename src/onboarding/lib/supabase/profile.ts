import { getSupabaseBrowserClient, isSupabaseConfigured } from './client';

export type ProfileRow = {
  id: string;
  callsign: string | null;
  role_archetype: string | null;
  /** Set when role_archetype is `other` (max 100 chars in DB). */
  role_other_detail: string | null;
  era_affiliation: string | null;
  language: string | null;
  region_hint: string | null;
  timezone_window: string | null;
  onboarding_completed_at: string | null;
  updated_at?: string;
};

async function userId(): Promise<string | null> {
  const sb = getSupabaseBrowserClient();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

/** Best-effort patch; no-ops without Supabase or session. */
export async function upsertProfilePatch(patch: Partial<Omit<ProfileRow, 'id'>>): Promise<{ error: Error | null }> {
  const sb = getSupabaseBrowserClient();
  const uid = await userId();
  if (!sb || !uid) return { error: null };

  const row = Object.fromEntries(
    Object.entries({ id: uid, ...patch, updated_at: new Date().toISOString() }).filter(
      ([, v]) => v !== undefined,
    ),
  ) as Record<string, unknown>;

  const { error } = await sb.from('profiles').upsert(row, { onConflict: 'id' });

  return { error: error ? new Error(error.message) : null };
}

export async function fetchProfile(): Promise<ProfileRow | null> {
  const sb = getSupabaseBrowserClient();
  const uid = await userId();
  if (!sb || !uid) return null;

  const { data, error } = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();
  if (error || !data) return null;
  return data as ProfileRow;
}

export async function completeOnboardingProfile(
  row: Omit<Partial<ProfileRow>, 'id' | 'onboarding_completed_at'>,
): Promise<{ error: Error | null }> {
  return upsertProfilePatch({
    ...row,
    onboarding_completed_at: new Date().toISOString(),
  });
}

export { isSupabaseConfigured };
