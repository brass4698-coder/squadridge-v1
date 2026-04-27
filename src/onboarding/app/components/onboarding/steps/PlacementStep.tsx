import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingCard } from '../OnboardingCard';
import { COPY } from '../copy';
import { upsertProfilePatch } from '../../../../lib/supabase/profile';
import { useOnboarding } from '../OnboardingContext';
import { ONBOARDING_INPUT_CLASS } from '../onboardingShellStyles';
import { obBody, obH1, obH1ToLead, obHelper, obLabel } from '../onboardingStepClasses';
import { TRUST_FOOTER } from '../onboardingTrustNotes';
import type { StepProps } from '../types';

export function PlacementStep({ onBack, onNext, nextLabel, nextDisabled }: StepProps) {
  const { draft, setDraft } = useOnboarding();

  const skip = async () => {
    setDraft({ language: '', regionHint: '', timezoneWindow: '' });
    await upsertProfilePatch({
      language: null,
      region_hint: null,
      timezone_window: null,
    });
    onNext?.();
  };

  const handleContinue = async () => {
    await upsertProfilePatch({
      language: draft.language.trim() || null,
      region_hint: draft.regionHint.trim() || null,
      timezone_window: draft.timezoneWindow.trim() || null,
    });
    onNext?.();
  };

  return (
    <OnboardingLayout
      onBack={onBack}
      onNext={() => void handleContinue()}
      nextLabel={nextLabel}
      nextDisabled={nextDisabled}
      trustNote={TRUST_FOOTER.placement}
    >
      <OnboardingCard>
        <div className="grid min-h-0 grid-cols-1 items-start gap-x-6 gap-y-3 lg:grid-cols-[1.12fr_1fr] lg:gap-x-8">
          <div className="flex min-h-0 flex-col gap-3">
            <div className={`flex flex-col ${obH1ToLead}`}>
              <h1 className={obH1}>{COPY.placement.title}</h1>
              <p className={obBody}>{COPY.placement.lead}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className={obLabel}>{COPY.placement.languageLabel}</span>
              <p className={obHelper}>{COPY.placement.languageHint}</p>
              <input
                id="sr-lang"
                name="language"
                autoComplete="language"
                data-demo="onboarding-language"
                value={draft.language}
                onChange={(e) => setDraft({ language: e.target.value })}
                className={ONBOARDING_INPUT_CLASS}
              />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className={obLabel}>{COPY.placement.regionLabel}</span>
              <p className={obHelper}>{COPY.placement.regionHintScope}</p>
              <p className={obHelper}>{COPY.placement.regionHintExamples}</p>
              <input
                id="sr-region"
                name="region"
                data-demo="onboarding-region"
                value={draft.regionHint}
                onChange={(e) => setDraft({ regionHint: e.target.value })}
                className={ONBOARDING_INPUT_CLASS}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className={obLabel}>{COPY.placement.timezoneLabel}</span>
              <p className={obHelper}>{COPY.placement.timezoneHintWhen}</p>
              <p className={obHelper}>{COPY.placement.timezoneHintExamples}</p>
              <input
                id="sr-tz"
                name="timezone"
                data-demo="onboarding-timezone"
                value={draft.timezoneWindow}
                onChange={(e) => setDraft({ timezoneWindow: e.target.value })}
                className={ONBOARDING_INPUT_CLASS}
              />
            </div>

            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => void skip()}
                className="text-[0.8125rem] text-ink-muted transition-colors duration-150 hover:text-ink"
              >
                {COPY.placement.skip}
              </button>
            </div>
          </div>
        </div>
      </OnboardingCard>
    </OnboardingLayout>
  );
}
