import { motion } from 'motion/react';
import { useOnboardingMotion } from './onboardingMotion';

interface OnboardingChromeProps {
  progressPercent: number;
  onExitRequest: () => void;
}

/** Top bar: progress line only — no step numbers or counts (vault-style entry). */
export function OnboardingChrome({
  progressPercent,
  onExitRequest,
}: OnboardingChromeProps) {
  const m = useOnboardingMotion();

  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      <div className="h-[2px] w-full bg-white/[0.06]">
        <motion.div
          className="h-full bg-gradient-to-r from-onboarding-accent/80 via-onboarding-accent to-onboarding-accent/90"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: m.reduced ? 0.01 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="flex h-11 items-center justify-end border-b border-white/[0.06] bg-onboarding-chrome/95 px-3 backdrop-blur-md sm:h-12 sm:px-5">
        <button
          type="button"
          onClick={onExitRequest}
          className="py-2 font-sans text-[10px] font-semibold tracking-[0.1em] text-white/45 uppercase transition-colors hover:text-white sm:text-[11px]"
        >
          Exit
        </button>
      </div>
    </header>
  );
}
