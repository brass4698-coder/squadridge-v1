import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { getMyActiveInviteClaim, queryKeys } from '../lib';

export function useInviteClaim() {
  const { supabase, session } = useAuth();

  return useQuery({
    queryKey: queryKeys.inviteClaim(session?.user?.id),
    queryFn: () => getMyActiveInviteClaim(supabase),
    enabled: !!supabase && !!session?.user?.id,
  });
}
