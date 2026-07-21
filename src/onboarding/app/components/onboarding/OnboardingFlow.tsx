import type { ReactNode } from 'react';
import { useLayoutEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDemoWalkthrough } from '../../../../demo/DemoWalkthroughContext';
import { useOnboarding } from './OnboardingContext';
import { OnboardingChrome } from './OnboardingChrome';
import { OnboardingExitDialog } from './OnboardingExitDialog';
import { OnboardingShellProvider } from './OnboardingShellContext';
import { isOnboardingStepId, type OnboardingStepId } from './onboardingStepsConfig';
import { MissionStep } from './steps/MissionStep';
import { IdentityStep } from './steps/IdentityStep';
import { PlacementStep } from './steps/PlacementStep';
import { RulesStep } from './steps/RulesStep';
import { VerificationStep } from './steps/VerificationStep';
import { DryRunStep } from './steps/DryRunStep';

const STEPS: readonly {
  id: OnboardingStepId;
  Component: (props: {
    onBack?: () => void;
    onNext: () => void;
    nextLabel: string;
    nextDisabled?: boolean;
  }) => ReactNode;
  nextLabel: string;
}[] = [
  { id: 'mission', Component: MissionStep, nextLabel: 'Next' },
  { id: 'identity', Component: IdentityStep, nextLabel: 'Next' },
  { id: 'placement', Component: PlacementStep, nextLabel: 'Next' },
  { id: 'rules', Component: RulesStep, nextLabel: 'I accept' },
  { id: 'verification', Component: VerificationStep, nextLabel: 'Next' },
  { id: 'dryrun', Component: DryRunStep, nextLabel: 'Enter squad room' },
];

function stepIndexFromId(id: OnboardingStepId): number {
  return STEPS.findIndex((s) => s.id === id);
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const { stepId: stepIdParam } = useParams<{ stepId: string }>();
  const { exitDemo } = useDemoWalkthrough();
  const [searchParams] = useSearchParams();
  const demoTour = searchParams.get('demo') === '1';
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const owtRaw = searchParams.get('owt');
  const owtParsed = owtRaw != null ? parseInt(owtRaw, 10) : NaN;

  const index = useMemo(() => {
    if (demoTour) {
      if (!Number.isNaN(owtParsed) && owtParsed >= 0 && owtParsed < STEPS.length) {
        return owtParsed;
      }
      if (stepIdParam && isOnboardingStepId(stepIdParam)) {
        return stepIndexFromId(stepIdParam);
      }
      return 0;
    }
    if (stepIdParam && isOnboardingStepId(stepIdParam)) {
      return stepIndexFromId(stepIdParam);
    }
    return 0;
  }, [demoTour, owtParsed, stepIdParam]);
  const progressPercent = ((index + 1) / STEPS.length) * 100;

  const { draft } = useOnboarding();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [index]);

  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;
  const { Component, nextLabel } = STEPS[index];

  const searchSuffix = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    return p.toString() ? `?${p.toString()}` : '';
  }, [searchParams]);

  const goBack = () => {
    if (isFirst) return;
    const prevId = STEPS[index - 1].id;
    if (demoTour) {
      const p = new URLSearchParams(searchParams);
      p.set('demo', '1');
      p.set('owt', String(index - 1));
      navigate(
        { pathname: `/onboarding/${prevId}`, search: p.toString() ? `?${p.toString()}` : '' },
        { replace: true },
      );
    } else {
      navigate(`/onboarding/${prevId}${searchSuffix}`, { replace: true });
    }
  };

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    const nextId = STEPS[index + 1].id;
    if (demoTour) {
      const p = new URLSearchParams(searchParams);
      p.set('demo', '1');
      p.set('owt', String(index + 1));
      navigate(
        { pathname: `/onboarding/${nextId}`, search: p.toString() ? `?${p.toString()}` : '' },
        { replace: true },
      );
    } else {
      navigate(`/onboarding/${nextId}${searchSuffix}`, { replace: true });
    }
  };

  const nextDisabled = STEPS[index].id === 'rules' && !draft.rulesAccepted;

  const confirmExit = () => {
    setExitDialogOpen(false);
    if (demoTour) exitDemo();
    else navigate('/', { replace: true });
  };

  return (
    <div className="flex min-h-dvh max-h-dvh flex-col overflow-hidden bg-onboarding-bg">
      <OnboardingShellProvider heightMode="fill">
        <OnboardingChrome
          progressPercent={progressPercent}
          stepNumber={index + 1}
          totalSteps={STEPS.length}
          onExitRequest={() => setExitDialogOpen(true)}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Component
            onBack={isFirst ? undefined : goBack}
            onNext={goNext}
            nextLabel={nextLabel}
            nextDisabled={nextDisabled}
          />
        </div>
        <OnboardingExitDialog
          open={exitDialogOpen}
          onOpenChange={setExitDialogOpen}
          onConfirmExit={confirmExit}
        />
      </OnboardingShellProvider>
    </div>
  );
}

export { STEPS };
