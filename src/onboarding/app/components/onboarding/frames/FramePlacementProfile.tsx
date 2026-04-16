import { motion } from 'motion/react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBodyMuted, obH1Hero } from '../OnboardingTypography';
import { OnboardingFooter } from '../OnboardingFooter';
import { srInputClass } from './squadRidgeUi';

interface FramePlacementProfileProps {
  onNext: () => void;
  onBack: () => void;
}

const fieldClass = 'space-y-2';

export function FramePlacementProfile({ onNext, onBack }: FramePlacementProfileProps) {
  const m = useOnboardingMotion();

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
        What we need to place you
      </motion.h1>

      <motion.p
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.12)}
        className={`mb-10 max-w-prose font-sans text-[15px] leading-relaxed sm:text-[16px] ${obBodyMuted}`}
      >
        We only collect what&apos;s needed to put you in the right squads and language lanes — nothing more.
      </motion.p>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.18)}
        className="mb-10 space-y-8"
      >
        <div className={fieldClass}>
          <Label htmlFor="sr-lang" className="text-white/85">
            Language
          </Label>
          <Input
            id="sr-lang"
            name="language"
            placeholder="e.g. English"
            autoComplete="language"
            className={srInputClass}
          />
          <p className="text-[13px] leading-relaxed text-white/45">So every squad can understand each other.</p>
        </div>

        <div className={fieldClass}>
          <Label htmlFor="sr-region" className="text-white/85">
            Region / focus band
          </Label>
          <Input
            id="sr-region"
            name="region"
            placeholder='e.g. Eastern Europe conflict observer, Defense policy — NATO context'
            className={srInputClass}
          />
          <p className="text-[13px] leading-relaxed text-white/45">
            So we match you to relevant rooms without pinpointing you.
          </p>
        </div>

        <div className={fieldClass}>
          <Label htmlFor="sr-role" className="text-white/85">
            Role archetype
          </Label>
          <Input
            id="sr-role"
            name="role"
            placeholder="e.g. practitioner, analyst, citizen, veteran, NGO"
            className={srInputClass}
          />
          <p className="text-[13px] leading-relaxed text-white/45">
            So others can weigh your perspective without knowing your identity.
          </p>
        </div>

        <div className={fieldClass}>
          <Label htmlFor="sr-tz" className="text-white/85">
            Time zone window
          </Label>
          <Input id="sr-tz" name="timezone" placeholder="e.g. US evenings, CET business hours" className={srInputClass} />
          <p className="text-[13px] leading-relaxed text-white/45">So we can schedule at humane hours.</p>
        </div>
      </motion.div>

      <OnboardingFooter
        onNext={onNext}
        onBack={onBack}
        navMode="last"
        finalizeLabel="Confirm placement profile"
        delay={0.4}
      />
    </motion.div>
  );
}
