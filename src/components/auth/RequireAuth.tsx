import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks';
import { SessionPageAuthSkeleton } from '../session/SessionPageSkeleton';

type RequireAuthProps = {
  children: ReactNode;
  /** When true, incomplete profiles are sent to profile settings with return path. */
  requireCompleteProfile?: boolean;
};

/**
 * Guards routes that need a Supabase session. Optionally enforces a minimal pseudonymous profile
 * (callsign + role, and role detail when role is `other`).
 *
 * Loading affordance: when guarding a session-bound route we render the same
 * skeleton shape as the destination (`SessionPageAuthSkeleton`), so the visual
 * transition into the session room does not flash bare text. Other guarded
 * routes get a lightweight pulsing placeholder.
 */
export function RequireAuth({ children, requireCompleteProfile }: RequireAuthProps) {
  const { session, loading: authLoading } = useAuth();
  const { loading: profileLoading, profileComplete } = useProfile();
  const location = useLocation();

  if (authLoading || (session && requireCompleteProfile && profileLoading)) {
    if (requireCompleteProfile) {
      return <SessionPageAuthSkeleton />;
    }
    return (
      <div
        className="mx-auto flex min-h-[40vh] w-full max-w-copy flex-col items-stretch justify-center gap-3 px-gutter py-12"
        aria-busy="true"
        aria-label="Checking session"
      >
        <span className="sr-only">Checking your session…</span>
        <div className="h-6 w-40 animate-pulse rounded-md bg-[#1a2236]/80" />
        <div className="h-3 w-64 animate-pulse rounded bg-[#1a2236]/55" />
        <div className="h-3 w-48 animate-pulse rounded bg-[#1a2236]/40" />
      </div>
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
