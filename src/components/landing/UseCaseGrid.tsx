import { Link } from 'react-router-dom';
import { OPERATIONAL_CONTEXTS } from '../../data/institutionalHome';
import { contextSlug } from '../../utils/contextSlug';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/** Short teasers for non-flagship contexts — keep the homepage scannable. */
const TEASERS: Record<string, string> = {
  'Restorative & de-escalation processes':
    'High-tension dialogue stays in the room; release a summary of next steps when ready.',
  'City community safety':
    'Coordinate verified community partners — proposals, shortlists, and commitment records.',
  'Ombuds & institutional inquiry':
    'Fact-finding with role-verified contributors and a defensible findings summary.',
};

/**
 * Operational contexts — mediation flagship first; others as short teasers.
 */
export function UseCaseGrid() {
  const [flagship, ...rest] = OPERATIONAL_CONTEXTS.slice(0, 4);
  const supporting = rest.slice(0, 3);

  return (
    <section
      className="border-b border-[color:var(--color-border-subtle)] py-14 md:py-16"
      aria-labelledby="use-cases-h"
    >
      <div className={publicShellInnerClass}>
        <div className="max-w-[30rem]">
          <SectionLabel className="!mb-2">Same room, different matters</SectionLabel>
          <h2
            id="use-cases-h"
            className="mt-0 font-display text-[1.5rem] font-medium leading-tight tracking-tight text-ink md:text-[1.625rem]"
          >
            One room model. Multiple institutional contexts.
          </h2>
          <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
            The same trust architecture, applied to different matters.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
          <Link
            to={`/use-cases#${contextSlug(flagship.label)}`}
            className="flex flex-col rounded-lg border border-line bg-surface-elevated p-7 no-underline transition-colors hover:bg-surface-secondary md:p-8"
          >
            <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-brand">
              Flagship practice
            </p>
            <h3 className="mt-4 mb-0 text-lg font-semibold tracking-tight text-ink">
              {flagship.label}
            </h3>
            <p className="mt-3 mb-0 flex-1 text-sm leading-relaxed text-ink-secondary">
              {flagship.body}
            </p>
            <span className="mt-8 font-mono text-[length:var(--text-label)] tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]">
              View context →
            </span>
          </Link>

          <ul className="m-0 flex list-none flex-col divide-y divide-[color:var(--color-border-subtle)] border-y border-[color:var(--color-border-subtle)] p-0">
            {supporting.map((ctx) => (
              <li key={ctx.label}>
                <Link
                  to={`/use-cases#${contextSlug(ctx.label)}`}
                  className="group flex flex-col py-5 no-underline transition-colors"
                >
                  <h3 className="m-0 text-sm font-semibold leading-snug text-ink group-hover:text-brand">
                    {ctx.label}
                  </h3>
                  <p className="mt-2 mb-0 text-xs leading-relaxed text-ink-secondary">
                    {TEASERS[ctx.label] ?? ctx.body}
                  </p>
                  <span className="mt-3 font-mono text-[length:var(--text-label)] tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)] transition-colors group-hover:text-brand">
                    View context →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to="/use-cases"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-brand no-underline transition-colors hover:text-ink"
        >
          See all contexts →
        </Link>
      </div>
    </section>
  );
}
