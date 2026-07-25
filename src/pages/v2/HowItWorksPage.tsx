import { Link } from 'react-router-dom';
import { FACILITATOR_WORKSPACE, howItWorksVignette } from '../../data/howItWorksVignette';
import { PRODUCT_MECHANICS } from '../../data/institutionalHome';
import { CTA } from '../../data/siteMessaging';
import { USE_CASE_ARCHITECTURE_LINE } from '../../data/useCases';
import { InstitutionalSplit } from '../../components/institutional';
import { CapsLabel, CTABlock } from '../../components/shared';
import { ContentColumn } from '../../components/ContentColumn';
import { ProcessStep } from '../../components/ProcessStep';
import { SectionLabel } from '../../components/SectionLabel';
import { GovernedPanel } from '../../components/motion';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { usePageTitle } from '../../hooks/usePageTitle';

const ROOM_GUARANTEES = [
  {
    title: 'No auto-publishing',
    body: 'Dialogue never becomes a public record by timer, webhook, or default.',
  },
  {
    title: 'Verification before entry',
    body: 'Facilitator-defined verification completes before the room opens.',
  },
  {
    title: 'Deliberate release only',
    body: 'Designated approvals plus an explicit release action — nothing else.',
  },
] as const;

/**
 * How it works — operational path source of truth (not another spine illustration).
 */
export function HowItWorksPage() {
  usePageTitle('How it works');

  return (
    <div data-page="how-it-works">
      <header
        className="sr-section-enter scroll-mt-20 border-b border-line pt-16 pb-12 md:pt-20 md:pb-14"
        data-demo="how-it-works-spine"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
            <div>
              <SectionLabel>Process</SectionLabel>
              <h1 className="mt-0 max-w-[16ch] font-display text-display font-medium text-ink">
                Configure. Verify. Facilitate. Release.
              </h1>
              <p className="mt-4 mb-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                {USE_CASE_ARCHITECTURE_LINE}
              </p>
            </div>
            <p className="max-w-prose text-base leading-relaxed text-ink-secondary">
              Transitions are gated. You cannot skip verification or publish without recorded
              approvals. Process authority stays with the facilitator — the operational path below
              is what pilot partners evaluate.
            </p>
          </div>
        </div>
      </header>

      <section
        className="scroll-mt-20 border-b border-line py-16 md:py-20"
        aria-labelledby="spine-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)] lg:gap-14">
            <div>
              <SectionLabel>Spine</SectionLabel>
              <h2 id="spine-h" className="mt-0 font-display text-h2 font-medium text-ink">
                One vertical process
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-secondary">
                Each stage has a clear owner and an exit condition. The approved record only appears
                after Release — never as a live feed of the room.
              </p>
              <div className="mt-10 flex flex-col gap-0 border-l-2 border-line pl-6 md:pl-8">
                {PRODUCT_MECHANICS.map((step, index) => {
                  const titles: Record<string, string> = {
                    Configure: 'Set scope, invites, and release rules',
                    Verify: 'Confirm eligibility before the room opens',
                    Facilitate: 'Run structured written rounds under control',
                    Release: 'Publish only approved outcome text',
                  };
                  return (
                    <GovernedPanel key={step.step} delay={index * 0.04}>
                      <ProcessStep
                        number={step.step}
                        phase={step.title}
                        title={titles[step.title] ?? step.title}
                      >
                        <p className="m-0 leading-relaxed">{step.body}</p>
                        {index < PRODUCT_MECHANICS.length - 1 ? (
                          <CapsLabel className="mt-3">Gate → next stage</CapsLabel>
                        ) : null}
                      </ProcessStep>
                    </GovernedPanel>
                  );
                })}
              </div>
            </div>

            <aside
              data-demo="how-it-works-guarantees"
              className="sr-vault-card h-fit p-5 lg:sticky lg:top-24"
              aria-labelledby="guarantees-h"
            >
              <CapsLabel id="guarantees-h">Room guarantees</CapsLabel>
              <ul className="mt-4 m-0 list-none space-y-4 p-0">
                {ROOM_GUARANTEES.map((g) => (
                  <li key={g.title}>
                    <h3 className="m-0 text-sm font-semibold text-ink">{g.title}</h3>
                    <p className="mt-1.5 mb-0 text-xs leading-relaxed text-ink-secondary">
                      {g.body}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 mb-0 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
                Full threat bounds and technical appendix live on{' '}
                <Link
                  to="/security"
                  className="text-ink-secondary no-underline underline-offset-4 hover:text-ink hover:underline"
                >
                  Security
                </Link>
                .
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 border-b border-line py-16 md:py-20"
        aria-labelledby="vignette-h"
        data-scroll-section
      >
        <ContentColumn>
          <div className="mb-10">
            <SectionLabel>{howItWorksVignette.eyebrow}</SectionLabel>
            <h2 id="vignette-h" className="mt-0 font-display text-h2 font-medium text-ink">
              {howItWorksVignette.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              {howItWorksVignette.lede}
            </p>
          </div>

          <div className="flex flex-col gap-0">
            {howItWorksVignette.steps.map((step, index) => (
              <GovernedPanel key={step.title} delay={Math.min(index * 0.03, 0.12)}>
                <ProcessStep
                  number={String(index + 1).padStart(2, '0')}
                  phase={step.stage}
                  title={step.title}
                >
                  <p className="m-0 leading-relaxed">{step.body}</p>
                </ProcessStep>
              </GovernedPanel>
            ))}
          </div>

          <p className="sr-vault-card mt-10 px-5 py-4 text-sm leading-relaxed text-ink-secondary">
            <span className="font-medium text-ink">Released: </span>
            {howItWorksVignette.outcome}{' '}
            <Link
              to="/ledger"
              className="text-ink-secondary no-underline underline-offset-4 hover:text-ink hover:underline"
            >
              Record format
            </Link>
          </p>
        </ContentColumn>
      </section>

      <section
        id="for-facilitators"
        className="scroll-mt-20 border-b border-line py-16 md:py-20"
        aria-labelledby="facilitators-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="max-w-measure">
            <SectionLabel>For facilitators</SectionLabel>
            <h2
              id="facilitators-h"
              className="mt-0 font-display text-h2 font-medium tracking-tight text-ink"
            >
              The session room is the product surface
            </h2>
            <p className="mt-3 mb-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
              Buyers are usually mediation centres, HR / ombuds offices, foundations, and municipal
              conveners — not end participants. The live control surface is where process authority
              lives; the ledger only receives what you deliberately release.
            </p>
          </div>
          <ul className="mt-10 m-0 grid list-none gap-6 p-0 md:grid-cols-3 md:gap-8">
            {FACILITATOR_WORKSPACE.map((item, i) => (
              <GovernedPanel key={item.title} delay={i * 0.05}>
                <li className="border-t border-line pt-5 list-none">
                  <h3 className="m-0 text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2.5 mb-0 text-sm leading-relaxed text-ink-secondary">
                    {item.body}
                  </p>
                </li>
              </GovernedPanel>
            ))}
          </ul>
        </div>
      </section>

      <section className="scroll-mt-20 bg-surface-sunken/40 py-16 md:py-20" data-scroll-section>
        <ContentColumn wide>
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-h2 font-medium text-ink">
              Inside the room vs. the approved record
            </h2>
            <Link
              to="/security"
              className="text-sm text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {CTA.secondarySecurity} →
            </Link>
          </div>
          <InstitutionalSplit />
        </ContentColumn>
      </section>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.closeHowItWorks}
        secondaryLabel={CTA.secondaryUseCases}
        secondaryHref={CTA.secondaryUseCasesHref}
      />
    </div>
  );
}
