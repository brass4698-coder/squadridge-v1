import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ClipboardCheck, ShieldCheck, Waypoints } from 'lucide-react';
import { cn } from '../../lib/cn';

export type EvaluationPath = {
  label: string;
  href: string;
  body: string;
  /** Distinct action framing — avoid repeating the same CTA thrice. */
  cta: string;
  icon?: LucideIcon;
};

const DEFAULT_ICONS: LucideIcon[] = [ClipboardCheck, ShieldCheck, Waypoints];

export type EvaluationPathCardsProps = {
  paths: readonly EvaluationPath[];
  className?: string;
};

/**
 * Scannable diligence-path cards for institutional evaluation.
 * Restrained icons; elevated surfaces; no SaaS flash.
 */
export function EvaluationPathCards({ paths, className }: EvaluationPathCardsProps) {
  return (
    <ul
      className={cn(
        'm-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5',
        className,
      )}
    >
      {paths.map((path, index) => {
        const Icon = path.icon ?? DEFAULT_ICONS[index % DEFAULT_ICONS.length];
        return (
          <li key={path.label}>
            <Link
              to={path.href}
              className={cn(
                'group flex h-full flex-col rounded-[var(--sr-radius-md)] bg-surface-elevated p-5 no-underline shadow-sr-sm',
                'transition-colors duration-150 motion-reduce:transition-none',
                'hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--sr-bg),0_0_0_4px_var(--sr-primary)]',
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span
                  className="inline-flex size-9 items-center justify-center rounded-[var(--sr-radius-sm)] bg-surface-sunken text-brand"
                  aria-hidden
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="font-mono text-[length:var(--text-label)] tabular-nums text-ink-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </span>
              <span className="mt-4 text-sm font-semibold tracking-tight text-ink">
                {path.label}
              </span>
              <span className="mt-2 flex-1 text-sm leading-relaxed text-ink-secondary">
                {path.body}
              </span>
              <span className="mt-5 text-sm font-medium text-brand group-hover:underline group-hover:underline-offset-4">
                {path.cta} →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
