import type { ReactNode } from 'react';
import { cn } from '../../../../lib/cn';

/**
 * Shared vault / console surface for every onboarding step (same shell as the commitment step).
 * Sits inside the width frame from `OnboardingGlassShell`.
 */
interface OnboardingStepShellProps {
  children: ReactNode;
  className?: string;
}

export function OnboardingStepShell({ children, className }: OnboardingStepShellProps) {
  return (
    <div
      className={cn(
        'w-full rounded-3xl border border-white/[0.12] bg-[#06090f]/95 px-7 py-9 shadow-[0_24px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.04] sm:px-10 sm:py-11',
        className,
      )}
    >
      {children}
    </div>
  );
}
