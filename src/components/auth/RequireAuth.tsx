import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks';
import { RouteSkeleton } from '../system/RouteSkeleton';

type RequireAuthProps = {
  children: ReactNode;
  requireCompleteProfile?: boolean;
};

export function RequireAuth({ children, requireCompleteProfile }: RequireAuthProps) {
  const { session, loading: authLoading } = useAuth();
  const { loading: profileLoading, profileComplete } = useProfile();
  const location = useLocation();

  if (authLoading || (session && requireCompleteProfile && profileLoading)) {
    return <RouteSkeleton label="Checking session" />;
  }

  if (!session) {
    const next = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/sign-in?next=${next}`} replace />;
  }

  if (requireCompleteProfile && !profileComplete) {
    const next = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/app/settings/profile?next=${next}`} replace />;
  }

  return <>{children}</>;
}
