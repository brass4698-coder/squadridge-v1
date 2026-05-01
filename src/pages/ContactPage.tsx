import { Link } from 'react-router-dom';
import { CTAGroup, InfoCard, InlineAction, PageHero, SectionBand } from '../components';
import { getPublicContactEmail } from '../lib';

export function ContactPage() {
  const contactEmail = getPublicContactEmail();

  return (
    <>
      <SectionBand tone="navy" containerClassName="max-w-4xl">
        <PageHero eyebrow="Contact" title="Reach the SquadRidge operating team.">
          <p>
            Use this route for institutional review, pilot fit, security questions, and operational
            follow-up. Pilot-specific contacts in signed agreements remain the fastest path for
            active deployments.
          </p>
        </PageHero>
      </SectionBand>

      <SectionBand tone="black" containerClassName="max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard eyebrow="General contact">
            {contactEmail ? (
              <InlineAction
                as="a"
                href={`mailto:${contactEmail}?subject=${encodeURIComponent('SquadRidge inquiry')}`}
              >
                {contactEmail}
              </InlineAction>
            ) : (
              <p>
                Public contact email is not configured in this environment. Use pilot access for new
                inquiries.
              </p>
            )}
          </InfoCard>

          <InfoCard eyebrow="Pilot access">
            <p>
              Apply when you have a facilitator-led room with a defined participant boundary, risk
              model, and release format.
            </p>
            <InlineAction as={Link} to="/#waitlist" className="mt-4">
              Apply for pilot access
            </InlineAction>
          </InfoCard>
        </div>

        <CTAGroup label="Contact related pages" bordered className="mt-8">
          <Link to="/trust" className="btn-secondary no-underline">
            Trust &amp; Safety
          </Link>
          <Link to="/security" className="btn-secondary no-underline">
            Security Disclosure
          </Link>
          <Link to="/partners#pilot-process" className="btn-secondary no-underline">
            Pilot process
          </Link>
        </CTAGroup>
      </SectionBand>
    </>
  );
}
