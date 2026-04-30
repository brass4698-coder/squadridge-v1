import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Inert horizontal rail of up to ~6 ordered, equal-weight steps. Set
 * `currentIndex` to highlight the active stage; omit to render purely
 * informationally. For branching or long-content flows use a timeline.
 */
export interface StepperStep {
  label: string;
  /** Optional helper line shown beneath the label. */
  helper?: ReactNode;
}

interface StepperProps {
  steps: ReadonlyArray<StepperStep>;
  /** Zero-based index of the current step; omit to render purely informational. */
  currentIndex?: number;
  ariaLabel?: string;
  className?: string;
}

export function Stepper({
  steps,
  currentIndex,
  ariaLabel = 'Operational path',
  className,
}: StepperProps) {
  return (
    <ol
      aria-label={ariaLabel}
      className={twMerge(
        'flex flex-col gap-3 md:flex-row md:flex-wrap md:items-stretch md:gap-0',
        className,
      )}
    >
      {steps.map((step, i) => {
        const active = currentIndex === i;
        const completed = typeof currentIndex === 'number' && i < currentIndex;
        const isLast = i === steps.length - 1;
        return (
          <li
            key={step.label}
            className={twMerge(
              'flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center',
              'md:pr-3 last:md:pr-0',
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                aria-hidden
                className={twMerge(
                  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border font-mono text-[0.72rem] font-semibold tabular-nums',
                  active
                    ? 'border-brand bg-brand-soft text-ink'
                    : completed
                      ? 'border-line-strong bg-surface-elevated text-ink-secondary'
                      : 'border-line bg-surface-elevated text-ink-faint',
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p
                  className={twMerge(
                    'font-sans text-[0.85rem] font-medium leading-snug',
                    active ? 'text-ink' : 'text-ink-secondary',
                  )}
                >
                  {step.label}
                </p>
                {step.helper ? (
                  <p className="font-sans text-[0.72rem] leading-snug text-ink-faint">
                    {step.helper}
                  </p>
                ) : null}
              </div>
            </div>
            {!isLast ? (
              <span aria-hidden className="ml-10 hidden h-px flex-1 bg-line md:ml-3 md:block" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
