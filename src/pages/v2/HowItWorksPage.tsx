import { Link } from 'react-router-dom';
import { howItWorksVignette } from '../../data/howItWorksVignette';
import { stages } from '../../data/stages';
import { workflows } from '../../data/workflows';
import { privatePublicItems } from '../../data/privatePublicItems';
import {
  CTABlock,
  MarketingSection,
  PrivatePublicSplit,
  SectionLabel,
  StageCard,
  WorkflowSection,
} from '../../components/shared';

export function HowItWorksPage() {
  return (
    <div className="bg-surface">
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="How it works" />
          <h1 className="mt-3 text-h1 text-ink">Four stages. One protected process.</h1>
          <p className="mt-5 text-base leading-relaxed text-ink md:text-lg">
            SquadRidge separates the protected session from the verifiable public record. Start with
            one scenario below — then the lifecycle and the three workflows that implement it in the
            product.
          </p>
        </div>
      </MarketingSection>

      <section
        className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12"
        aria-labelledby="vignette-heading"
      >
        <div className="mx-auto max-w-[1100px]">
          <SectionLabel text={howItWorksVignette.eyebrow} />
          <h2 id="vignette-heading" className="mt-3 text-h2 text-ink">
            {howItWorksVignette.heading}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-secondary">
            {howItWorksVignette.lede}
          </p>

          <ol className="mt-10 grid gap-4 md:grid-cols-2">
            {howItWorksVignette.steps.map((step) => (
              <li
                key={step.label}
                className="rounded-lg border border-line bg-surface-elevated p-6"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-brand">{step.label}</span>
                  <span className="rounded-full border border-line bg-surface-sunken px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-ink-faint">
                    {step.stage}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{step.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8 rounded-lg border border-brand/30 bg-brand-soft px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              What gets released
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {howItWorksVignette.outcome}{' '}
              <Link to="/ledger" className="text-brand hover:underline">
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
        <div className="mx-auto max-w-[1100px]">
          <SectionLabel text="Lifecycle stages" />
          <h2 className="mt-3 text-h2 text-ink">Configure → Verify → Facilitate → Release</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            The scenario above follows these four stages. Every session uses the same lifecycle —
            only the context and outcome text change.
          </p>
          <ol className="relative mt-14 grid gap-8 md:grid-cols-4">
            <div
              aria-hidden
              className="absolute left-6 right-6 top-6 hidden h-px md:block"
              style={{
                background:
                  'linear-gradient(90deg, var(--sr-divider), var(--sr-primary), var(--sr-divider))',
              }}
            />
            {stages.map((stage) => (
              <StageCard
                key={stage.number}
                number={stage.number}
                title={stage.title}
                description={stage.fullDescription}
                variant="full"
              />
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <SectionLabel text="Room and record" />
          <h2 className="mt-3 text-h2 text-ink">What stays inside. What gets released.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            The outcome is authored for release. There is no dialogue transcript to publish or
            withhold — only the approved record leaves the room.
          </p>
          <div className="mt-10 max-w-xl">
            <PrivatePublicSplit
              size="compact"
              privateItems={privatePublicItems.private}
              publicItems={privatePublicItems.public}
            />
          </div>
        </div>
      </section>

      <section
        className="border-t border-line px-6 py-[var(--space-section)] md:px-8 lg:px-12"
        aria-label="Session workflows"
      >
        <div className="mx-auto flex max-w-[1100px] flex-col gap-16">
          <div className="max-w-3xl">
            <SectionLabel text="Workflows" />
            <h2 className="mt-3 text-h2 text-ink">Three workflows, in order.</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary md:text-base">
              The four stages map to three product workflows:{' '}
              <strong className="font-medium text-ink">Setup</strong> (Configure + Verify),{' '}
              <strong className="font-medium text-ink">Facilitation</strong> (Facilitate), and{' '}
              <strong className="font-medium text-ink">Release</strong> (Release). Each step keeps
              facilitator control throughout.
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
          <h2 className="mt-3 text-h2 text-ink">A facilitator-led messaging room.</h2>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary">
            The room is structured, text-based dialogue under facilitator control — not a video
            call, not an open chat app. Written messages give every party time to weigh their words
            and keep the process structured.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface-elevated p-6">
              <h3 className="text-sm font-semibold text-ink">Facilitator-led rounds</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                The facilitator opens the room, sets prompts, and manages the flow. Participants
                contribute in writing; dialogue stays in the protected room until an outcome is
                drafted for release.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-surface-elevated p-6">
              <h3 className="text-sm font-semibold text-ink">
                Messaging only — nothing is published as a transcript
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                SquadRidge does not host calls, capture audio or video, or publish session dialogue.
                Only the facilitator-approved outcome is released, carrying a verification anchor.{' '}
                <Link to="/security#verification-anchor" className="text-brand hover:underline">
                  What the anchor proves
                </Link>{' '}
                ·{' '}
                <Link to="/security" className="text-brand hover:underline">
                  Storage and honest limits
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTABlock
        headline="Ready to run a protected session?"
        secondaryLabel="See a sample record"
        secondaryHref="/ledger"
      />
    </div>
  );
}
