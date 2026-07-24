import { Link } from 'react-router-dom';
import { TrustBoundaryBlock } from '../shared/TrustBoundaryBlock';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Table-led trust section — dense, honest, reviewer-friendly.
 */
export function BoundarySection() {
  return (
    <section
      className="sr-section-enter border-b border-[color:var(--color-border-subtle)] py-16 md:py-20"
      data-scroll-section
      aria-labelledby="boundary-h"
    >
      <div className={publicShellInnerClass}>
        <div className="mb-10 flex max-w-[40rem] flex-col gap-4 md:mb-12">
          <SectionLabel className="!mb-0">Security · documented limits</SectionLabel>
          <p className="m-0 max-w-[36rem] rounded-[var(--sr-radius-md)] border border-brand/25 bg-brand-soft/40 px-4 py-3 font-display text-lg font-medium leading-snug tracking-tight text-ink md:text-xl">
            Private by default, auditable when justified, tamper-evident when published.
          </p>
          <h2
            id="boundary-h"
            className="mt-0 font-display text-[1.5rem] font-medium leading-tight tracking-tight text-ink md:text-[1.75rem]"
          >
            Inspect the boundary — not a feature list.
          </h2>
          <p className="mb-0 max-w-[32rem] text-sm leading-relaxed text-ink-secondary">
            Each layer states what the architecture protects and what we refuse to overclaim.
          </p>
          <Link
            to="/security#reviewers"
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-brand no-underline transition-colors hover:text-ink"
          >
            For security reviewers →
          </Link>
        </div>
        <TrustBoundaryBlock securityHref="/security" hideFooterLink />
      </div>
    </section>
  );
}
