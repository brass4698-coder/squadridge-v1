import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

const inputBaseClass =
  'focus-ring sr-form-control h-11 w-full rounded-[var(--sr-radius-md)] border border-line bg-[var(--sr-form-control-bg)] px-3.5 text-sm text-ink placeholder:text-ink-faint';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(inputBaseClass, invalid && 'sr-form-control--invalid', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { inputBaseClass };
