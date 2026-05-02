import type { ComponentType, ReactNode } from 'react';
import { cn } from '../../lib/cn';

/**
 * Standardized empty / locked / recovery surface. Sits inside a page container;
 * pair it with `<Skeleton />` for the loading variant and `aria-live` containers
 * upstream for announcements.
 *
 * Usage: pass an `icon` (lucide component reference) to anchor the visual,
 * keep `title` short, and use `description` for the recovery hint. `actions`
 * accepts any node — typically `<Link>` / `<button>` pairs.
 */
export interface EmptyStateProps {
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** `info` (teal halo), `warn` (amber halo), `muted` (slate). Defaults to `muted`. */
  tone?: 'info' | 'warn' | 'muted';
  className?: string;
  /** Renders inside the existing card surface; keeps the component versatile. */
  inline?: boolean;
}

const TONE_CLASS: Record<NonNullable<EmptyStateProps['tone']>, string> = {
  info: 'border-teal-500/35 bg-teal-500/[0.05] text-teal-light',
  warn: 'border-amber/35 bg-amber/[0.06] text-amber-light',
  muted: 'border-slate-800/80 bg-white/[0.02] text-slate-400',
};

const ICON_TONE_CLASS: Record<NonNullable<EmptyStateProps['tone']>, string> = {
  info: 'border-teal-500/45 bg-teal-500/[0.1] text-teal-light',
  warn: 'border-amber/45 bg-amber/[0.1] text-amber-light',
  muted: 'border-slate-700 bg-slate-900/50 text-slate-400',
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  tone = 'muted',
  className,
  inline = false,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-start gap-4 rounded-xl border px-5 py-6 sm:flex-row sm:items-center',
        TONE_CLASS[tone],
        inline ? '' : 'mx-auto w-full max-w-2xl',
        className,
      )}
    >
      {Icon ? (
        <span
          className={cn(
            'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
            ICON_TONE_CLASS[tone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-[0.95rem] font-semibold tracking-tight text-slate-100">
          {title}
        </h3>
        {description ? (
          <div className="mt-1 font-sans text-[0.85rem] leading-relaxed text-slate-300">
            {description}
          </div>
        ) : null}
        {actions ? <div className="mt-4 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
