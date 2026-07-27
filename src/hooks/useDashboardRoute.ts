// ============================================================
// useDashboardRoute — computes the correct dashboard URL
// ============================================================
import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { resolvePostAuthPath } from '../lib/postAuthRouting';

export function useDashboardRoute(): string {
  const { session, profile, roles } = useAuthContext();

  return useMemo(() => resolvePostAuthPath({ session, profile, roles }), [session, profile, roles]);
}
