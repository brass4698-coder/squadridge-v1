import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_WALKTHROUGH_STORAGE_KEY } from '../../demo/demoScript';
import { useProfile } from '../../hooks';
import { demoSignInPath, isDemoLoginEnabled } from '../../lib/demoLogin';
import { RouteSkeleton } from '../system/RouteSkeleton';

type RequireAuthProps = {
  children: ReactNode;
  requireCompleteProfile?: boolean;
};

function isDemoTourActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(DEMO_WALKTHROUGH_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function RequireAuth({ children, requireCompleteProfile }: RequireAuthProps) {
  const { session, loading: authLoading } = useAuth();
  const { loading: profileLoading, profileComplete } = useProfile();
  const location = useLocation();

  if (authLoading || (session && requireCompleteProfile && profileLoading)) {
    return <RouteSkeleton label="Checking session" />;
  }

  if (!session) {
    const next = `${location.pathname}${location.search}${location.hash}`;
    // Mid-tour visits to /app/* should resume via demo login in local/staging —
    // not a bare magic-link form that cannot succeed without an invite.
    if (isDemoLoginEnabled() && isDemoTourActive()) {
      return <Navigate to={demoSignInPath(next)} replace />;
    }
    return <Navigate to={`/sign-in?next=${encodeURIComponent(next)}`} replace />;
  }

  if (requireCompleteProfile && !profileComplete) {
    const next = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/app/settings/profile?next=${next}`} replace />;
  }

  return <>{children}</>;
}
