import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

type FormAlertVariant = 'info' | 'error' | 'success';

type FormAlertProps = {
  variant?: FormAlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
  role?: 'alert' | 'status';
};

export function FormAlert({
  variant = 'info',
  title,
  children,
  className,
  role = variant === 'error' ? 'alert' : 'status',
}: FormAlertProps) {
  return (
    <div
      className={cn(
        'sr-form-alert',
        variant === 'error' && 'sr-form-alert--error',
        variant === 'success' && 'sr-form-alert--success',
        className,
      )}
      role={role}
    >
      <div className="min-w-0">
        {title ? <p className="m-0 font-medium text-ink">{title}</p> : null}
        <div className={cn(title && 'mt-1.5', 'text-ink-secondary')}>{children}</div>
      </div>
    </div>
  );
}
