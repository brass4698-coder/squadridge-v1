import { useSearchParams } from 'react-router-dom';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingCard } from '../OnboardingCard';
import { obBody, obH1, obH1ToFirstLine, obQuote } from '../onboardingStepClasses';
import { TRUST_FOOTER } from '../onboardingTrustNotes';
import type { StepProps } from '../types';

export function MissionStep({ onBack, onNext, nextLabel, nextDisabled }: StepProps) {
  const [searchParams] = useSearchParams();
  const demoTour = searchParams.get('demo') === '1';

  return (
    <OnboardingLayout
      onBack={onBack}
      onNext={onNext}
      nextLabel={nextLabel}
      nextDisabled={nextDisabled}
      pulseForwardAdvance={demoTour}
      trustNote={TRUST_FOOTER.mission}
    >
      <OnboardingCard>
        <div className="flex max-w-[52rem] flex-col gap-3 sm:gap-3.5">
          <div className={`flex flex-col ${obH1ToFirstLine}`}>
            <h1 className={obH1}>Mission brief</h1>
            <p className={obBody}>
              MENDguild is verified-anonymous infrastructure for high-stakes cross-border strategy.
            </p>
          </div>

          <p className={obBody}>
            Not a forum. Not a chat app. A structured room where serious people work serious
            problems — anonymously, verifiably, without a paper trail.
          </p>

          <div className={obQuote}>
            <p className={`${obBody} italic`}>
              You are here because the work matters. Proceed accordingly.
            </p>
          </div>
        </div>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
