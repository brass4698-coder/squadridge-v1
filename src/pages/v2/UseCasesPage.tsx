import { useCases } from '../../data/useCases';
import { CTABlock, MarketingSection, SectionLabel, UseCaseCard } from '../../components/shared';

export function UseCasesPage() {
  return (
    <div className="bg-surface">
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <SectionLabel text="Applications" />
          <h1 className="mb-4 text-h1 text-ink">Who SquadRidge is built for</h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink-secondary md:text-base">
            Six scenarios where facilitator-led dialogue must stay private and the outcome must be
            credible. Each follows the same shape: structured written dialogue in the room, an
            approved and verifiable record out.
          </p>
        </div>
      </MarketingSection>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {useCases.map((useCase) => (
            <UseCaseCard key={useCase.title} {...useCase} />
          ))}
        </div>
      </section>

      <CTABlock
        headline="See the mechanism behind these scenarios."
        secondaryLabel="See how it works"
        secondaryHref="/how-it-works"
      />
    </div>
  );
}
