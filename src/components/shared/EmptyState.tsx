import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type SharedEmptyStateProps = {
  icon: LucideIcon;
  heading: string;
  body?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * Standard empty state: Lucide icon + warm headline + sub-line + optional CTA.
 */
export function EmptyState({
  icon: Icon,
  heading,
  body,
  action,
  className,
}: SharedEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-5 py-16 text-center md:px-6',
        className,
      )}
    >
      <Icon className="h-12 w-12 text-ink-faint" aria-hidden="true" />
      <div className="flex max-w-prose flex-col gap-2">
        <p className="text-base font-medium text-ink">{heading}</p>
        {body ? <p className="text-sm leading-[1.55] text-ink-secondary">{body}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
