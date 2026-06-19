import { type ReactNode } from 'react';

interface EmptyStateProps {
  heading: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ heading, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <p
        className="mb-2 text-base font-medium"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {heading}
      </p>
      {body && (
        <p
          className="mb-6 max-w-sm text-sm"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {body}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
