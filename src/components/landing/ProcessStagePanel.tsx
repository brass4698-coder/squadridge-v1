import { Link } from 'react-router-dom';
import { SystemModelSequence } from '../institutional/SystemModelSequence';
import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import { USE_CASE_ARCHITECTURE_LINE } from '../../data/useCases';

/**
 * Homepage process module — governed sequence walkthrough (one stage at a time).
 */
export function ProcessStagePanel() {
  return (
    <section
      id="system-model"
      className="scroll-mt-20 border-b border-line bg-[color:var(--sr-bg-sunken)]/50 pb-16 pt-14 md:pb-20 md:pt-16"
      data-scroll-section
      aria-labelledby="process-stages-h"
    >
      <div className={publicShellInnerClass}>
        <div className="max-w-[36rem]">
          <SectionLabel className="!mb-2">Governed sequence</SectionLabel>
          <h2
            id="process-stages-h"
            className="mt-0 font-heading text-h2 font-semibold leading-tight tracking-tight text-ink"
          >
            Private room → release gate → public ledger
          </h2>
          <p className="mt-3 mb-0 text-base leading-relaxed text-ink-secondary">
            How a private mediation becomes a publicly verifiable outcome — without publishing the
            conversation.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-faint">
            {USE_CASE_ARCHITECTURE_LINE}. Each transition has an owner, a boundary, and an exit
            condition.
          </p>
        </div>

        <div className="mt-10 md:mt-12">
          <SystemModelSequence interactive />
        </div>

        <Link
          to="/how-it-works"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          Official process →
        </Link>
      </div>
    </section>
  );
}
