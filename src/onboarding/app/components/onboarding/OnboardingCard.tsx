import type { ReactNode } from 'react';
import { cn } from '../../../../lib/cn';

export function OnboardingCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex min-h-0 w-full flex-col rounded-xl border border-white/[0.08] bg-charcoal shadow-[0_16px_38px_rgba(0,0,0,0.72)] ring-1 ring-inset ring-white/[0.03]',
        'px-5 py-4 sm:px-7 sm:py-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
