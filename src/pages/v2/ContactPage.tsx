import { Link } from 'react-router-dom';
import { PilotAccessVisual } from '../../components/institutional';
import { CTA } from '../../data/siteMessaging';
import {
  CTABlock,
  EvaluatorPath,
  MarketingPageHero,
  MarketingSection,
  ShellWidth,
} from '../../components/shared';

export function ContactPage() {
  return (
    <div>
      <MarketingPageHero
        slim
        label="Contact"
        title="Inquiries from mediators and partners"
        lead="For pilot diligence, security review, practice fit conversations, or partnership exploration before formal intake. We respond to serious inquiries from mediators, facilitation teams, and institutional partners — not bulk sales requests."
        actions={
          <>
            <a
              href="mailto:hello@squadridge.com"
              className="btn-institutional btn-institutional--primary"
            >
              hello@squadridge.com
            </a>
            <Link to={CTA.primaryHref} className="btn-institutional btn-institutional--ghost">
              {CTA.primaryLabel}
            </Link>
          </>
        }
        meta={
          <p className="text-xs text-ink-faint">
            Security disclosures:{' '}
            <a
              href="mailto:security@squadridge.com"
              className="text-ink-secondary underline-offset-4 hover:underline"
            >
              security@squadridge.com
            </a>
          </p>
        }
        aside={<PilotAccessVisual className="w-full" />}
      />

      <MarketingSection tone="bordered" density="compact">
        <ShellWidth>
          <EvaluatorPath />
        </ShellWidth>
      </MarketingSection>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.closeContact}
        secondaryLabel={CTA.secondarySecurity}
        secondaryHref={CTA.secondarySecurityHref}
        statusLine={CTA.pilotStatusLineShort}
      />
    </div>
  );
}
