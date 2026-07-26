import { Link } from 'react-router-dom';
import { howItWorksVignette } from '../../data/howItWorksVignette';
import { PRODUCT_MECHANICS } from '../../data/institutionalHome';
import { CTA, SITE_THESIS_SHORT } from '../../data/siteMessaging';
import { USE_CASE_ARCHITECTURE_LINE } from '../../data/useCases';
import { InstitutionalSplit } from '../../components/institutional';
import {
  CapsLabel,
  CTABlock,
  EvaluationPathCards,
  GlossTerm,
  StickySpineNav,
  type EvaluationPath,
} from '../../components/shared';
import { ContentColumn } from '../../components/ContentColumn';
import { ProcessStep } from '../../components/ProcessStep';
import { SectionLabel } from '../../components/SectionLabel';
import { GovernedPanel } from '../../components/motion';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { usePageTitle } from '../../hooks/usePageTitle';

const SPINE_STAGES = PRODUCT_MECHANICS.map((step) => ({
  id: `spine-${step.title.toLowerCase()}`,
  label: step.title,
}));

const EVALUATION_PATHS: EvaluationPath[] = [
  {
    label: 'Pilot evaluation',
    href: CTA.primaryHref,
    body: 'Scoped private pilot on a real matter class — process walkthrough, not open signup.',
    cta: 'Start pilot intake',
  },
  {
    label: 'Security review',
    href: CTA.secondarySecurityHref,
    body: 'Documented limits, operator bounds, and what the integrity anchor does — and does not — prove.',
    cta: 'Inspect security boundary',
  },
  {
    label: 'Operational fit',
    href: CTA.secondaryUseCasesHref,
    body: 'Where this architecture applies for foundations, mediators, and institutional teams — and where it does not.',
    cta: 'Review buyer tracks',
  },
];

function examplesForStage(stage: string) {
  return howItWorksVignette.steps.filter((s) => s.stage === stage);
}

/**
 * How it works — official process artifact: private room → gate → approved record.
 */
