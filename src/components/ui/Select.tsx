import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { inputBaseClass } from './Input';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

function isExplicitlyInvalid(
  invalid: boolean | undefined,
  ariaInvalid: SelectHTMLAttributes<HTMLSelectElement>['aria-invalid'],
): boolean {
  return invalid === true || ariaInvalid === true || ariaInvalid === 'true';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, 'aria-invalid': ariaInvalid, ...props }, ref) => {
    const showInvalid = isExplicitlyInvalid(invalid, ariaInvalid);
    return (
      <select
        {...props}
        ref={ref}
        className={cn(
          inputBaseClass,
          'sr-form-select',
          showInvalid && 'sr-form-control--invalid',
          className,
        )}
        aria-invalid={showInvalid ? true : undefined}
      >
        {children}
      </select>
    );
  },
);
Select.displayName = 'Select';
