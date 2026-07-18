import { useCases } from '../../data/useCases';
import { CTA, SITE_THESIS } from '../../data/siteMessaging';
import {
  CTABlock,
  EvaluatorPath,
  MarketingSection,
  SectionLabel,
  UseCaseCard,
} from '../../components/shared';

export function UseCasesPage() {
  return (
    <div>
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Operational contexts" />
          <h1 className="font-display text-h1 font-medium tracking-tight text-ink">
            Where protected dialogue and a credible record both matter.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-ink-secondary md:text-base">
            {SITE_THESIS} Each scenario below follows the same architecture: structured written
            dialogue in a private room under your control, facilitator-gated release, verifiable
            public outcome.
          </p>
          <p className="mt-4 text-xs leading-relaxed text-ink-faint">
            Flagship practice context: civil mediation with a releasable agreement. Additional
            contexts show the same model applied elsewhere — not a generic “conflict app.”
          </p>
        </div>
      </MarketingSection>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-px border border-line bg-line md:grid-cols-2">
          {useCases.map((useCase) => (
            <div key={useCase.title} className="bg-surface">
              <UseCaseCard {...useCase} />
            </div>
          ))}
        </div>
      </section>

      <MarketingSection className="!py-12">
        <div className="mx-auto max-w-6xl">
          <EvaluatorPath current="fit" />
        </div>
      </MarketingSection>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.pilotBody}
        secondaryLabel={CTA.secondaryProcess}
        secondaryHref={CTA.secondaryProcessHref}
      />
    </div>
  );
}
