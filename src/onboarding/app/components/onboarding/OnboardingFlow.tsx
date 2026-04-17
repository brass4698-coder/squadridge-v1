import { useLayoutEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDemoWalkthrough } from '../../../../demo/DemoWalkthroughContext';
import { useOnboarding } from './OnboardingContext';
import { OnboardingExitDialog } from './OnboardingExitDialog';
import { MissionStep } from './steps/MissionStep';
import { IdentityStep } from './steps/IdentityStep';
import { PlacementStep } from './steps/PlacementStep';
import { RulesStep } from './steps/RulesStep';
import { VerificationStep } from './steps/VerificationStep';
import { DryRunStep } from './steps/DryRunStep';

const STEPS = [
  { id: 'mission', Component: MissionStep, nextLabel: 'Next' },
  { id: 'identity', Component: IdentityStep, nextLabel: 'Next' },
  { id: 'placement', Component: PlacementStep, nextLabel: 'Next' },
  { id: 'rules', Component: RulesStep, nextLabel: 'I accept' },
  { id: 'verification', Component: VerificationStep, nextLabel: 'Next' },
  { id: 'dryrun', Component: DryRunStep, nextLabel: 'Enter squad room' },
] as const;

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const { exitDemo } = useDemoWalkthrough();
  const [searchParams, setSearchParams] = useSearchParams();
  const demoTour = searchParams.get('demo') === '1';
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const owtRaw = searchParams.get('owt');
  const owtParsed = owtRaw != null ? parseInt(owtRaw, 10) : NaN;
  const indexFromTour =
    demoTour && !Number.isNaN(owtParsed) && owtParsed >= 0 && owtParsed < STEPS.length ? owtParsed : null;

  const [localIndex, setLocalIndex] = useState(0);
  const index = indexFromTour !== null ? indexFromTour : localIndex;

  const { draft } = useOnboarding();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [index]);

  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;
  const { Component, nextLabel } = STEPS[index];

  const goBack = () => {
    if (isFirst) return;
    if (demoTour) {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set('demo', '1');
          p.set('owt', String(index - 1));
          return p;
        },
        { replace: true },
      );
    } else {
      setLocalIndex((i) => i - 1);
    }
  };

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    if (demoTour) {
      setSearchParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set('demo', '1');
          p.set('owt', String(index + 1));
          return p;
        },
        { replace: true },
      );
    } else {
      setLocalIndex((i) => i + 1);
    }
  };

  const nextDisabled = STEPS[index].id === 'rules' && !draft.rulesAccepted;

  const confirmExit = () => {
    setExitDialogOpen(false);
    if (demoTour) exitDemo();
    else navigate('/', { replace: true });
  };

  return (
    <>
      <div
        className={
          demoTour
            ? 'fixed right-5 top-14 z-[60] sm:right-8 sm:top-14'
            : 'fixed right-5 top-5 z-[60] sm:right-8 sm:top-6'
        }
      >
        <button
          type="button"
          onClick={() => setExitDialogOpen(true)}
          className="rounded-lg border border-white/[0.08] bg-onboarding-bg/80 px-3 py-2 text-[0.8125rem] font-medium text-ink-muted shadow-sm backdrop-blur-sm transition-colors hover:border-teal/30 hover:text-ink"
        >
          Exit
        </button>
      </div>
      <Component
        onBack={isFirst ? undefined : goBack}
        onNext={goNext}
        nextLabel={nextLabel}
        nextDisabled={nextDisabled}
      />
      <OnboardingExitDialog
        open={exitDialogOpen}
        onOpenChange={setExitDialogOpen}
        onConfirmExit={confirmExit}
      />
    </>
  );
}
