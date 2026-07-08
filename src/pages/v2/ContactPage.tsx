import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { CTABlock, MarketingSection, SectionLabel } from '../../components/shared';

export function ContactPage() {
  return (
    <div className="bg-surface">
      <MarketingSection className="!pt-20">
        <div className="mx-auto max-w-xl">
          <SectionLabel text="Contact" />
          <h1 className="mt-2 text-h1 text-ink">Get in touch</h1>
          <p className="mt-4 text-app-body leading-relaxed text-ink-secondary">
            For pilot access, security questions, or partnership inquiries, email our team or submit
            a formal access request.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <a href="mailto:hello@squadridge.org">hello@squadridge.org</a>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/request-access">Request access</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-ink-faint">
            Security disclosures:{' '}
            <a href="mailto:security@squadridge.com" className="text-brand hover:underline">
              security@squadridge.com
            </a>
          </p>
        </div>
      </MarketingSection>

      <CTABlock headline="Ready to run a protected session?" />
    </div>
  );
}
