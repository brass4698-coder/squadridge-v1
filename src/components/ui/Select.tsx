import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { inputBaseClass } from './Input';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  success?: boolean;
};

function isExplicitlyInvalid(
  invalid: boolean | undefined,
  ariaInvalid: SelectHTMLAttributes<HTMLSelectElement>['aria-invalid'],
): boolean {
  return invalid === true || ariaInvalid === true || ariaInvalid === 'true';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, invalid, success, children, 'aria-invalid': ariaInvalid, value, ...props },
    ref,
  ) => {
    const showInvalid = isExplicitlyInvalid(invalid, ariaInvalid);
    const empty = value === undefined || value === null || value === '';
    return (
      <select
        {...props}
        ref={ref}
        value={value}
        data-empty={empty ? 'true' : undefined}
        className={cn(
          inputBaseClass,
          'sr-form-select',
          showInvalid && 'sr-form-control--invalid',
          !showInvalid && success && 'sr-form-control--success',
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
