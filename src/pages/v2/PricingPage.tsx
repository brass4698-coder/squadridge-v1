import { Link } from 'react-router-dom';
import { CTA, PRICING_TIERS } from '../../data/siteMessaging';
import {
  CTABlock,
  MarketingPageHero,
  MarketingSection,
  ProseMeasure,
  SectionLabel,
  ShellWidth,
} from '../../components/shared';
import { usePageTitle } from '../../hooks/usePageTitle';

/**
 * Pricing — invite-only posture; no invented dollar amounts.
 * Commercial terms are scoped with partners until validated in real pilots.
 */
export function PricingPage() {
  usePageTitle('Pricing');

  return (
    <div data-page="pricing">
      <MarketingPageHero
        slim
        label="Pricing"
        title="Invite-only commercial posture"
        lead={
          <>
            <p>
              Access is reviewed manually. We do not publish list prices until they are validated
              with real pilot partners — terms are scoped in briefing, not invented for the site.
            </p>
            <p className="mt-3 mb-0 text-sm text-ink-faint">
              Aligns with go-to-market readiness on{' '}
              <Link to="/roadmap" className="text-ink-secondary underline-offset-4 hover:underline">
                Roadmap
              </Link>
              .
            </p>
          </>
        }
      />

      <MarketingSection id="tiers" density="compact">
        <ShellWidth>
          <ProseMeasure className="mb-10">
            <SectionLabel>Tiers</SectionLabel>
            <h2 id="tiers-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Three engagement shapes
            </h2>
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 lg:grid-cols-3">
            {PRICING_TIERS.map((tier) => (
              <li key={tier.id} className="flex flex-col bg-surface-elevated p-5 md:p-6">
                <h3 className="m-0 text-sm font-semibold text-ink">{tier.name}</h3>
                <p className="mt-2 mb-0 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-brand">
                  {tier.posture}
                </p>
                <p className="mt-4 mb-0 flex-1 text-sm leading-relaxed text-ink-secondary">
                  {tier.body}
                </p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>

      <MarketingSection id="why-invite-only" tone="sunken" density="compact">
        <ShellWidth>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16">
            <ProseMeasure>
              <SectionLabel>Why invite-only</SectionLabel>
              <h2
                id="why-invite-only-h"
                className="mt-0 font-heading text-h2 font-semibold text-ink"
              >
                Pricing follows fit review
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                We review applications by hand and aim to reply with an honest fit assessment within
                about one week. Commercial posture is discussed after matter class and facilitation
                context are clear — not before.
              </p>
              <p className="mt-4 mb-0 text-sm leading-relaxed text-ink-secondary">
                Publishing invented &quot;starting at&quot; figures would mislead diligence readers.
                Prefer scoped partner terms until pilots validate pricing logic.
              </p>
            </ProseMeasure>
            <aside className="h-fit border border-line bg-surface-elevated p-6 md:p-8">
              <p className="m-0 text-sm font-semibold text-ink">What you should expect</p>
              <ul className="mt-4 mb-0 space-y-3 p-0 list-none">
                <li className="flex gap-3 text-sm leading-relaxed text-ink-secondary">
                  <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-line-strong" />
                  <span>Manual fit review before access or commercial discussion</span>
                </li>
                <li className="flex gap-3 text-sm leading-relaxed text-ink-secondary">
                  <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-line-strong" />
                  <span>Pilot terms: time-boxed, low or no cost where appropriate</span>
                </li>
                <li className="flex gap-3 text-sm leading-relaxed text-ink-secondary">
                  <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-line-strong" />
                  <span>Institutional and enterprise: discussed in briefing</span>
                </li>
              </ul>
            </aside>
          </div>
        </ShellWidth>
      </MarketingSection>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.closePricing}
        secondaryLabel={CTA.secondaryBriefingLabel}
        secondaryHref={CTA.secondaryBriefingHref}
        statusLine={CTA.pilotStatusLineShort}
      />
    </div>
  );
}
