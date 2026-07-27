import { cn } from '../../lib/cn';

export type FormProgressStep = {
  id: string;
  label: string;
  complete?: boolean;
  active?: boolean;
};

type FormProgressProps = {
  steps: FormProgressStep[];
  /** 0–1 overall fill for the progress track */
  progress: number;
  className?: string;
};

export function FormProgress({ steps, progress, className }: FormProgressProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const percent = Math.round(clamped * 100);

  return (
    <nav aria-label="Form sections" className={cn('mb-7', className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
          Progress
        </p>
        <p className="m-0 font-mono text-[length:var(--text-label)] tabular-nums text-ink-secondary">
          {percent}%
        </p>
      </div>
      <div
        className="sr-form-progress__track mb-4 w-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Form completion"
      >
        <div className="sr-form-progress__fill" style={{ width: `${clamped * 100}%` }} />
      </div>
      <ol className="sr-form-progress m-0 flex w-full list-none gap-1.5 p-0 sm:gap-2">
        {steps.map((step) => (
          <li key={step.id} className="min-w-0 flex-1">
            <a
              href={`#section-${step.id}`}
              className={cn(
                'sr-form-progress__step',
                step.complete && 'sr-form-progress__step--complete',
                step.active && 'sr-form-progress__step--active',
              )}
            >
              <span className="sr-form-progress__label">
                <span className="sr-form-progress__dot" aria-hidden />
                <span className="truncate">{step.label}</span>
                <span className="sr-only">
                  {step.complete ? ', complete' : step.active ? ', current' : ', incomplete'}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
