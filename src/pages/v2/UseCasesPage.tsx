import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  primaryUseCases,
  secondaryUseCases,
  USE_CASE_ARCHITECTURE_LINE,
  USE_CASE_VIGNETTES,
} from '../../data/useCases';
import { CTA, PILOT_FIT_STRONG } from '../../data/siteMessaging';
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
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * Use cases — state the backbone once, then prove it per buyer track.
 */
export function UseCasesPage() {
  usePageTitle('Use cases');
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
        lead={
          <>
            <p>
              Private deliberation with facilitator-governed release — shown across three primary
              and two adjacent contexts (five bounded settings).
            </p>
            <p className="mt-3 mb-0 text-sm text-ink-faint">
              Same pattern throughout: room stays closed; only the approved outcome can leave. For
              the process spine and room guarantees, see{' '}
              <Link
                to="/how-it-works"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                How it works
              </Link>
              .
            </p>
          </>
        }
        slim
      />

      <section
        className="scroll-mt-20 border-t border-line py-16 md:py-20"
        aria-labelledby="backbone-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="max-w-measure">
            <SectionLabel className="!mb-2">Shared backbone</SectionLabel>
            <h2
              id="backbone-h"
              className="mt-0 font-heading text-h2 font-semibold tracking-tight text-ink"
            >
              {USE_CASE_ARCHITECTURE_LINE}
            </h2>
            <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
              Invite-only entry, facilitator authority, recorded approvals, and a released
              instrument that excludes the room itself.
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
              className="mt-0 font-heading text-h2 font-semibold tracking-tight text-ink"
            >
              Three primary tracks
            </h2>
            <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
              Each track uses the same architecture — different matter class, same release
              discipline. Two adjacent contexts follow below.
            </p>
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
        id="vignettes"
        className="scroll-mt-20 bg-surface-secondary/80 py-16 md:py-20"
        aria-labelledby="vignettes-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="max-w-measure">
            <SectionLabel className="!mb-2">Composite outcomes</SectionLabel>
            <h2
              id="vignettes-h"
              className="mt-0 font-heading text-h2 font-semibold tracking-tight text-ink"
            >
              What a bounded pilot can look like
            </h2>
            <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
              Anonymized composites for diligence — illustrative specimens, not live traction.
              Participant counts and timelines mirror the Strong fit criteria on{' '}
              <Link to="/request-access" className="text-brand underline-offset-2 hover:underline">
                Request pilot access
              </Link>
              . Self-select against Not a fit before applying.
            </p>
            <ul className="mt-4 m-0 list-none space-y-1.5 p-0 text-xs text-ink-faint">
              {PILOT_FIT_STRONG.map((line) => (
                <li key={line} className="flex gap-2">
                  <span aria-hidden className="text-brand">
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <ul className="mt-10 m-0 grid list-none gap-4 p-0 lg:grid-cols-2">
            {USE_CASE_VIGNETTES.map((v) => (
              <li
                key={v.id}
                className="rounded-[var(--sr-radius-lg)] border border-line bg-surface-elevated p-5"
              >
                <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                  {v.sector}
                </p>
                <h3 className="mt-2 mb-0 text-sm font-semibold text-ink">{v.vignetteTitle}</h3>
                <p className="mt-3 mb-0 text-xs text-ink-secondary">
                  <span className="font-medium text-ink">Participants: </span>
                  {v.participants}
                </p>
                <p className="mt-1 mb-0 text-xs text-ink-secondary">
                  <span className="font-medium text-ink">Timeline: </span>
                  {v.timeline}
                </p>
                <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">{v.outcome}</p>
                <div className="mt-4 border-t border-line pt-3">
                  <p className="m-0 text-xs font-medium text-ink">Not a fit if you need…</p>
                  <ul className="mt-2 m-0 list-none space-y-1.5 p-0 text-xs text-ink-faint">
                    {v.notFitHints.map((hint) => (
                      <li key={hint} className="flex gap-2">
                        <span aria-hidden>·</span>
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/request-access#fit-heading"
                    className="mt-3 inline-block text-xs font-medium text-brand underline-offset-2 hover:underline"
                  >
                    Full Strong fit / Not a fit list →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="scroll-mt-20 py-16 md:py-20"
        aria-labelledby="adjacent-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="max-w-measure">
            <SectionLabel className="!mb-2">Adjacent contexts</SectionLabel>
            <h2
              id="adjacent-h"
              className="mt-0 font-heading text-h3 font-semibold tracking-tight text-ink"
            >
              Two adjacent contexts
            </h2>
            <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
              Natural extensions of the same model — not a second track system. Together with the
              three primary tracks: five bounded contexts.
            </p>
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
        statusLine={CTA.pilotStatusLineShort}
      />
    </div>
  );
}
