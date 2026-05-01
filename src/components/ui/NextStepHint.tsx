import type { ReactNode } from 'react';

type NextStepHintProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Consistent "what happens next" callout for flow and account pages.
 */
export function NextStepHint({ children, className = '' }: NextStepHintProps) {
  return (
    <div
      className={`rounded-lg border border-line/60 bg-navy-dark/50 px-4 py-3 ${className}`.trim()}
    >
      <p className="text-[0.8rem] leading-relaxed text-ink-faint">{children}</p>
    </div>
  );
}
