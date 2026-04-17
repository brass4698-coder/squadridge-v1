import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { completeOnboardingProfile, isSupabaseConfigured } from '../../../lib/supabase/profile';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import { OnboardingFlow } from './OnboardingFlow';

const ONBOARDING_DONE_KEY = 'sr_onboarding_complete';

function OnboardingInner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { draft } = useOnboarding();

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
    const target =
      rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
        ? decodeURIComponent(rawNext)
        : '/intent';
    navigate(target, { replace: true });
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}

export function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingInner />
    </OnboardingProvider>
  );
}

export { ONBOARDING_DONE_KEY };
