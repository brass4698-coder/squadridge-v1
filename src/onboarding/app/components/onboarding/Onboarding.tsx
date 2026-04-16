import { useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { completeOnboardingProfile, isSupabaseConfigured } from '../../../lib/supabase/profile';
import { CryptographicBackground } from './CryptographicBackground';
import { OnboardingGlassShell } from './OnboardingGlassShell';
import { OnboardingStepShell } from './OnboardingStepShell';
import { OnboardingChrome } from './OnboardingChrome';
import { OnboardingExitDialog } from './OnboardingExitDialog';
import { OnboardingProvider, useOnboarding } from './OnboardingContext';
import {
  MissionBriefScreen,
  IdentityScreen,
  RulesScreen,
  PlacementScreen,
  VerificationScreen,
  RoomSimulationScreen,
  CommitmentScreen,
} from './screens';

const TOTAL_STEPS = 7;

const ONBOARDING_DONE_KEY = 'sr_onboarding_complete';

function OnboardingInner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { draft } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(1);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const goNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleConfirmExit = () => {
    navigate('/', { replace: true });
  };

  const handleEnterSquads = async () => {
    try {
      const { error } = await completeOnboardingProfile({
        callsign: draft.callsign.trim() || undefined,
        role_archetype: draft.roleArchetype === '' ? null : draft.roleArchetype,
        role_other_detail:
          draft.roleArchetype === 'other' ? draft.roleOtherDetail.trim() : null,
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

  const progressPercent = (currentStep / TOTAL_STEPS) * 100;
  const shellClass =
    currentStep === 7 ? 'max-w-3xl' : currentStep === 4 || currentStep === 6 ? 'max-w-2xl' : undefined;

  return (
    <div className="relative min-h-screen overflow-hidden bg-onboarding-bg text-white">
      <CryptographicBackground />

      <div className="fixed inset-0 opacity-25">
        <div className="absolute top-0 right-0 h-[min(800px,100vh)] w-[min(800px,100vw)] rounded-full bg-onboarding-accent/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-[#1a2332]/35 blur-[100px]" />
      </div>

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n1'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.4' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n1)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Vault seam — subtle horizontal pulse on step change */}
      <motion.div
        key={currentStep}
        className="pointer-events-none fixed top-[52px] right-0 left-0 z-[5] h-px origin-center bg-gradient-to-r from-transparent via-onboarding-accent/35 to-transparent sm:top-[56px]"
        initial={{ opacity: 0, scaleX: 0.2 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />

      <OnboardingExitDialog
        open={exitDialogOpen}
        onOpenChange={setExitDialogOpen}
        onConfirmExit={handleConfirmExit}
      />

      <OnboardingChrome progressPercent={progressPercent} onExitRequest={() => setExitDialogOpen(true)} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 pt-[5.25rem] pb-16 sm:px-6 sm:pt-[5.5rem] sm:pb-20">
        <OnboardingGlassShell className={shellClass}>
          <OnboardingStepShell
            className={
              currentStep === 1
                ? 'pt-11 !pb-10 pl-8 !pr-7 sm:pt-14 sm:!pb-11 sm:pl-11 sm:!pr-10'
                : undefined
            }
          >
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <MissionBriefScreen key="s1" onProceed={goNext} onDecline={handleConfirmExit} />
              )}
              {currentStep === 2 && <IdentityScreen key="s2" onNext={goNext} onBack={goBack} />}
              {currentStep === 3 && <RulesScreen key="s3" onNext={goNext} onBack={goBack} />}
              {currentStep === 4 && <PlacementScreen key="s4" onNext={goNext} onBack={goBack} />}
              {currentStep === 5 && <VerificationScreen key="s5" onNext={goNext} onBack={goBack} />}
              {currentStep === 6 && <RoomSimulationScreen key="s6" onNext={goNext} onBack={goBack} />}
              {currentStep === 7 && (
                <CommitmentScreen key="s7" onEnter={handleEnterSquads} onBack={goBack} />
              )}
            </AnimatePresence>
          </OnboardingStepShell>
        </OnboardingGlassShell>
      </div>
    </div>
  );
}

export function Onboarding() {
  return (
    <OnboardingProvider>
      <OnboardingInner />
    </OnboardingProvider>
  );
}

export { ONBOARDING_DONE_KEY };
