import { motion } from 'motion/react';
import { cn } from '../../ui/utils';
import SquadLogo from '../../../../../components/SquadLogo';
import { useOnboardingMotion } from '../onboardingMotion';
import { obAfterH1, obBody, obH1Hero } from '../OnboardingTypography';
import { COPY } from '../copy';
import { srPrimaryCta, srSecondaryLink } from '../frames/squadRidgeUi';

interface MissionBriefScreenProps {
  onProceed: () => void;
  onDecline: () => void;
}

export function MissionBriefScreen({ onProceed, onDecline }: MissionBriefScreenProps) {
  const m = useOnboardingMotion();

  return (
    <motion.div
      initial={m.stepInitial}
      animate={m.stepAnimate}
      exit={m.stepExit}
      transition={m.stepTransition}
      className="relative mx-auto w-full"
    >
      <div className="pointer-events-none absolute -right-1 -top-2 sm:right-2 sm:top-0">
        <motion.div
          animate={
            m.reduced ? { opacity: 0.85 } : { opacity: [0.55, 0.95, 0.55], scale: [1, 1.03, 1] }
          }
          transition={m.reduced ? { duration: 0.01 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        >
          <SquadLogo size={64} className="opacity-90" />
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: m.reduced ? 1 : 0, y: m.reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={m.titleTransition(0.08)}
        className={`pr-14 sm:pr-20 ${obH1Hero} ${obAfterH1}`}
      >
        {COPY.mission.title}
      </motion.h1>

      <motion.div
        initial={{ opacity: m.reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={m.fadeTransition(0.15)}
        className={cn('space-y-5', obBody, 'text-white/[0.88]')}
      >
        <p className="mb-0">{COPY.mission.p1}</p>
        <p className="mb-0">{COPY.mission.p2}</p>
        <p className="mb-0 text-white/[0.82]">{COPY.mission.p3}</p>
      </motion.div>

      <motion.footer
        initial={{ opacity: m.reduced ? 1 : 0, y: m.footerY }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: m.reduced ? 0 : 0.35, duration: m.reduced ? 0.01 : 0.4 }}
        className="mt-10 flex flex-col-reverse gap-4 border-t border-white/[0.08] pt-8 shadow-onboarding-footer sm:flex-row sm:items-center sm:justify-between"
      >
        <button
          type="button"
          onClick={onDecline}
          className={cn(srSecondaryLink, 'text-white/70 hover:text-white')}
        >
          {COPY.mission.decline}
        </button>
        <button type="button" onClick={onProceed} className={srPrimaryCta}>
          {COPY.mission.proceed}
        </button>
      </motion.footer>
    </motion.div>
  );
}
