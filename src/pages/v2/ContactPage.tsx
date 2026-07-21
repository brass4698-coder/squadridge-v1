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
              href="mailto:hello@squadridge.org"
              className="btn-institutional btn-institutional--primary"
            >
              hello@squadridge.org
            </a>
            <Link to="/request-access" className="btn-institutional btn-institutional--ghost">
              Submit pilot intake
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
          <EvaluatorPath current="apply" />
        </ShellWidth>
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
