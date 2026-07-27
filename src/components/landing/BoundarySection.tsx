import { Link } from 'react-router-dom';
import { TrustBoundaryBlock } from '../shared/TrustBoundaryBlock';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/** Homepage documented limits — honesty table, not marketing posture. */
export function BoundarySection() {
  return (
    <section
      id="documented-limits"
      className="sr-section-enter scroll-mt-24 bg-surface-secondary/80 py-16 md:py-20"
      data-scroll-section
      aria-labelledby="boundary-h"
    >
      <div className={publicShellInnerClass}>
        <div className="mb-8 flex max-w-[40rem] flex-col gap-3 md:mb-10">
          <SectionLabel className="!mb-0">Security · documented limits</SectionLabel>
          <h2
            id="boundary-h"
            className="mt-0 font-heading text-h2 font-semibold leading-tight tracking-tight text-ink"
          >
            What each layer protects — and what we refuse to overclaim.
          </h2>
          <p className="mb-0 max-w-[32rem] text-sm leading-relaxed text-ink-secondary">
            Not full platform zero-knowledge. Not Signal-grade E2E today. Invite-only entry,
            facilitator release, and a verifiable integrity record — not continuous monitoring.
          </p>
          <Link
            to="/security#reviewers"
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            For security reviewers →
          </Link>
        </div>
        <TrustBoundaryBlock securityHref="/security" hideFooterLink />
      </div>
    </section>
  );
}
