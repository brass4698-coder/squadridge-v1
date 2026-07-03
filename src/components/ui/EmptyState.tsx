import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
  heading: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ heading, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}
    >
      <p className="text-app-body font-medium text-ink">{heading}</p>
      {body ? <p className="mt-2 max-w-sm text-app-body text-ink-secondary">{body}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
