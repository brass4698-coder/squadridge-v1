import { motion } from 'motion/react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBodyMuted, obH1Hero } from '../OnboardingTypography';
import { COPY } from '../copy';
import { OnboardingFooter } from '../OnboardingFooter';
import { upsertProfilePatch } from '../../../../lib/supabase/profile';
import { useOnboarding } from '../OnboardingContext';
import { srInputClass, srSecondaryLink } from '../frames/squadRidgeUi';

interface PlacementScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const hintClass =
  'font-sans text-[13px] font-normal leading-relaxed text-white/58 sm:text-[13.5px]';
const fieldBlockClass = 'space-y-2';

export function PlacementScreen({ onNext, onBack }: PlacementScreenProps) {
  const m = useOnboardingMotion();
  const { draft, setDraft } = useOnboarding();

  const skip = async () => {
    setDraft({ language: '', regionHint: '', timezoneWindow: '' });
    await upsertProfilePatch({
      language: null,
      region_hint: null,
      timezone_window: null,
    });
    onNext();
  };

  const handleContinue = async () => {
    await upsertProfilePatch({
      language: draft.language.trim() || null,
      region_hint: draft.regionHint.trim() || null,
      timezone_window: draft.timezoneWindow.trim() || null,
    });
    onNext();
  };

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="mx-auto w-full"
    >
      <motion.h1
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.titleTransition(0.08)}
        className={`${obH1Hero} ${obAfterH1}`}
      >
        {COPY.placement.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.12)}
        className={`mb-10 max-w-prose font-sans text-[15px] leading-relaxed sm:text-[16px] ${obBodyMuted}`}
      >
        {COPY.placement.lead}
      </motion.p>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.18)}
        className="mb-10 space-y-8"
      >
        <div className={fieldBlockClass}>
          <div className="space-y-1">
            <Label htmlFor="sr-lang" className="text-white/85">
              {COPY.placement.languageLabel}
            </Label>
            <p className={hintClass}>{COPY.placement.languageHint}</p>
          </div>
          <Input
            id="sr-lang"
            name="language"
            autoComplete="language"
            value={draft.language}
            onChange={(e) => setDraft({ language: e.target.value })}
            className={srInputClass}
          />
        </div>

        <div className={fieldBlockClass}>
          <div className="space-y-1">
            <Label htmlFor="sr-region" className="text-white/85">
              {COPY.placement.regionLabel}
            </Label>
            <p className={hintClass}>{COPY.placement.regionHintScope}</p>
            <p className={hintClass}>{COPY.placement.regionHintExamples}</p>
          </div>
          <Input
            id="sr-region"
            name="region"
            value={draft.regionHint}
            onChange={(e) => setDraft({ regionHint: e.target.value })}
            className={srInputClass}
          />
        </div>

        <div className={fieldBlockClass}>
          <div className="space-y-1">
            <Label htmlFor="sr-tz" className="text-white/85">
              {COPY.placement.timezoneLabel}
            </Label>
            <p className={hintClass}>{COPY.placement.timezoneHintWhen}</p>
            <p className={hintClass}>{COPY.placement.timezoneHintExamples}</p>
          </div>
          <Input
            id="sr-tz"
            name="timezone"
            value={draft.timezoneWindow}
            onChange={(e) => setDraft({ timezoneWindow: e.target.value })}
            className={srInputClass}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.24)}
        className="mb-8"
      >
        <button type="button" onClick={skip} className={srSecondaryLink}>
          {COPY.placement.skip}
        </button>
      </motion.div>

      <OnboardingFooter onNext={handleContinue} onBack={onBack} navMode="last" finalizeLabel="Continue" delay={0.35} />
    </motion.div>
  );
}
