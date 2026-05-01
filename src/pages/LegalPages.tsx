import { Link } from 'react-router-dom';
import { CTAGroup, InfoCard, PageHero, SectionBand } from '../components';

type LegalPageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: ReadonlyArray<{
    title: string;
    body: string;
  }>;
};

const privacyContent: LegalPageContent = {
  eyebrow: 'Privacy Policy',
  title: 'Privacy commitments for pilot-stage operations.',
  intro:
    'This page is the public placeholder for the canonical Privacy Policy. Until counsel-approved terms ship, it summarizes the operating posture reflected in the Trust & Safety and Security Disclosure pages.',
  sections: [
    {
      title: 'Data minimization',
      body: 'SquadRidge is designed so the private room and the public record remain separate. Public records should not include transcripts or participant identity.',
    },
    {
      title: 'Pilot agreements govern specifics',
      body: 'Retention windows, partner contacts, regional parameters, and subprocessors are confirmed in each pilot agreement.',
    },
    {
      title: 'Reviewer path',
      body: 'For implementation details, reviewers should start with Security Disclosure and then review pilot-specific terms.',
    },
  ],
};

const termsContent: LegalPageContent = {
  eyebrow: 'Terms of Use',
  title: 'Terms are scoped to controlled pilots.',
  intro:
    'This page is the public placeholder for the canonical Terms of Use. The current product surface is pilot-led and does not replace partner-specific agreements.',
  sections: [
    {
      title: 'Controlled access',
      body: 'Pilot access is reviewed before rooms are opened. Public routes are informational unless a user is authenticated into an approved flow.',
    },
    {
      title: 'No emergency service',
      body: 'SquadRidge is not an emergency response service. Facilitators and participants must use local emergency channels for immediate physical danger.',
    },
    {
      title: 'Public records',
      body: 'Records published to the ledger are intended to be anonymous, timestamped outcomes approved through the release process.',
    },
  ],
};

const acceptableUseContent: LegalPageContent = {
  eyebrow: 'Acceptable Use',
  title: 'Acceptable use for sensitive facilitated rooms.',
  intro:
    'This page is the public placeholder for the canonical Acceptable Use Policy. It gives reviewers the expected behavioral boundary while legal text is finalized.',
  sections: [
    {
      title: 'No coercion or doxxing',
      body: 'The platform must not be used to expose participant identity, coerce participation, or publish private room content outside the release process.',
    },
    {
      title: 'No transcript laundering',
      body: 'A public record is not a transcript substitute. Attempts to reconstruct, export, or publish private-room content are outside the product boundary.',
    },
    {
      title: 'Facilitator accountability',
      body: 'Facilitators are expected to define room norms, risk boundaries, and escalation paths before a pilot starts.',
    },
  ],
};

function LegalPage({ content }: { content: LegalPageContent }) {
  return (
    <>
      <SectionBand tone="navy" as="div" containerClassName="max-w-4xl">
        <PageHero eyebrow={content.eyebrow} title={content.title}>
          <p>{content.intro}</p>
        </PageHero>
      </SectionBand>

      <SectionBand tone="black" as="div" containerClassName="max-w-4xl">
        <div className="grid gap-4">
          {content.sections.map((section) => (
            <InfoCard key={section.title} title={section.title}>
              <p>{section.body}</p>
            </InfoCard>
          ))}
        </div>

        <CTAGroup label="Related trust pages" bordered className="mt-8">
          <Link to="/trust" className="btn-secondary no-underline">
            Trust &amp; Safety
          </Link>
          <Link to="/security" className="btn-secondary no-underline">
            Security Disclosure
          </Link>
          <Link to="/#waitlist" className="btn-primary no-underline">
            Apply for pilot access
          </Link>
        </CTAGroup>
      </SectionBand>
    </>
  );
}

export function PrivacyPolicyPage() {
  return <LegalPage content={privacyContent} />;
}

export function TermsOfUsePage() {
  return <LegalPage content={termsContent} />;
}

export function AcceptableUsePage() {
  return <LegalPage content={acceptableUseContent} />;
}
