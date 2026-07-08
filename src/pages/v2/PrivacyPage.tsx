import { MarketingSection, SectionLabel } from '../../components/shared';

const SECTIONS = [
  {
    heading: '1. What data we collect',
    body: `We collect the minimum data necessary to operate the platform. This includes: account information (name, email address, organisational affiliation) provided during registration or access application; verification materials submitted by participants at the request of a facilitator (e.g. identity documents); session metadata (session creation time, participant count, outcome release timestamp); and usage data necessary to operate and improve the platform.`,
  },
  {
    heading: '2. Session room content',
    body: `Session room dialogue is treated as private by default. We do not use session room content for any purpose other than facilitating the session. Room content is not reviewed by platform staff unless a safety or legal obligation requires it. Room content is not retained on platform infrastructure after a session is closed and archived.`,
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
          <h1 className="mb-2 text-h1 text-ink">Privacy Policy</h1>
          <p className="text-xs text-ink-faint">Last updated: June 2024</p>
        </div>
      </MarketingSection>

      <section className="border-t border-line px-6 pb-[var(--space-section)] md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-3xl flex-col gap-10 text-sm leading-relaxed text-ink-secondary">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 text-base font-semibold text-ink">{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
