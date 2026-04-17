import { useLayoutEffect, useState } from 'react';
import { useOnboarding } from './OnboardingContext';
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
  const [index, setIndex] = useState(0);
  const { draft } = useOnboarding();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [index]);

  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;
  const { Component, nextLabel } = STEPS[index];

  const goBack = () => !isFirst && setIndex((i) => i - 1);
  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
  };

  const nextDisabled = STEPS[index].id === 'rules' && !draft.rulesAccepted;

  return (
    <Component
      onBack={isFirst ? undefined : goBack}
      onNext={goNext}
      nextLabel={nextLabel}
      nextDisabled={nextDisabled}
    />
  );
}
