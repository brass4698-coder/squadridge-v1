import { Link } from 'react-router-dom';
import { howItWorksVignette } from '../../data/howItWorksVignette';
import { PRODUCT_MECHANICS } from '../../data/institutionalHome';
import { workflows } from '../../data/workflows';
import { CTA, SITE_THESIS } from '../../data/siteMessaging';
import {
  ProcessDiagram,
  SessionLedgerSchematic,
  InstitutionalSplit,
} from '../../components/institutional';
import {
  CTABlock,
  EvaluatorPath,
  MarketingSection,
  SectionLabel,
  WorkflowSection,
} from '../../components/shared';

export function HowItWorksPage() {
  return (
    <div>
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Process overview" />
          <h1 className="font-display text-h1 font-medium tracking-tight text-ink">
            Four stages. One protected process.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary md:text-[1.05rem]">
            {SITE_THESIS} Every session follows the same gated lifecycle — eligibility, protected
            written dialogue under your control, explicit approval, then a released ledger outcome.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-line bg-surface-sunken/30 !py-14">
        <div className="mx-auto max-w-6xl">
          <SessionLedgerSchematic />
        </div>
      </MarketingSection>

      <section
        className="border-t border-line bg-surface-sunken/40 px-6 py-[var(--space-section)] md:px-8 lg:px-12"
        aria-labelledby="vignette-heading"
      >
        <div className="mx-auto max-w-6xl">
          <SectionLabel text={howItWorksVignette.eyebrow} />
          <h2
            id="vignette-heading"
            className="font-display max-w-2xl text-h2 font-medium tracking-tight text-ink"
          >
            {howItWorksVignette.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            {howItWorksVignette.lede}
          </p>

          <ol className="mt-10 grid gap-px border border-line bg-line md:grid-cols-2">
            {howItWorksVignette.steps.map((step) => (
              <li key={step.label} className="bg-surface-elevated p-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-ink-faint">{step.label}</span>
                  <span className="border border-line bg-surface-sunken px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-ink-faint">
                    {step.stage}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 border border-line bg-surface-elevated px-5 py-4">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-faint">
              What gets released
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {howItWorksVignette.outcome}{' '}
              <Link to="/ledger" className="text-ink underline-offset-4 hover:underline">
                See the record format
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section
        className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12"
        aria-label="Session lifecycle stages"
      >
        <div className="mx-auto max-w-6xl">
          <SectionLabel text="Lifecycle stages" />
          <h2 className="font-display max-w-2xl text-h2 font-medium tracking-tight text-ink">
            Configure → Verify → Facilitate → Release
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            Every session follows these four stages. Transitions are gated — you cannot skip
            verification or publish without recorded approvals. Process authority stays with you.
          </p>
          <div className="mt-12">
            <ProcessDiagram steps={PRODUCT_MECHANICS} />
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface-sunken/40 px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <SectionLabel text="Room and record" />
          <h2 className="font-display max-w-2xl text-h2 font-medium tracking-tight text-ink">
            What stays inside. What gets released.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            The outcome is authored for release. There is no dialogue transcript to publish or
            withhold — only the approved record leaves the room, when you decide it should.
          </p>
          <div className="mt-10">
            <InstitutionalSplit />
          </div>
        </div>
      </section>

      <section
        className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12"
        aria-label="Session workflows"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-16">
          <div className="max-w-3xl">
            <SectionLabel text="Workflows" />
            <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
              Three workflows, in order.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary md:text-base">
              The four stages map to three product workflows:{' '}
              <strong className="font-medium text-ink">Setup</strong> (Configure + Verify),{' '}
              <strong className="font-medium text-ink">Facilitation</strong> (Facilitate), and{' '}
              <strong className="font-medium text-ink">Release</strong> (Release). Your process
              control is maintained throughout.
            </p>
          </div>
          {workflows.map((workflow) => (
            <WorkflowSection key={workflow.label} {...workflow} />
          ))}
        </div>
      </section>

      <section className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Inside the room" />
          <h2 className="font-display text-h2 font-medium tracking-tight text-ink">
            A facilitator-led messaging room.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary">
            Structured, text-based dialogue under your control — not a video call or open chat.
            Written messages give every party time to weigh their words and keep the process
            disciplined.
          </p>
          <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-2">
            <div className="bg-surface-elevated p-6">
              <h3 className="text-sm font-semibold text-ink">Facilitator-led rounds</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                You open the room, set prompts, and manage flow. Participants contribute in writing;
                dialogue stays in the protected room until an outcome is drafted for release.
              </p>
            </div>
            <div className="bg-surface-elevated p-6">
              <h3 className="text-sm font-semibold text-ink">
                Messaging only — no published transcript
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                SquadRidge does not host calls, capture audio or video, or publish session dialogue.
                Only the outcome you approve is released, carrying a verification anchor.{' '}
                <Link
                  to="/security#verification-anchor"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  What the anchor proves
                </Link>{' '}
                ·{' '}
                <Link to="/security" className="text-ink underline-offset-4 hover:underline">
                  Storage and honest limits
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingSection className="!py-12">
        <div className="mx-auto max-w-6xl">
          <EvaluatorPath current="understand" />
        </div>
      </MarketingSection>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.pilotBody}
        secondaryLabel="See a sample record"
        secondaryHref="/ledger"
      />
    </div>
  );
}
