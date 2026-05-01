import type { ReactNode } from 'react';
import { cn } from '../../../../lib/cn';

interface OnboardingGlassShellProps {
  children: ReactNode;
  /** Max width for the step column (e.g. `max-w-2xl`, `max-w-3xl`). Defaults to `max-w-[640px]`. */
  className?: string;
}

/**
 * Outer width frame for onboarding content. Step chrome lives in {@link OnboardingStepShell}.
 */
export function OnboardingGlassShell({ children, className }: OnboardingGlassShellProps) {
  return <div className={cn('w-full max-w-[640px]', className)}>{children}</div>;
}
