import { motion } from 'motion/react';
import SquadLogo from '../../../../../components/SquadLogo';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBody, obBodyMuted, obH1Hero } from '../OnboardingTypography';
import { OnboardingFooter } from '../OnboardingFooter';

interface FrameVerificationStanceProps {
  onNext: () => void;
  onBack: () => void;
}

export function FrameVerificationStance({ onNext, onBack }: FrameVerificationStanceProps) {
  const m = useOnboardingMotion();

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="relative mx-auto w-full"
    >
      <div className="pointer-events-none absolute right-0 top-0 flex justify-end opacity-40 blur-sm sm:right-4">
        <div className="h-24 w-36 rounded-md border border-white/15 bg-white/[0.04]" aria-hidden />
      </div>

      <div className="relative mb-8 flex justify-center sm:justify-start">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: m.reduced ? 0.01 : 0.5 }}
        >
          <SquadLogo size={96} />
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.titleTransition(0.08)}
        className={`${obH1Hero} ${obAfterH1}`}
      >
        Verification, not background check
      </motion.h1>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.15)}
        className={`space-y-5 ${obBody} ${obBodyMuted}`}
      >
        <p>
          Next, we run a one-time verification step to reduce bots, trolls, and spoofed identities.
        </p>
        <p>
          This may use zero-knowledge proofs or partner attestations, depending on your lane.
        </p>
        <p>Result: squads of real, eligible humans — without exposing who anyone is.</p>
      </motion.div>

      <OnboardingFooter
        onNext={onNext}
        onBack={onBack}
        navMode="last"
        finalizeLabel="Begin verification"
        delay={0.45}
      />
    </motion.div>
  );
}
