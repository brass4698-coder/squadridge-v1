import { Link } from 'react-router-dom';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Named privacy doctrine — caveats live in a labeled Security note, not competing with the claim.
 */
export function PrivacyByBoundary() {
  return (
    <section
      className="sr-section-enter border-b border-[color:var(--color-border-subtle)] py-16 md:py-20"
      data-scroll-section
      aria-labelledby="privacy-boundary-h"
    >
      <div className={publicShellInnerClass}>
        <div className="grid max-w-[48rem] gap-8">
          <div className="max-w-[40rem]">
            <SectionLabel className="!mb-2">Privacy doctrine</SectionLabel>
            <h2
              id="privacy-boundary-h"
              className="mt-0 font-display text-[1.75rem] font-medium leading-tight tracking-tight text-ink md:text-[2rem]"
            >
              Privacy by boundary, not by broadcast.
            </h2>
            <p className="mt-5 mb-0 text-base leading-relaxed text-ink-secondary">
              Controlled identity exposure, facilitator-governed release, and verifiable public
              records reduce what becomes visible, when, and to whom — without claiming the operator
              sees nothing.
            </p>
          </div>

          <aside
            className="max-w-[36rem] rounded-[var(--sr-radius-md)] border border-line bg-surface-sunken/60 px-5 py-4"
            aria-label="Security note"
          >
            <p className="m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              Security note
            </p>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
              Documented limits apply: not full platform zero-knowledge, not Signal-grade E2E today.{' '}
              <Link
                to="/security#reviewers"
                className="font-medium text-brand no-underline underline-offset-4 hover:underline"
              >
                Inspect the boundary →
              </Link>
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
