import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { primaryUseCases, secondaryUseCases } from '../../data/useCases';
import { CTA } from '../../data/siteMessaging';
import {
  CTABlock,
  MarketingPageHero,
  SecondaryUseCaseRow,
  SectionLabel,
  UseCaseCard,
  UseCasesBackboneStrip,
} from '../../components/shared';
import { GovernedPanel } from '../../components/motion';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

/**
 * Use cases — state the backbone once, then prove it per buyer track.
 */
export function UseCasesPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace(/^#/, '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <div>
      <MarketingPageHero
        label="Buyer tracks"
        title="Who SquadRidge serves"
        lead="Foundations, peacebuilders, and HR teams run sensitive decisions on one spine: private room, facilitator gate, approved record."
        slim
      />

      <section
        className="scroll-mt-20 border-y border-line py-16 md:py-20"
        aria-labelledby="backbone-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="max-w-measure">
            <SectionLabel className="!mb-2">Shared backbone</SectionLabel>
            <h2
              id="backbone-h"
              className="mt-0 font-display text-h2 font-medium tracking-tight text-ink"
            >
              Private room → facilitator gate → approved record
            </h2>
            <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
              The room stays private. Only an approved record can leave — so institutions can cite
              an outcome without publishing the deliberation that produced it.
            </p>
          </div>
          <div className="mt-10 md:mt-12">
            <UseCasesBackboneStrip />
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 py-16 md:py-20"
        aria-labelledby="primary-tracks-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="max-w-measure">
            <SectionLabel className="!mb-2">Primary tracks</SectionLabel>
            <h2
              id="primary-tracks-h"
              className="mt-0 font-display text-h2 font-medium tracking-tight text-ink"
            >
              Three institutional problems
            </h2>
          </div>
          <div className="mt-10 flex flex-col gap-10 md:mt-12 md:gap-12">
            {primaryUseCases.map((uc, i) => (
              <div key={uc.id} id={uc.id} className="scroll-mt-24">
                <GovernedPanel delay={i * 0.03}>
                  <UseCaseCard {...uc} />
                </GovernedPanel>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 border-t border-line py-16 md:py-20"
        aria-labelledby="adjacent-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="max-w-measure">
            <SectionLabel className="!mb-2">Adjacent contexts</SectionLabel>
            <h2
              id="adjacent-h"
              className="mt-0 font-display text-h3 font-medium tracking-tight text-ink"
            >
              Also a natural fit
            </h2>
          </div>
          <ul className="mt-8 m-0 grid list-none gap-8 p-0 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-8">
            {secondaryUseCases.map((uc) => (
              <SecondaryUseCaseRow key={uc.id} {...uc} />
            ))}
          </ul>
        </div>
      </section>

      <CTABlock
        headline="Request a private pilot briefing"
        body="Manual review. Invite-only. No open self-serve."
        secondaryLabel={CTA.secondaryProcess}
        secondaryHref={CTA.secondaryProcessHref}
      />
    </div>
  );
}
