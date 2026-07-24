import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  primaryUseCases,
  secondaryUseCases,
  USE_CASE_ARCHITECTURE_LINE,
} from '../../data/useCases';
import { CTA } from '../../data/siteMessaging';
import {
  CTABlock,
  MarketingPageHero,
  ProcessDoctrine,
  SecondaryUseCaseRow,
  UseCaseCard,
} from '../../components/shared';
import { GovernedPanel } from '../../components/motion';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

/**
 * Use cases — tri-modal buyer page: three equal primary tracks + calm secondary contexts.
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
        lead="Foundations, peacebuilders, and HR teams use the same privacy-first deliberation infrastructure for different kinds of sensitive decisions — private rooms, facilitator-governed release, approved outcomes only."
        meta={
          <aside
            className="max-w-xl border border-line bg-surface-sunken/40 px-4 py-4 md:px-5"
            aria-label="Shared architecture"
          >
            <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
              Shared backbone
            </p>
            <p className="mt-2 mb-0 font-mono text-sm tracking-wide text-ink">
              {USE_CASE_ARCHITECTURE_LINE}
            </p>
            <div className="mt-4">
              <ProcessDoctrine compact />
            </div>
          </aside>
        }
      />

      <section
        className="scroll-mt-20 border-b border-line py-12 md:py-16"
        aria-labelledby="primary-tracks-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <h2 id="primary-tracks-h" className="sr-only">
            Primary buyer tracks
          </h2>
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6 xl:gap-8">
            {primaryUseCases.map((uc, i) => (
              <div key={uc.id} id={uc.id} className="scroll-mt-20">
                <GovernedPanel className="h-full" delay={i * 0.04}>
                  <UseCaseCard {...uc} />
                </GovernedPanel>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 py-14 md:py-16"
        aria-labelledby="additional-tracks-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <h2 id="additional-tracks-h" className="font-display text-h2 font-medium text-ink">
            Additional tracks
          </h2>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-secondary">
            Adjacent contexts that reuse the same verified deliberation template — not separate
            products.
          </p>
          <ul className="mt-8 m-0 list-none divide-y divide-line border-y border-line p-0">
            {secondaryUseCases.map((uc) => (
              <SecondaryUseCaseRow key={uc.id} {...uc} />
            ))}
          </ul>
          <p className="mt-8 mb-0 text-sm text-ink-faint">
            <Link to="/how-it-works" className="underline-offset-4 hover:underline">
              {CTA.secondaryProcess}
            </Link>
          </p>
        </div>
      </section>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.pilotBody}
        secondaryLabel={CTA.secondaryProcess}
        secondaryHref={CTA.secondaryProcessHref}
      />
    </div>
  );
}
