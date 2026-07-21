import { motion } from 'motion/react';
import { useOnboardingMotion } from './onboardingMotion';

interface OnboardingChromeProps {
  progressPercent: number;
  /** 1-based current step index */
  stepNumber: number;
  totalSteps: number;
  onExitRequest: () => void;
}

/** Top bar: Step N of M + segmented progress. */
export function OnboardingChrome({
  progressPercent,
  stepNumber,
  totalSteps,
  onExitRequest,
}: OnboardingChromeProps) {
  const m = useOnboardingMotion();

  const rounded = Math.min(100, Math.max(0, Math.round(progressPercent)));
  const safeTotal = Math.max(1, totalSteps);
  const safeStep = Math.min(safeTotal, Math.max(1, stepNumber));

  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      <div className="border-b border-white/[0.06] bg-onboarding-chrome/95 px-3 pt-2.5 pb-2 backdrop-blur-md sm:px-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p
            className="font-sans text-[10px] font-semibold tracking-[0.08em] text-white/55 uppercase sm:text-[11px]"
            aria-live="polite"
          >
            Step {safeStep} of {safeTotal}
          </p>
          <button
            type="button"
            onClick={onExitRequest}
            className="py-1 font-sans text-[10px] font-semibold tracking-[0.1em] text-white/45 uppercase transition-colors hover:text-white sm:text-[11px]"
          >
            Exit
          </button>
        </div>

        <div
          className="flex h-1.5 w-full gap-1"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={rounded}
          aria-label={`Onboarding progress, step ${safeStep} of ${safeTotal}`}
        >
          {Array.from({ length: safeTotal }).map((_, i) => {
            const filled = i < safeStep;
            return (
              <div
                key={i}
                className="h-full min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.08]"
              >
                {filled ? (
                  <motion.div
                    className="h-full w-full bg-gradient-to-r from-onboarding-accent/80 via-onboarding-accent to-onboarding-accent/90"
                    initial={m.reduced ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{ transformOrigin: 'left' }}
                    transition={{ duration: m.reduced ? 0.01 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
