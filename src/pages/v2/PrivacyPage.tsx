import { Link } from 'react-router-dom';
import { MarketingSection, SectionLabel } from '../../components/shared';
import { SITE_NOT, SITE_THESIS_SHORT } from '../../data/siteMessaging';

const SECTIONS = [
  {
    heading: '1. What data we collect',
    body: `We collect the minimum data necessary to operate the platform. This includes: account information (name, email address, organisational affiliation) provided during registration or access application; verification materials submitted by participants at the request of a facilitator (e.g. identity documents); session metadata (session creation time, participant count, outcome release timestamp); and usage data necessary to operate and improve the platform.`,
  },
  {
    heading: '2. Session room content',
    body: `Session room dialogue is treated as private by default and is never published to the ledger. v2 messages are stored as access-controlled platform data (not operator-proof end-to-end encryption). We do not use room content for marketing, unrelated analytics, or surveillance-style monitoring. Platform staff access room content only when required for safety, support, or legal obligation.`,
  },
  {
    heading: '3. Outcome records',
    body: `Outcome documents released to the public ledger are publicly accessible. Once released, a ledger record is permanent. Ledger records do not identify individual participants. The content of a ledger record is the responsibility of the facilitating organisation.`,
  },
  {
    heading: '4. Verification data',
    body: `Identity documents and verification materials submitted by participants are accessible only to the facilitator of the relevant session. SquadRidge staff do not access verification materials in normal operations. Verification data is retained only for the duration required to confirm eligibility and is deleted thereafter.`,
  },
  {
    heading: '5. Data sharing',
    body: `We do not sell or share personal data with third parties for marketing purposes. We may share data with service providers who support platform operations (e.g. cloud infrastructure, email delivery) under appropriate data processing agreements. We may disclose data where required by law.`,
  },
  {
    heading: '6. Your rights',
    body: `You have the right to request access to, correction of, or deletion of your personal data. To exercise these rights, contact us at privacy@squadridge.app. We will respond within 30 days.`,
  },
  {
    heading: '7. Contact',
    body: `For privacy-related queries: privacy@squadridge.app`,
  },
];

export function PrivacyPage() {
  return (
    <div className="bg-surface">
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Legal" />
          <h1 className="font-display mb-2 text-h1 font-medium tracking-tight text-ink">
            Privacy Policy
          </h1>
          <p className="text-xs text-ink-faint">Last updated: July 2026</p>
          <p className="mt-5 text-sm leading-relaxed text-ink-secondary">
            {SITE_THESIS_SHORT} This policy describes what we collect, how session room content
            differs from released ledger records, and what we do not do with your data.
          </p>
          <ul className="mt-4 flex flex-col gap-1 text-xs text-ink-faint">
            {SITE_NOT.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-secondary">
            Technical trust boundaries:{' '}
            <Link to="/security" className="text-ink underline-offset-4 hover:underline">
              Security overview
            </Link>
          </p>
        </div>
      </MarketingSection>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 text-sm leading-relaxed text-ink-secondary">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display mb-3 text-base font-medium text-ink">
                {section.heading}
              </h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
