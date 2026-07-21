import { faqFull } from '../../data/faqFull';
import { CTA } from '../../data/siteMessaging';
import { CTABlock, FAQAccordion } from '../../components/shared';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

/** FAQ — dense instrument, no decorative schematic or journey kit. */
export function FaqPage() {
  return (
    <div>
      <header className="border-b border-line pt-16 pb-10 md:pt-20">
        <div className={publicShellInnerClass}>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-faint">
            For mediators
          </p>
          <h1 className="mt-4 max-w-[22ch] font-display text-display font-medium text-ink">
            Questions before a pilot.
          </h1>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink-secondary">
            Direct answers — including what SquadRidge is not: surveillance, open chat, or a
            replacement for professional judgment.
          </p>
        </div>
      </header>

      <section className="py-12 md:py-14">
        <div className={publicShellInnerClass}>
          <div className="max-w-measure text-left">
            <FAQAccordion items={faqFull} />
          </div>
        </div>
      </section>

      <CTABlock headline={CTA.pilotHeadline} body={CTA.pilotBody} />
    </div>
  );
}
