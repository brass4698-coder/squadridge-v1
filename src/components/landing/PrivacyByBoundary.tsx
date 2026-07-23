import { Link } from 'react-router-dom';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Named privacy doctrine — one claim, no room→gate→record repeat (that lives in ProcessStagePanel).
 */
export function PrivacyByBoundary() {
  return (
    <section
      className="sr-section-enter border-b border-[color:var(--color-border-subtle)] py-14 md:py-16"
      aria-labelledby="privacy-boundary-h"
    >
      <div className={publicShellInnerClass}>
        <div className="max-w-[40rem]">
          <SectionLabel className="!mb-2">Privacy doctrine</SectionLabel>
          <h2
            id="privacy-boundary-h"
            className="mt-0 font-display text-[1.625rem] font-medium leading-tight tracking-tight text-ink md:text-[1.875rem]"
          >
            Privacy by boundary, not by broadcast.
          </h2>
          <p className="mt-4 mb-0 text-sm leading-relaxed text-ink-secondary md:text-base">
            Controlled identity exposure, facilitator-governed release, and verifiable public
            records reduce what becomes visible, when, and to whom — without claiming the operator
            sees nothing.
          </p>
          <p className="mt-6 mb-0 max-w-[36rem] border-l-2 border-[color:var(--color-border-medium)] pl-4 text-sm leading-relaxed text-ink-faint">
            Documented limits apply: not full platform zero-knowledge, not Signal-grade E2E today.{' '}
            <Link
              to="/security#reviewers"
              className="text-brand no-underline underline-offset-4 hover:underline"
            >
              Inspect the boundary →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
