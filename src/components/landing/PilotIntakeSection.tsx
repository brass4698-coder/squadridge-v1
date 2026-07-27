import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CTA, INTAKE_REVIEW_TIMING, PARTNER_EVALUATION } from '../../data/siteMessaging';
import { SectionLabel } from '../SectionLabel';
import { IntakeSteps } from '../ProcessStep';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/** Closing intake band — selective, human-reviewed. */
export function PilotIntakeSection() {
  return (
    <section
      id="pilot"
      className="sr-section-enter scroll-mt-20 border-t border-line py-16 md:py-24"
      data-scroll-section
      aria-labelledby="pilot-h"
    >
      <div className={publicShellInnerClass}>
        <div className="mx-auto max-w-[40rem]">
          <SectionLabel className="!mb-2">Pilot intake</SectionLabel>
          <h2
            id="pilot-h"
            className="mt-0 max-w-[18ch] font-heading text-h2 font-semibold leading-tight tracking-tight text-ink"
          >
            {CTA.pilotHeadline}
          </h2>
          <p className="mt-4 mb-0 max-w-[34rem] text-sm font-medium leading-relaxed text-ink">
            {CTA.pilotValueLine}
          </p>
          <p className="mt-3 mb-0 max-w-[32rem] text-sm leading-relaxed text-ink-secondary">
            Tell us the matter class and facilitation context. {INTAKE_REVIEW_TIMING.sentence}
          </p>

          <div className="mt-10 rounded-[var(--sr-radius-xl)] border border-line bg-surface-elevated/80 px-5 py-6 shadow-sr-sm md:px-6">
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

          <div className="sr-form-notice mt-8">
            <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              What a scoped pilot exposes
            </p>
            <ul className="mt-3 mb-0 list-none space-y-2 p-0 text-sm leading-relaxed text-ink-secondary">
              {PARTNER_EVALUATION.slice(0, 4).map((line) => (
                <li key={line} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-brand"
                  />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sr-form-actions mt-10">
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
