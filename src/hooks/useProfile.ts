import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchProfile,
  isProfileComplete,
  upsertProfile,
  upsertProfilePatch,
  type Profile,
  type ProfileInsert,
} from '../lib/profile';

export function useProfile() {
  const { supabase, session, loading: authLoading } = useAuth();
  const userId = session?.user?.id ?? null;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const row = await fetchProfile(supabase, userId);
    setProfile(row);
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const upsertFull = useCallback(
    async (patch: Partial<Omit<ProfileInsert, 'id'>>) => {
      if (!userId) return { error: new Error('Not signed in.') };
      const { error: err } = await upsertProfile(supabase, userId, patch);
      if (!err) await refetch();
      return { error: err };
    },
    [refetch, supabase, userId],
  );

  const patch = useCallback(
    async (partial: Partial<Omit<ProfileInsert, 'id'>>) => {
      if (!userId) return { error: new Error('Not signed in.') };
      const { error: err } = await upsertProfilePatch(supabase, userId, partial);
      if (!err) await refetch();
      return { error: err };
    },
    [refetch, supabase, userId],
  );

  const complete = useMemo(() => isProfileComplete(profile), [profile]);

  return {
    profile,
    loading: authLoading || loading,
    error,
    refetch,
    upsertProfile: upsertFull,
    patchProfile: patch,
    profileComplete: complete,
  };
}
