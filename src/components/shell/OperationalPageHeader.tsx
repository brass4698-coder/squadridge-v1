import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

export type OperationalPageHeaderProps = {
  title: string;
  summary: string;
  scope: string;
  nextAction: string;
  trustNote: string;
  roleLabel?: string;
  stateLabel?: string;
  lastUpdated?: string | null;
  primaryAction?: { label: string; href: string } | null;
  className?: string;
};

/**
 * First-viewport doctrine: who / scope / stage / next / trust boundary.
 */
export function OperationalPageHeader({
  title,
  summary,
  scope,
  nextAction,
  trustNote,
  roleLabel,
  stateLabel,
  lastUpdated,
  primaryAction,
  className,
}: OperationalPageHeaderProps) {
  return (
    <header className={cn('mb-8 border-b border-line pb-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          {(roleLabel || stateLabel) && (
            <p className="mb-2 flex flex-wrap gap-2 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              {roleLabel ? <span>{roleLabel}</span> : null}
              {roleLabel && stateLabel ? <span aria-hidden>·</span> : null}
              {stateLabel ? <span>{stateLabel}</span> : null}
            </p>
          )}
          <h1 className="font-display text-h2 font-medium tracking-tight text-ink md:text-[1.75rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary md:text-base">
            {summary}
          </p>
        </div>
        {primaryAction ? (
          <Link
            to={primaryAction.href}
            className="btn-institutional btn-institutional--primary shrink-0"
          >
            {primaryAction.label}
          </Link>
        ) : null}
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            Scope
          </dt>
          <dd className="mt-1 m-0 text-sm text-ink">{scope}</dd>
        </div>
        <div>
          <dt className="font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            Next action
          </dt>
          <dd className="mt-1 m-0 text-sm font-medium text-ink">{nextAction}</dd>
        </div>
        {lastUpdated ? (
          <div>
            <dt className="font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              Last updated
            </dt>
            <dd className="mt-1 m-0 text-sm text-ink-secondary">{lastUpdated}</dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-5 mb-0 max-w-3xl border-l-2 border-line pl-3 text-xs leading-relaxed text-ink-faint md:text-sm">
        {trustNote}
      </p>
    </header>
  );
}
