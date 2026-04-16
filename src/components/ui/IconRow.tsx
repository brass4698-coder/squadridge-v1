import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

/** Matches `ONBOARDING_BULLET_ICON_PX` in OnboardingPage — icon column and SVG sizing stay in sync. */
const ICON_BOX_PX = 42;

export interface IconRowProps {
  icon: ReactNode;
  label: string;
  className?: string;
}

/**
 * Onboarding bullet as a compact row card: fixed icon column, description vertically centered with the icon.
 */
export function IconRow({ icon, label, className }: IconRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-[#1e2a3a]/90 bg-[#0b1019]/80 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:gap-4 sm:px-4 sm:py-3.5',
        className,
      )}
    >
      <span
        className="flex shrink-0 items-center justify-center text-teal-300"
        style={{ width: ICON_BOX_PX, height: ICON_BOX_PX }}
        aria-hidden
      >
        {icon}
      </span>
      <p className="m-0 min-w-0 flex-1 text-left font-sans text-onboarding-body font-normal leading-relaxed text-ink-secondary">
        {label}
      </p>
    </div>
  );
}
