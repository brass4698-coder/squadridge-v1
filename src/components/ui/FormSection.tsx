import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type FormSectionProps = {
  id: string;
  title: string;
  index: number;
  complete?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormSection({ id, title, index, complete, children, className }: FormSectionProps) {
  return (
    <fieldset id={id} className={cn('sr-form-section', className)}>
      <legend className="sr-form-section__legend">
        <span
          className={cn('sr-form-section__index', complete && 'sr-form-section__index--complete')}
          aria-hidden
        >
          {String(index).padStart(2, '0')}
        </span>
        {title}
        {complete ? <span className="sr-only"> (complete)</span> : null}
      </legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}
