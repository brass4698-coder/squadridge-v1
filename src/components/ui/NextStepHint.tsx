import type { ReactNode } from 'react';

type NextStepHintProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Consistent “what happens next” callout for flow and account pages.
 */
export function NextStepHint({ children, className = '' }: NextStepHintProps) {
  return (
    <div
      className={`rounded-lg border border-slate-700/50 bg-slate-900/30 px-4 py-3 ${className}`.trim()}
    >
      <p className="text-[0.8rem] leading-relaxed text-slate-500">{children}</p>
    </div>
  );
}
