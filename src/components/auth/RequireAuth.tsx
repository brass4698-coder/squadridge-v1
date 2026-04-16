import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

type RequireAuthProps = {
  children: ReactNode;
  /** When true, incomplete profiles are sent to onboarding with return path. */
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
      <div className="flex min-h-[40vh] items-center justify-center font-sans text-[0.95rem] text-[#8892a4]">
        Loading…
      </div>
    );
  }

  if (!session) {
    const next = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/sign-in?next=${next}`} replace />;
  }

  if (requireCompleteProfile && !profileComplete) {
    const next = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/onboarding?next=${next}`} replace />;
  }

  return <>{children}</>;
}
