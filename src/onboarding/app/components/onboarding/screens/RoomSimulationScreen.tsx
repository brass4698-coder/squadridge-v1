import { motion } from 'motion/react';
import { FrameDryRun } from '../frames/FrameDryRun';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBodyMuted, obH1Hero } from '../OnboardingTypography';
import { COPY } from '../copy';

interface RoomSimulationScreenProps {
  onNext: () => void;
  onBack: () => void;
}

export function RoomSimulationScreen({ onNext, onBack }: RoomSimulationScreenProps) {
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
        {COPY.room.title}
      </motion.h1>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.12)}
        className={`mb-5 max-w-prose space-y-4 font-sans text-[15px] leading-relaxed sm:text-[16px] ${obBodyMuted}`}
      >
        <p className="mb-0">{COPY.room.leadLine1}</p>
        <p className="mb-0">{COPY.room.leadLine2}</p>
      </motion.div>

      <motion.p
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.18)}
        className="mb-10 max-w-prose border-l-2 border-onboarding-accent/35 pl-4 font-sans text-[14px] leading-snug text-white/58 sm:text-[15px]"
      >
        {COPY.room.guidance}
      </motion.p>

      <FrameDryRun onNext={onNext} onBack={onBack} />
    </motion.div>
  );
}
