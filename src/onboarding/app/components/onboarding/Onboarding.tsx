import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { completeOnboardingProfile, isSupabaseConfigured } from '../../../lib/supabase/profile';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import { OnboardingFlow } from './OnboardingFlow';
import { isOnboardingStepId, ONBOARDING_FIRST_STEP } from './onboardingStepsConfig';

const ONBOARDING_DONE_KEY = 'sr_onboarding_complete';

function OnboardingInner() {
  const navigate = useNavigate();
  const { stepId } = useParams<{ stepId: string }>();
  const [searchParams] = useSearchParams();
  const { draft } = useOnboarding();

  if (stepId != null && !isOnboardingStepId(stepId)) {
    return <Navigate to={`/onboarding/${ONBOARDING_FIRST_STEP}`} replace />;
  }

  if (searchParams.get('demo') === '1' && searchParams.get('owt') === null) {
    return <Navigate to={`/onboarding/${ONBOARDING_FIRST_STEP}?demo=1&owt=0`} replace />;
  }

  const handleComplete = async () => {
    try {
      const { error } = await completeOnboardingProfile({
        callsign: draft.callsign.trim() || undefined,
        role_archetype: draft.roleArchetype === '' ? null : draft.roleArchetype,
        role_other_detail: draft.roleArchetype === 'other' ? draft.roleOtherDetail.trim() : null,
        era_affiliation: draft.eraAffiliation === '' ? null : draft.eraAffiliation,
        language: draft.language.trim() || null,
        region_hint: draft.regionHint.trim() || null,
        timezone_window: draft.timezoneWindow.trim() || null,
      });
      if (error) toast.error(error.message);
      else if (isSupabaseConfigured()) toast.success('Profile saved.');
      else toast.message('Onboarding complete. Sign in when connected to sync.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not sync profile.');
    }
    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, '1');
    } catch {
      /* ignore */
    }
    const rawNext = searchParams.get('next');
    const base =
      rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
        ? decodeURIComponent(rawNext)
        : '/find-squad';
    const keepDemo = searchParams.get('demo') === '1';
    const targetUrl = new URL(
      base,
      typeof window !== 'undefined' ? window.location.origin : 'https://mendguild.local',
    );
    if (keepDemo) targetUrl.searchParams.set('demo', '1');
    navigate(`${targetUrl.pathname}${targetUrl.search}`, { replace: true });
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}

/**
 * Onboarding — multi-step education and profile draft; syncs to Supabase when configured.
 * Wrapped by {@link OnboardingProvider}; route is lazy-loaded from `App`.
 */
export function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingInner />
    </OnboardingProvider>
  );
}

export { ONBOARDING_DONE_KEY };
