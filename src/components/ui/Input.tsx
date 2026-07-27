import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  /** Calm success chrome after a confirmed value (e.g. validated credential). */
  success?: boolean;
};

const inputBaseClass =
  'sr-form-control h-12 w-full min-h-[var(--sr-form-field-min-h)] rounded-[var(--sr-radius-lg)] border px-4 text-[0.9375rem] text-ink placeholder:text-ink-faint';

function isExplicitlyInvalid(
  invalid: boolean | undefined,
  ariaInvalid: InputHTMLAttributes<HTMLInputElement>['aria-invalid'],
): boolean {
  return invalid === true || ariaInvalid === true || ariaInvalid === 'true';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, success, 'aria-invalid': ariaInvalid, ...props }, ref) => {
    const showInvalid = isExplicitlyInvalid(invalid, ariaInvalid);
    return (
      <input
        {...props}
        ref={ref}
        className={cn(
          inputBaseClass,
          showInvalid && 'sr-form-control--invalid',
          !showInvalid && success && 'sr-form-control--success',
          className,
        )}
        aria-invalid={showInvalid ? true : undefined}
      />
    );
  },
);
Input.displayName = 'Input';

export { inputBaseClass };
