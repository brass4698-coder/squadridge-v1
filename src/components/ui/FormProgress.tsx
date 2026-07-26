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

  return (
    <nav aria-label="Form sections" className={cn('mb-6', className)}>
      <div className="sr-form-progress__track mb-4 w-full" aria-hidden>
        <div className="sr-form-progress__fill" style={{ width: `${clamped * 100}%` }} />
      </div>
      <ol className="sr-form-progress m-0 flex w-full list-none gap-2 p-0">
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
                {step.label}
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
