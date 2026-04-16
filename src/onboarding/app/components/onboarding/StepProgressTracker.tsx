import { motion } from 'motion/react';
import { useOnboardingMotion } from './onboardingMotion';

interface StepProgressTrackerProps {
  current: number;
  total?: number;
}

export function StepProgressTracker({ current, total = 8 }: StepProgressTrackerProps) {
  const m = useOnboardingMotion();

  return (
    <div
      className="flex items-center justify-center gap-0"
      role="navigation"
      aria-label="Onboarding progress"
    >
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const active = step === current;
        const done = step < current;
        return (
          <div key={step} className="flex items-center">
            {i > 0 && (
              <div
                className={`mx-1.5 h-0.5 w-5 rounded-full transition-colors duration-300 sm:mx-2 sm:w-7 ${done ? 'bg-onboarding-accent/40' : 'bg-white/[0.12]'}`}
              />
            )}
            <motion.div
              initial={false}
              layout
              className={`rounded-full transition-all duration-300 ${
                active
                  ? 'h-2.5 w-8 bg-onboarding-accent shadow-onboarding-dot-active'
                  : done
                    ? 'h-2.5 w-2.5 bg-onboarding-accent/55'
                    : 'h-2.5 w-2.5 bg-white/[0.18]'
              }`}
              transition={{ duration: m.reduced ? 0.01 : 0.3 }}
            />
          </div>
        );
      })}
    </div>
  );
}
