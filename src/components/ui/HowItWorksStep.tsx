import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface HowItWorksStepProps {
  number: string;
  heading: string;
  body: string;
  /** e.g. ghost link — keep linear flow inside step 01 */
  footer?: ReactNode;
  /** Lead column gets Cajun/amber pulse rail */
  rail?: 'default' | 'lead';
}

export function HowItWorksStep({
  number,
  heading,
  body,
  footer,
  rail = 'default',
}: HowItWorksStepProps) {
  return (
    <li
      className={twMerge(
        'relative flex min-h-0 flex-col pr-2 sm:pr-3 md:pr-4',
        'pb-12 pl-5 sm:pl-6 md:pb-14',
        rail === 'lead' ? 'landing-how-step-rail-lead' : 'landing-how-step-rail',
      )}
    >
      <span className="landing-how-step-number pointer-events-none relative z-0 block shrink-0 select-none leading-none">
        {number}
      </span>
      <div className="relative z-[2] mt-3 flex min-h-0 flex-1 flex-col md:mt-3.5">
        <h3 className="font-heading text-[clamp(1.125rem,1.45vw,1.35rem)] font-bold leading-[1.28] tracking-[-0.02em] text-landing-ink">
          {heading}
        </h3>
        <p className="mt-5 font-sans text-[clamp(0.9375rem,1.08vw,1.0625rem)] font-normal leading-[1.88] text-landing-body">
          {body}
        </p>
        {footer ? <div className="mt-7 min-w-0">{footer}</div> : null}
      </div>
    </li>
  );
}
