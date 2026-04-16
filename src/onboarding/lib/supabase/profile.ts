import {
  completeOnboardingProfile as completeOnboardingProfileCore,
  fetchProfile as fetchProfileCore,
  upsertProfilePatch as upsertProfilePatchCore,
  type ProfileRow,
} from '../../../lib/profile';
import { getSupabaseBrowserClient } from './client';

export type { ProfileRow };

async function resolveUserId(): Promise<string | null> {
  const sb = getSupabaseBrowserClient();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

/** Best-effort patch; no-ops without Supabase or session. */
export async function upsertProfilePatch(
  patch: Partial<Omit<ProfileRow, 'id'>>,
): Promise<{ error: Error | null }> {
  const sb = getSupabaseBrowserClient();
  const uid = await resolveUserId();
  return upsertProfilePatchCore(sb, uid, patch);
}

export async function fetchProfile(): Promise<ProfileRow | null> {
  const sb = getSupabaseBrowserClient();
  const uid = await resolveUserId();
  return fetchProfileCore(sb, uid);
}

export async function completeOnboardingProfile(
  row: Partial<Omit<ProfileRow, 'id' | 'onboarding_completed_at'>>,
): Promise<{ error: Error | null }> {
  const sb = getSupabaseBrowserClient();
  const uid = await resolveUserId();
  return completeOnboardingProfileCore(sb, uid, row);
}

export { isSupabaseConfigured } from './client';
