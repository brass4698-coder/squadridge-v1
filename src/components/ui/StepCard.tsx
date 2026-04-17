import type { ElementType, HTMLAttributes } from 'react';
import { cn } from '../../lib';

/** Onboarding-style gradient panel — horizontal padding + optional teal accent via `className`. */
export const STEP_CARD_SHELL =
  'relative z-10 flex min-h-0 w-full min-w-0 flex-col overflow-visible border border-[#1e2a3a] bg-gradient-to-b from-[#101722] via-[#0d121c] to-[#0a0f16] px-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_32px_64px_-28px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.04] md:px-11';

const SANDBOX_SHELL =
  'relative z-10 mx-auto w-full max-w-copy rounded-lg border border-solid border-[#1a2236] bg-navy-light/50 p-8 shadow-none ring-0 md:p-10';

export interface StepCardProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  children: React.ReactNode;
  className?: string;
  /** `gradient` = onboarding card shell; `sandbox` = dev / landing sandbox panel. */
  variant?: 'gradient' | 'sandbox';
  as?: ElementType;
}

export function StepCard({
  children,
  className,
  variant = 'gradient',
  as: Component = 'div',
  ...rest
}: StepCardProps) {
  const shell = variant === 'sandbox' ? SANDBOX_SHELL : STEP_CARD_SHELL;
  return (
    <Component className={cn(shell, className)} {...rest}>
      {children}
    </Component>
  );
}
