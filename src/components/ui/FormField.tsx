import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Label } from './Label';

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  /** Mono uppercase micro-label for instrument / vault sections */
  instrument?: boolean;
};

export function FormField({
  id,
  label,
  hint,
  error,
  children,
  className,
  instrument,
}: FormFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const control = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{
      id?: string;
      invalid?: boolean;
      'aria-describedby'?: string;
      'aria-invalid'?: boolean | 'true' | 'false';
    }>;
    const existing = el.props['aria-describedby'];
    // Only set aria-invalid when there is an explicit error — never on pristine fields.
    const next: {
      id: string;
      'aria-describedby'?: string;
      invalid?: boolean;
      'aria-invalid'?: true;
    } = {
      id: el.props.id ?? id,
      'aria-describedby': [existing, describedBy].filter(Boolean).join(' ') || undefined,
    };
    if (error) {
      next.invalid = true;
      next['aria-invalid'] = true;
    }
    return cloneElement(el, next);
  });

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id} instrument={instrument}>
        {label}
      </Label>
      {control}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-app-meta text-sem-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-app-meta text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
