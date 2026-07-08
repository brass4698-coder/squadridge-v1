import { faqFull } from '../../data/faqFull';
import { CTABlock, FAQAccordion, MarketingSection, SectionLabel } from '../../components/shared';

export function FaqPage() {
  return (
    <div className="bg-surface">
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel text="Questions" />
          <h1 className="mb-3 text-h1 text-ink">Frequently asked</h1>
          <p className="text-sm text-ink-secondary">
            Everything we answer before a pilot intake call. The homepage shows the five most common
            questions.
          </p>
        </div>
      </MarketingSection>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <FAQAccordion items={faqFull} />
        </div>
      </section>

      <CTABlock headline="Still have questions? Request a pilot intake call." />
    </div>
  );
}
