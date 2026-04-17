import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { queryKeys } from '../lib';

export function useIsModerator() {
  const { supabase, session } = useAuth();
  const userId = session?.user?.id ?? null;

  return useQuery({
    queryKey: queryKeys.moderator(userId),
    queryFn: async () => {
      if (!supabase || !userId) return false;
      const { data, error } = await supabase
        .from('moderators')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data != null;
    },
    enabled: !!supabase && !!userId,
  });
}
