import { Link } from 'react-router-dom';
import { primaryUseCases, secondaryUseCases } from '../../data/useCases';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Buyer-track teasers — homepage scannable index into /use-cases (three equal primaries).
 */
export function UseCaseGrid() {
  return (
    <section
      className="border-b border-line py-16 md:py-20"
      data-scroll-section
      aria-labelledby="use-cases-h"
    >
      <div className={publicShellInnerClass}>
        <div className="max-w-[30rem]">
          <SectionLabel className="!mb-2">Who this serves</SectionLabel>
          <h2
            id="use-cases-h"
            className="mt-0 font-display text-h2 font-medium leading-tight tracking-tight text-ink"
          >
            Who SquadRidge serves
          </h2>
          <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
            Foundations, peacebuilders, and HR teams — same privacy-first deliberation
            infrastructure, different sensitive decisions.
          </p>
        </div>

        <ul className="mt-10 m-0 grid list-none gap-4 p-0 sm:grid-cols-3 sm:gap-5">
          {primaryUseCases.map((uc) => (
            <li key={uc.id}>
              <Link
                to={`/use-cases#${uc.id}`}
                className="sr-vault-card sr-vault-card--interactive flex h-full flex-col p-6 no-underline md:p-7"
              >
                <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                  {uc.sector}
                </p>
                <h3 className="mt-3 mb-0 text-base font-semibold leading-snug tracking-tight text-ink">
                  {uc.title}
                </h3>
                <p className="mt-3 mb-0 flex-1 text-sm leading-relaxed text-ink-secondary">
                  {uc.context}
                </p>
                <span className="mt-6 font-mono text-[length:var(--text-label)] tracking-[var(--tracking-caps)] text-ink-faint">
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
          All buyer tracks →
        </Link>
      </div>
    </section>
  );
}
