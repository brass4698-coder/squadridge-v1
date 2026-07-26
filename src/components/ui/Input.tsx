import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const inputBaseClass =
  'focus-ring sr-form-control h-12 w-full rounded-[var(--sr-radius-lg)] border border-line bg-[var(--sr-form-control-bg)] px-4 text-[0.9375rem] text-ink placeholder:text-ink-faint';

function isExplicitlyInvalid(
  invalid: boolean | undefined,
  ariaInvalid: InputHTMLAttributes<HTMLInputElement>['aria-invalid'],
): boolean {
  return invalid === true || ariaInvalid === true || ariaInvalid === 'true';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, 'aria-invalid': ariaInvalid, ...props }, ref) => {
    const showInvalid = isExplicitlyInvalid(invalid, ariaInvalid);
    return (
      <input
        {...props}
        ref={ref}
        className={cn(inputBaseClass, showInvalid && 'sr-form-control--invalid', className)}
        aria-invalid={showInvalid ? true : undefined}
      />
    );
  },
);
Input.displayName = 'Input';

export { inputBaseClass };
