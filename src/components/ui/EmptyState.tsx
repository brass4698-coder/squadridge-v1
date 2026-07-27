import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
  heading: string;
  body?: string;
  action?: ReactNode;
  className?: string;
  /** Optional Lucide icon — preferred for new call sites. */
  icon?: LucideIcon;
}

export function EmptyState({ heading, body, action, className, icon: Icon }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-5 py-16 text-center md:px-6',
        className,
      )}
    >
      {Icon ? <Icon className="h-12 w-12 text-ink-faint" aria-hidden="true" /> : null}
      <div className="flex max-w-prose flex-col gap-2">
        <p className="text-base font-medium text-ink">{heading}</p>
        {body ? <p className="text-sm leading-[1.55] text-ink-secondary">{body}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
