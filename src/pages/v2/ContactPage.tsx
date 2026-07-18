import { Link } from 'react-router-dom';
import { PilotAccessVisual } from '../../components/institutional';
import { CTA } from '../../data/siteMessaging';
import { CTABlock, EvaluatorPath, MarketingSection, SectionLabel } from '../../components/shared';

export function ContactPage() {
  return (
    <div>
      <MarketingSection className="!pt-20">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-16">
          <PilotAccessVisual className="order-2 lg:order-1" />
          <div className="order-1 max-w-xl lg:order-2">
            <SectionLabel text="Contact" />
            <h1 className="font-display text-h1 font-medium tracking-tight text-ink">
              Inquiries from mediators and partners
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-secondary md:text-base">
              For pilot diligence, security review, practice fit conversations, or partnership
              exploration before formal intake. We respond to serious inquiries from mediators,
              facilitation teams, and institutional partners — not bulk sales requests.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="mailto:hello@squadridge.org"
                className="btn-institutional btn-institutional--primary"
              >
                hello@squadridge.org
              </a>
              <Link to="/request-access" className="btn-institutional btn-institutional--ghost">
                Submit pilot intake
              </Link>
            </div>
            <p className="mt-6 text-xs text-ink-faint">
              Security disclosures:{' '}
              <a
                href="mailto:security@squadridge.com"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                security@squadridge.com
              </a>
            </p>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-line !py-12">
        <div className="mx-auto max-w-6xl">
          <EvaluatorPath current="apply" />
        </div>
      </MarketingSection>

      <CTABlock
        headline={CTA.briefingHeadline}
        body={CTA.briefingBody}
        primaryLabel={CTA.primaryLabel}
        secondaryLabel="Read the security overview"
        secondaryHref="/security"
      />
    </div>
  );
}
