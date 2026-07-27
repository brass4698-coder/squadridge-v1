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
      className="sr-section-enter scroll-mt-20 bg-surface-secondary/80 pb-16 pt-14 md:pb-20 md:pt-16"
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
            Private room → release gate → public record
          </h2>
          <p className="mt-3 mb-0 text-base leading-relaxed text-ink-secondary">
            Three stages, each with an owner and an exit condition. The conversation stays enclosed;
            only approved text can leave.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-faint">
            {USE_CASE_ARCHITECTURE_LINE}.
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
