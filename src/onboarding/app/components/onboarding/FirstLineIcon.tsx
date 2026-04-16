import type { ReactNode } from 'react';

/** Aligns a 24px-tall icon with the first text line when body uses text-[15px] leading-relaxed */
export function FirstLineIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(15px*1.625)] shrink-0 items-center justify-center text-onboarding-accent">
      {children}
    </div>
  );
}
