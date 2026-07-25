import { Link } from 'react-router-dom';
import { primaryUseCases, secondaryUseCases } from '../../data/useCases';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Buyer-track teasers — homepage scannable index into /use-cases.
 */
export function UseCaseGrid() {
  return (
    <section className="py-16 md:py-20" data-scroll-section aria-labelledby="use-cases-h">
      <div className={publicShellInnerClass}>
        <div className="max-w-[32rem]">
          <SectionLabel className="!mb-2">Who buys this first</SectionLabel>
          <h2
            id="use-cases-h"
            className="mt-0 font-heading text-h2 font-semibold leading-tight tracking-tight text-ink"
          >
            Sensitive decisions. Private rooms. Citable outcomes.
          </h2>
          <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
            Three primary tracks where facilitators need a protected written room and an approved
            record the institution can still stand behind.
          </p>
        </div>

        <ul className="mt-10 m-0 grid list-none gap-4 p-0 sm:grid-cols-3 sm:gap-5">
          {primaryUseCases.map((uc) => (
            <li key={uc.id}>
              <Link
                to={`/use-cases#${uc.id}`}
                className="sr-interactive flex h-full flex-col rounded-[var(--sr-radius-lg)] bg-surface-elevated p-6 no-underline shadow-sr-card transition-[background-color,box-shadow,transform] hover:bg-surface-hover hover:shadow-sr-card-hover md:p-7"
              >
                <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.08em] text-ink-faint">
                  {uc.sector}
                </p>
                <h3 className="mt-3 mb-0 text-base font-semibold leading-snug tracking-[-0.02em] text-ink">
                  {uc.title}
                </h3>
                <p className="mt-3 mb-0 flex-1 text-sm leading-relaxed text-ink-secondary">
                  {uc.context}
                </p>
                <span className="mt-6 font-mono text-[length:var(--text-label)] tracking-[0.08em] text-ink-faint">
                  View track →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-6 m-0 flex list-none flex-col gap-2 p-0 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
          {secondaryUseCases.map((uc) => (
            <li key={uc.id}>
              <Link
                to={`/use-cases#${uc.id}`}
                className="group inline-flex flex-col no-underline sm:flex-row sm:items-baseline sm:gap-2"
              >
                <span className="text-sm font-medium text-ink group-hover:text-brand">
                  {uc.sector}
                </span>
                <span className="text-xs text-ink-faint group-hover:text-ink-secondary">
                  {uc.title} →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/use-cases"
          className="mt-8 inline-flex text-sm font-medium text-ink-secondary no-underline underline-offset-4 hover:text-ink hover:underline"
        >
          Review the five bounded contexts →
        </Link>
      </div>
    </section>
  );
}
