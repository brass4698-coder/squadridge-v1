import { faqFull } from '../../data/faqFull';
import { CTA } from '../../data/siteMessaging';
import { TrustBoundarySchematic } from '../../components/institutional';
import {
  CTABlock,
  EvaluatorPath,
  FAQAccordion,
  MarketingSection,
  SectionLabel,
} from '../../components/shared';

export function FaqPage() {
  return (
    <div>
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="For mediators" />
          <h1 className="font-display text-h1 font-medium tracking-tight text-ink">
            Questions mediators ask before a pilot.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-ink-secondary">
            Direct answers for professional mediators and facilitation teams — including what
            SquadRidge is not (surveillance, monitoring, open chat, a replacement for your craft).
            The homepage shows the six highest-priority questions.
          </p>
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-line bg-surface-sunken/30 !py-14">
        <div className="mx-auto max-w-6xl">
          <TrustBoundarySchematic />
        </div>
      </MarketingSection>

      <section className="border-t border-line px-6 pb-12 md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <FAQAccordion items={faqFull} />
        </div>
      </section>

      <MarketingSection className="!py-12">
        <div className="mx-auto max-w-6xl">
          <EvaluatorPath current="trust" />
        </div>
      </MarketingSection>

      <CTABlock headline={CTA.pilotHeadline} body={CTA.pilotBody} />
    </div>
  );
}
