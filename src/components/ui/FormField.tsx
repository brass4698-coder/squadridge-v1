import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Label } from './Label';

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({ id, label, hint, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
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
