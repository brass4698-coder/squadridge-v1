import { motion } from 'motion/react';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBody, obBodyMuted, obH1Hero } from '../OnboardingTypography';
import { OnboardingFooter } from '../OnboardingFooter';

interface FrameRoomIntroProps {
  onNext: () => void;
  onBack: () => void;
}

export function FrameRoomIntro({ onNext, onBack }: FrameRoomIntroProps) {
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
        Inside a SquadRidge room
      </motion.h1>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.12)}
        className={`mb-10 ${obBody} ${obBodyMuted}`}
      >
        <p>
          Each room is a small squad. You&apos;ll see a shared topic anchor, time-boxed rounds, and structured turns so
          no one dominates the floor.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.22)}
        className="mb-10 rounded-md border border-onboarding-accent/25 bg-gradient-to-b from-white/[0.06] to-transparent p-5 shadow-onboarding-card-inner sm:p-6"
        aria-label="Room elements"
      >
        <div className="space-y-4 font-sans text-[11px] leading-relaxed text-white/70 sm:text-[12px]">
          <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.11em] text-onboarding-accent/90">
              Topic anchor
            </span>
            <span>Keeps the squad focused.</span>
          </div>
          <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.11em] text-onboarding-accent/90">
              Round timer
            </span>
            <span>We move in deliberate phases.</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.11em] text-onboarding-accent/90">
              Secure text input
            </span>
            <span>Guarded by client-side AI for sensitive details.</span>
          </div>
        </div>
      </motion.div>

      <OnboardingFooter
        onNext={onNext}
        onBack={onBack}
        navMode="last"
        finalizeLabel="Run a 60-second dry run"
        delay={0.4}
      />
    </motion.div>
  );
}
