import { useState } from 'react';
import { motion } from 'motion/react';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBody, obBodyMuted, obH1Hero } from '../OnboardingTypography';
import { OnboardingFooter } from '../OnboardingFooter';

interface FrameFinalGateProps {
  onEnter: () => void;
  onBack: () => void;
}

export function FrameFinalGate({ onEnter, onBack }: FrameFinalGateProps) {
  const m = useOnboardingMotion();
  const [checked, setChecked] = useState(false);

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
        Confirm your role in this system
      </motion.h1>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.12)}
        className={`mb-8 space-y-5 ${obBody} ${obBodyMuted}`}
      >
        <p>SquadRidge exists so people like you can do high-stakes work without exposure.</p>
        <p className="font-medium text-white/80">You understand that:</p>
        <ul className="list-disc space-y-2 pl-5 text-white/72">
          <li>You are entering verified-anonymous rooms.</li>
          <li>You will follow the secure-conversation rules.</li>
          <li>You accept that misuse puts others at risk.</li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.28)}
        className="mb-10 flex items-start gap-3 rounded-md border border-white/[0.08] bg-white/[0.02] p-4"
      >
        <Checkbox
          id="final-commit"
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
          className="mt-0.5 border-white/30 data-[state=checked]:bg-onboarding-accent data-[state=checked]:border-onboarding-accent"
        />
        <Label htmlFor="final-commit" className="cursor-pointer text-left text-sm font-normal leading-snug text-white/78">
          I understand and accept the responsibilities of using SquadRidge.
        </Label>
      </motion.div>

      <OnboardingFooter
        onNext={onEnter}
        onBack={onBack}
        navMode="last"
        finalizeLabel="Enter squads"
        nextDisabled={!checked}
        delay={0.4}
      />
    </motion.div>
  );
}
