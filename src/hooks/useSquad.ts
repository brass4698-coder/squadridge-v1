import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { queryKeys, type Database } from '../lib';

export type SquadRow = Database['public']['Tables']['squads']['Row'];

export function useSquad(squadId: string | undefined) {
  const { supabase } = useAuth();

  return useQuery({
    queryKey: queryKeys.squad(squadId),
    queryFn: async (): Promise<SquadRow | null> => {
      if (!supabase || !squadId) return null;
      const { data, error } = await supabase
        .from('squads')
        .select('*')
        .eq('id', squadId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!supabase && !!squadId,
  });
}
