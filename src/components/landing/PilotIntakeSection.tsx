import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CTA, PILOT_FIT_STRONG } from '../../data/siteMessaging';
import { SectionLabel } from '../SectionLabel';
import { IntakeSteps } from '../ProcessStep';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * CTA-led close — selective, calm, human-reviewed.
 */
export function PilotIntakeSection() {
  return (
    <section
      id="pilot"
      className="scroll-mt-20 border-t border-line py-16 md:py-24"
      data-scroll-section
      aria-labelledby="pilot-h"
    >
      <div className={publicShellInnerClass}>
        <div className="mx-auto max-w-[40rem]">
          <SectionLabel className="!mb-2">Pilot intake</SectionLabel>
          <h2
            id="pilot-h"
            className="mt-0 max-w-[18ch] font-display text-h2 font-medium leading-tight tracking-tight text-ink"
          >
            {CTA.pilotHeadline}
          </h2>
          <p className="mt-4 mb-0 max-w-[34rem] text-sm font-medium leading-relaxed text-ink">
            {CTA.pilotValueLine}
          </p>
          <p className="mt-3 mb-0 max-w-[32rem] text-sm leading-relaxed text-ink-secondary">
            {CTA.pilotBody}
          </p>

          <div className="mt-10 rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated px-5 py-6 md:px-7 md:py-7">
            <p className="mb-5 m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              How intake works
            </p>
            <IntakeSteps
              steps={[
                { number: '01', label: 'Manual review of operational fit' },
                { number: '02', label: 'Diligence conversation with your team' },
                { number: '03', label: 'Co-designed pilot scope — not self-serve signup' },
              ]}
            />
          </div>

          <div className="mt-8 rounded-[var(--sr-radius-md)] border border-line bg-surface-sunken/40 px-5 py-5">
            <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              Strong fit signals
            </p>
            <ul className="mt-3 mb-0 list-none space-y-2 p-0 text-sm leading-relaxed text-ink-secondary">
              {PILOT_FIT_STRONG.slice(0, 3).map((line) => (
                <li key={line} className="pl-0">
                  · {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="sr-cta-row mt-10">
            <Link to={CTA.primaryHref} className="btn-institutional btn-institutional--primary">
              {CTA.primaryLabel}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link
              to={CTA.secondaryBriefingHref}
              className="btn-institutional btn-institutional--ghost"
            >
              {CTA.secondaryBriefingLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
