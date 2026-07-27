import { faqFull } from '../../data/faqFull';
import { CTA } from '../../data/siteMessaging';
import { CTABlock, FAQAccordion, MarketingPageHero, ShellWidth } from '../../components/shared';
import { usePageTitle } from '../../hooks/usePageTitle';

/** FAQ — dense instrument, no decorative schematic or journey kit. */
export function FaqPage() {
  usePageTitle('FAQ');
  return (
    <div>
      <MarketingPageHero
        slim
        label="For mediators"
        title="Questions before a pilot"
        lead="Direct answers — including what SquadRidge is not: surveillance, open chat, or a replacement for professional judgment."
      />

      <section className="scroll-mt-20 border-t border-line py-12 md:py-14" data-scroll-section>
        <ShellWidth>
          <div className="max-w-measure text-left">
            <FAQAccordion items={faqFull} />
          </div>
        </ShellWidth>
      </section>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.closeFaq}
        secondaryLabel={CTA.secondarySecurity}
        secondaryHref={CTA.secondarySecurityHref}
        statusLine={CTA.pilotStatusLineShort}
      />
    </div>
  );
}