export function HowItWorksPage() {
  usePageTitle('How it works');

  return (
    <div className="sr-process-artifact" data-page="how-it-works">
      <header
        className="sr-section-enter scroll-mt-20 border-b border-line pt-14 pb-10 md:pt-16 md:pb-12"
        data-demo="how-it-works-spine"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end lg:gap-16">
            <div>
              <SectionLabel>Process</SectionLabel>
              <h1 className="mt-0 max-w-[18ch] font-heading text-display font-semibold text-ink">
                Configure. Verify. Facilitate. Release.
              </h1>
              <p className="mt-4 mb-0 max-w-[36ch] text-base leading-relaxed text-ink-secondary">
                How a private mediation becomes a publicly verifiable outcome.
              </p>
              <p className="mt-3 mb-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                {USE_CASE_ARCHITECTURE_LINE}
              </p>
            </div>
            <div className="max-w-prose">
              <p className="m-0 text-base leading-relaxed text-ink-secondary">
                A small, verified group of relevant participants. Structured written rounds.
                Facilitator-controlled release. You cannot skip verification or publish without
                recorded approvals.
              </p>
              <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-faint">
                {SITE_THESIS_SHORT}
              </p>
            </div>
          </div>
        </div>
      </header>

      <StickySpineNav stages={SPINE_STAGES} aria-label="Configure through Release" />

      <section
        className="scroll-mt-20 border-b border-line py-14 md:py-16"
        aria-labelledby="spine-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="mb-10 max-w-measure">
            <SectionLabel>Spine</SectionLabel>
            <h2 id="spine-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              One vertical process
            </h2>
            <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
              Each stage has an owner, a gate posture, and an exit condition. The approved record
              appears only after Release — never as a live feed of the room. Room guarantees and the
              private/public boundary are explained once in{' '}
              <a
                href="#room-record"
                className="text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
              >
                Inside the room vs. the approved record
              </a>
              .
            </p>
          </div>

          <ol className="sr-process-spine m-0 list-none p-0">
            {PRODUCT_MECHANICS.map((step, index) => {
              const examples = examplesForStage(step.title);
              const stageId = `spine-${step.title.toLowerCase()}`;
              return (
                <li key={step.step} id={stageId} className="sr-process-spine__item scroll-mt-28">
                  <GovernedPanel delay={index * 0.04}>
                    <ProcessStep
                      number={step.step}
                      phase={step.title}
                      title={step.summary}
                      gateState={step.gateState}
                      exitCondition={step.exitCondition}
                    >
                      <p className="m-0">{step.body}</p>
                      {examples.length > 0 ? (
                        <details className="group mt-5 rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated open:bg-surface-elevated">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-surface-sunken/40 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--sr-primary)] motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
                            <span>
                              Worked example
                              <span className="ml-2 font-mono text-[length:var(--text-label)] font-normal text-ink-faint">
                                {examples.length} step{examples.length === 1 ? '' : 's'}
                              </span>
                            </span>
                            <span
                              aria-hidden
                              className="shrink-0 font-mono text-sm leading-none text-ink-faint transition-transform duration-200 ease-[var(--sr-ease-governed)] group-open:rotate-45 motion-reduce:transition-none"
                            >
                              +
                            </span>
                          </summary>
                          <div className="border-t border-line px-4 pb-4 pt-3">
                            <ol className="m-0 list-none space-y-4 p-0">
                              {examples.map((ex) => (
                                <li key={ex.title}>
                                  <p className="m-0 text-sm font-semibold text-ink">{ex.title}</p>
                                  <p className="mt-1.5 mb-0 text-sm leading-relaxed text-ink-secondary">
                                    <VignetteBody text={ex.body} />
                                  </p>
                                </li>
                              ))}
                            </ol>
                          </div>
                        </details>
                      ) : null}
                    </ProcessStep>
                  </GovernedPanel>
                </li>
              );
            })}
          </ol>

          <p className="mt-10 mb-0 max-w-prose border-l-2 border-[color:var(--sr-mode-gate-border,var(--sr-line-strong))] pl-5 text-sm leading-relaxed text-ink-secondary">
            <span className="font-medium text-ink">Released: </span>
            {howItWorksVignette.outcome}{' '}
            <Link
              to="/ledger"
              className="text-ink-secondary no-underline underline-offset-4 hover:text-ink hover:underline"
            >
              Record format
            </Link>
          </p>
        </div>
      </section>

      <section
        id="room-record"
        className="scroll-mt-20 bg-[color:var(--sr-bg-sunken)] py-14 md:py-16"
        data-scroll-section
        aria-labelledby="room-record-h"
        data-demo="how-it-works-guarantees"
      >
        <ContentColumn wide>
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
            <div>
              <CapsLabel className="mb-2">Room · gate · record</CapsLabel>
              <h2 id="room-record-h" className="m-0 font-heading text-h2 font-semibold text-ink">
                Inside the room vs. the approved record
              </h2>
            </div>
            <Link
              to="/security"
              className="shrink-0 text-sm text-ink-secondary no-underline underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {CTA.secondarySecurity} →
            </Link>
          </div>
          <p className="mb-8 max-w-prose text-sm leading-relaxed text-ink-secondary">
            The canonical boundary for this page: no auto-publishing, verification before entry, and
            deliberate release only. Dialogue never becomes a public record by timer, webhook, or
            default — and the platform cannot release unilaterally.
          </p>
          <InstitutionalSplit />
          <p className="mt-6 mb-0 max-w-prose text-sm leading-relaxed text-ink-faint">
            For facilitators: the live room is the product surface — structured rounds and pacing —
            while consensus is authored after dialogue and only approved fields can leave. Full
            threat bounds live on{' '}
            <Link
              to="/security"
              className="text-ink-secondary no-underline underline-offset-4 hover:text-ink hover:underline"
            >
              Security
            </Link>
            .
          </p>
        </ContentColumn>
      </section>

      <section
        className="scroll-mt-20 border-b border-line py-12 md:py-14"
        aria-labelledby="evaluate-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="mb-8 max-w-measure">
            <SectionLabel>Next step</SectionLabel>
            <h2 id="evaluate-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Institutional evaluation
            </h2>
            <p className="mt-3 mb-0 text-sm leading-relaxed text-ink-secondary">
              Three diligence paths — not a marketing funnel. Choose the one that matches your
              review stage.
            </p>
          </div>
          <EvaluationPathCards paths={EVALUATION_PATHS} />
        </div>
      </section>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.closeHowItWorks}
        secondaryLabel={CTA.secondarySecurity}
        secondaryHref={CTA.secondarySecurityHref}
        statusLine={CTA.pilotStatusLineShort}
      />
    </div>
  );
}

/** Light inline glosses for technical terms that appear in vignette copy. */
function VignetteBody({ text }: { text: string }) {
  const parts = text.split(/(bearer secrets|codenames|ledger_sha|canonicalised)/g);
  return (
    <>
      {parts.map((part, i) => {
        switch (part) {
          case 'bearer secrets':
            return <GlossTerm key={i} term="bearer-secret" />;
          case 'codenames':
            return <GlossTerm key={i} term="codename" />;
          case 'ledger_sha':
            return (
              <GlossTerm key={i} term="ledger-sha">
                <span className="font-mono">ledger_sha</span>
              </GlossTerm>
            );
          case 'canonicalised':
            return <GlossTerm key={i} term="canonicalised" />;
          default:
            return <span key={i}>{part}</span>;
        }
      })}
    </>
  );
}
