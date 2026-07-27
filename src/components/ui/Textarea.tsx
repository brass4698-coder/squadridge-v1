import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { inputBaseClass } from './Input';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
  success?: boolean;
};

function isExplicitlyInvalid(
  invalid: boolean | undefined,
  ariaInvalid: TextareaHTMLAttributes<HTMLTextAreaElement>['aria-invalid'],
): boolean {
  return invalid === true || ariaInvalid === true || ariaInvalid === 'true';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, success, 'aria-invalid': ariaInvalid, ...props }, ref) => {
    const showInvalid = isExplicitlyInvalid(invalid, ariaInvalid);
    return (
      <textarea
        {...props}
        ref={ref}
        className={cn(
          inputBaseClass,
          'min-h-[6.5rem] resize-y py-3 leading-relaxed',
          showInvalid && 'sr-form-control--invalid',
          !showInvalid && success && 'sr-form-control--success',
          className,
        )}
        aria-invalid={showInvalid ? true : undefined}
      />
    );
  },
);
Textarea.displayName = 'Textarea';
