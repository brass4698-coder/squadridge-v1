import { useId, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

const AUDIT_COPY = 'This action will be recorded in the audit log.';

export type AuditTooltipProps = {
  children: ReactNode;
  /** Override default audit disclosure copy when needed. */
  label?: string;
  className?: string;
};

/**
 * Hover/focus disclosure for audit-logged actions.
 * Uses native title + an accessible tooltip for keyboard users.
 */
export function AuditTooltip({ children, label = AUDIT_COPY, className }: AuditTooltipProps) {
  const tipId = useId();

  return (
    <span className={cn('group relative inline-flex', className)}>
      <span className="inline-flex" title={label} aria-describedby={tipId}>
        {children}
      </span>
      <span
        id={tipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-[16rem] -translate-x-1/2',
          'rounded-lg border border-line bg-surface-elevated px-2.5 py-1.5 text-left text-xs font-normal leading-snug text-ink-secondary shadow-sm',
          'opacity-0 transition-opacity duration-150 ease-out',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          'motion-reduce:transition-none',
        )}
      >
        {label}
      </span>
    </span>
  );
}
