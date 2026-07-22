import { Link } from 'react-router-dom';
import { howItWorksVignette } from '../../data/howItWorksVignette';
import { SITE_THESIS } from '../../data/siteMessaging';
import { CTA } from '../../data/siteMessaging';
import { InstitutionalSplit, SessionLedgerSchematic } from '../../components/institutional';
import { CTABlock } from '../../components/shared';
import { ContentColumn } from '../../components/ContentColumn';
import { ProcessStep } from '../../components/ProcessStep';
import { SectionLabel } from '../../components/SectionLabel';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

/**
 * How it works — one schematic, one vignette, one room/record split.
 * Cut duplicate lifecycle / workflow / "inside the room" re-explanations.
 */
export function HowItWorksPage() {
  return (
    <div>
      <header
        className="border-b border-line pt-16 pb-12 md:pt-20 md:pb-14"
        data-demo="how-it-works-spine"
      >
        <div className={publicShellInnerClass}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
            <div>
              <SectionLabel>Process</SectionLabel>
              <h1 className="mt-0 max-w-[16ch] font-display text-display font-medium text-ink">
                Configure. Verify. Facilitate. Release.
              </h1>
            </div>
            <p className="max-w-prose text-base leading-relaxed text-ink-secondary">
              {SITE_THESIS} Transitions are gated. You cannot skip verification or publish without
              recorded approvals. Process authority stays with the facilitator.
            </p>
          </div>
          <div className="mt-12 border border-line bg-surface-sunken/40 p-4 md:p-6">
            <SessionLedgerSchematic />
          </div>
        </div>
      </header>

      <section className="border-b border-line py-16 md:py-20" aria-labelledby="vignette-h">
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
              <ProcessStep
                key={step.label}
                number={String(index + 1).padStart(2, '0')}
                phase={step.stage}
                title={step.title}
              >
                <p className="m-0 leading-relaxed">{step.body}</p>
              </ProcessStep>
            ))}
          </div>

          <p className="mt-10 border border-[color:var(--color-border-subtle)] bg-[color:var(--color-surface-raised)] px-5 py-4 text-sm leading-relaxed text-ink-secondary">
            <span className="font-medium text-ink">Released: </span>
            {howItWorksVignette.outcome}{' '}
            <Link to="/ledger" className="underline-offset-4 hover:underline">
              Record format
            </Link>
          </p>
        </ContentColumn>
      </section>

      <section className="bg-surface-sunken/50 py-16 md:py-20">
        <ContentColumn wide>
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-h2 font-medium text-ink">
              What stays inside. What gets released.
            </h2>
            <Link
              to="/security"
              className="text-sm text-[color:var(--color-text-secondary)] underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Security boundaries →
            </Link>
          </div>
          <InstitutionalSplit />
        </ContentColumn>
      </section>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.pilotBody}
        secondaryLabel="See a sample record"
        secondaryHref="/ledger"
      />
    </div>
  );
}
