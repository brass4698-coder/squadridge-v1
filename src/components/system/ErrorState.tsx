import { type ReactNode } from 'react';
import { Button } from '../ui/Button';

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
};

export function ErrorState({
  title = 'Something went wrong',
  description = 'Try again. If the problem continues, contact your program administrator.',
  action,
  children,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center" role="alert">
      <p className="text-section-title text-ink">{title}</p>
      <p className="mt-2 max-w-sm text-app-body text-ink-secondary">{description}</p>
      {action ? (
        <Button type="button" variant="secondary" className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
      {children}
    </div>
  );
}
