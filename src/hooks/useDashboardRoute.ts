// ============================================================
// useDashboardRoute — computes the correct dashboard URL
// ============================================================
import { useMemo } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { resolveLocalDashboard } from '../lib/dashboardRouting';

export function useDashboardRoute(): string {
  const { profile, roles } = useAuthContext();

  return useMemo(() => {
    if (!profile) return '/sign-in';
    if (profile.status === 'pending') return '/access-pending';
    if (profile.last_dashboard) return profile.last_dashboard;
    return resolveLocalDashboard(roles);
  }, [profile, roles]);
}
