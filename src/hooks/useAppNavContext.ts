import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from './useProfile';
import { getLastSquadIdFromStorage } from '../lib';

export type AppNavContextValue = {
  /** Last squad id from localStorage (for resume). */
  resumeSquadId: string | null;
  /** Link to `/session/:id` when resume applies. */
  resumeHref: string | null;
  /** Show “Resume your room” when user has a stored squad and is not already on that room. */
  showResumeCta: boolean;
  /** Signed-in user with incomplete profile; suggest completing profile. */
  showOnboardingCta: boolean;
  onboardingHref: '/onboarding';
  onboardingLabel: string;
};

/**
 * Journey hints for global nav (resume session, complete profile). Re-reads last-squad storage on route changes.
 */
export function useAppNavContext(): AppNavContextValue {
  const { pathname } = useLocation();
  const { session } = useAuth();
  const { profileComplete, loading: profileLoading } = useProfile();

  const resumeSquadId = useMemo(() => getLastSquadIdFromStorage(), [pathname]);

  const resumeHref = resumeSquadId ? `/session/${resumeSquadId}` : null;

  const onThatSession =
    !!resumeSquadId &&
    (pathname === `/session/${resumeSquadId}` || pathname.startsWith(`/session/${resumeSquadId}/`));

  const showResumeCta = Boolean(resumeSquadId && !onThatSession);

  const showOnboardingCta =
    Boolean(session) &&
    !profileLoading &&
    !profileComplete &&
    !pathname.startsWith('/settings/profile') &&
    !pathname.startsWith('/onboarding');

  return {
    resumeSquadId,
    resumeHref,
    showResumeCta,
    showOnboardingCta,
    onboardingHref: '/onboarding',
    onboardingLabel: 'Complete your profile',
  };
}
