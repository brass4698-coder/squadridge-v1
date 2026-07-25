import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  primaryUseCases,
  secondaryUseCases,
  USE_CASE_ARCHITECTURE_LINE,
} from '../../data/useCases';
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
    <div data-page="use-cases">
      <MarketingPageHero
        label="Buyer tracks"
        title="Where the model fits"
        lead="Foundations, peacebuilders, and HR teams — one governed process, many environments. The niche is tight; the applications compound."
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
              {USE_CASE_ARCHITECTURE_LINE}
            </h2>
            <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
              Stated once here as buyer context. The homepage shows the interactive model; Security
              holds the threat bounds.
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
        headline={CTA.pilotHeadline}
        body={CTA.closeUseCases}
        secondaryLabel={CTA.secondaryProcess}
        secondaryHref={CTA.secondaryProcessHref}
      />
    </div>
  );
}
