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
      className="sr-section-enter border-b border-[color:var(--color-border-subtle)] py-14 md:py-16"
      aria-labelledby="boundary-h"
    >
      <div className={publicShellInnerClass}>
        <div className="mb-8 flex max-w-[36rem] flex-col gap-3 md:mb-10">
          <SectionLabel className="!mb-0">Security · documented limits</SectionLabel>
          <h2
            id="boundary-h"
            className="mt-0 font-display text-[1.5rem] font-medium leading-tight tracking-tight text-ink md:text-[1.75rem]"
          >
            Inspect the boundary — not a feature list.
          </h2>
          <p className="mb-0 max-w-[32rem] text-sm font-medium leading-relaxed text-ink">
            Private by default, auditable when justified, tamper-evident when published.
          </p>
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
