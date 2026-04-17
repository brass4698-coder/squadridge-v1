import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { queryKeys, type Database } from '../lib';

export type SquadPeerProfileRow =
  Database['public']['Functions']['get_squad_peer_profiles']['Returns'][number];

export function useSquadPeerProfiles(squadId: string | undefined) {
  const { supabase } = useAuth();

  return useQuery({
    queryKey: queryKeys.squadPeerProfiles(squadId),
    queryFn: async (): Promise<SquadPeerProfileRow[]> => {
      if (!supabase || !squadId) return [];
      const { data, error } = await supabase.rpc('get_squad_peer_profiles', {
        p_squad_id: squadId,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as SquadPeerProfileRow[];
    },
    enabled: !!supabase && !!squadId,
  });
}
