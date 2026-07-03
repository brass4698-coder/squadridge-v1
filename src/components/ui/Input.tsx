import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'focus-ring h-9 w-full rounded-md border border-line bg-surface-sunken px-3 text-sm text-ink placeholder:text-ink-faint',
        'transition-[border-color,box-shadow] duration-normal',
        invalid && 'border-sem-danger',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
