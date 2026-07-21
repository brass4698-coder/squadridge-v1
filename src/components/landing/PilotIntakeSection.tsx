import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CTA } from '../../data/siteMessaging';
import { SectionLabel } from '../SectionLabel';
import { IntakeSteps } from '../ProcessStep';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * CTA-led close — selective, calm, human-reviewed.
 */
export function PilotIntakeSection() {
  return (
    <section id="pilot" className="scroll-mt-20 py-20 md:py-28" aria-labelledby="pilot-h">
      <div className={publicShellInnerClass}>
        <div className="mx-auto max-w-[38rem]">
          <SectionLabel className="!mb-3">Pilot intake</SectionLabel>
          <h2
            id="pilot-h"
            className="mt-0 max-w-[18ch] font-display text-[1.75rem] font-medium leading-tight tracking-tight text-ink md:text-[2rem]"
          >
            {CTA.pilotHeadline}
          </h2>
          <p className="mt-5 mb-0 max-w-[32rem] text-sm leading-relaxed text-ink-secondary">
            {CTA.pilotBody}
          </p>

          <div className="mt-10 border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-raised)] px-5 py-6 md:px-7 md:py-7">
            <p className="mb-5 m-0 font-mono text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-caps)] text-[color:var(--color-text-muted)]">
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

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to={CTA.primaryHref} className="btn-institutional btn-institutional--primary">
              {CTA.primaryLabel}
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <Link to="/contact" className="btn-institutional btn-institutional--ghost">
              Request a briefing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
