import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks';
import { BrandPresenceLoader } from '../ui/BrandPresenceLoader';

type RequireAuthProps = {
  children: ReactNode;
  /** When true, incomplete profiles are sent to profile settings with return path. */
  requireCompleteProfile?: boolean;
};

/**
 * Guards routes that need a Supabase session. Optionally enforces a minimal pseudonymous profile
 * (callsign + role, and role detail when role is `other`).
 */
export function RequireAuth({ children, requireCompleteProfile }: RequireAuthProps) {
  const { session, loading: authLoading } = useAuth();
  const { loading: profileLoading, profileComplete } = useProfile();
  const location = useLocation();

  if (authLoading || (session && requireCompleteProfile && profileLoading)) {
    return (
      <BrandPresenceLoader variant="compact" label="Loading…" phrase="Opening your workspace" />
    );
  }

  if (!session) {
    const next = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/sign-in?next=${next}`} replace />;
  }

  if (requireCompleteProfile && !profileComplete) {
    const next = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/settings/profile?next=${next}`} replace />;
  }

  return <>{children}</>;
}
