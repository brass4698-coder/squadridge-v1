import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { queryKeys } from '../lib/queryKeys';
import type { Database } from '../lib/database.types';

export type SquadPeerProfile =
  Database['public']['Functions']['get_squad_peer_profiles']['Returns'][number];

/**
 * Returns pseudonymous peer profiles (callsign, role, tags, region_hint) for all members of a
 * squad. Backed by the `get_squad_peer_profiles` SECURITY DEFINER RPC — caller must be a member;
 * no global directory.
 */
export function useSquadPeerProfiles(squadId: string | undefined) {
  const { supabase, session } = useAuth();

  return useQuery({
    queryKey: queryKeys.squadPeers(squadId),
    queryFn: async (): Promise<SquadPeerProfile[]> => {
      if (!supabase || !squadId) return [];
      const { data, error } = await supabase.rpc('get_squad_peer_profiles', {
        p_squad_id: squadId,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as SquadPeerProfile[];
    },
    enabled: !!supabase && !!squadId && !!session,
  });
}
