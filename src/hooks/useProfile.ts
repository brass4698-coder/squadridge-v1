import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchProfile,
  isProfileComplete,
  queryKeys,
  upsertProfile,
  upsertProfilePatch,
  type Profile,
  type ProfileInsert,
} from '../lib';

export function useProfile() {
  const queryClient = useQueryClient();
  const { supabase, session, loading: authLoading } = useAuth();
  const userId = session?.user?.id ?? null;

  const profileQuery = useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: async () => fetchProfile(supabase, userId),
    enabled: !!userId && !!supabase,
  });

  const upsertMutation = useMutation({
    mutationFn: async (patch: Partial<Omit<ProfileInsert, 'id'>>) => {
      if (!userId) throw new Error('Not signed in.');
      const { error } = await upsertProfile(supabase, userId, patch);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Could not save profile.');
    },
  });

  const patchMutation = useMutation({
    mutationFn: async (partial: Partial<Omit<ProfileInsert, 'id'>>) => {
      if (!userId) throw new Error('Not signed in.');
      const { error } = await upsertProfilePatch(supabase, userId, partial);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
    },
    onError: (e: Error) => {
      toast.error(e.message || 'Could not update profile.');
    },
  });

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) });
  }, [queryClient, userId]);

  const upsertFull = useCallback(
    async (patch: Partial<Omit<ProfileInsert, 'id'>>) => {
      if (!userId) return { error: new Error('Not signed in.') };
      try {
        await upsertMutation.mutateAsync(patch);
        return { error: null };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
    },
    [userId, upsertMutation],
  );

  const patch = useCallback(
    async (partial: Partial<Omit<ProfileInsert, 'id'>>) => {
      if (!userId) return { error: new Error('Not signed in.') };
      try {
        await patchMutation.mutateAsync(partial);
        return { error: null };
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }
    },
    [userId, patchMutation],
  );

  const profile = (profileQuery.data ?? null) as Profile | null;
  const loading = authLoading || (!!userId && profileQuery.isPending);
  const complete = useMemo(() => isProfileComplete(profile), [profile]);

  return {
    profile,
    loading,
    error: profileQuery.error instanceof Error ? profileQuery.error : null,
    refetch,
    upsertProfile: upsertFull,
    patchProfile: patch,
    profileComplete: complete,
  };
}
