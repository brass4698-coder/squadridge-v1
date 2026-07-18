import { Link } from 'react-router-dom';
import { MarketingSection, SectionLabel } from '../../components/shared';
import { SITE_THESIS_SHORT } from '../../data/siteMessaging';

const SECTIONS = [
  {
    heading: '1. Acceptance',
    body: `By accessing or using SquadRidge, you agree to these Terms of Use. If you do not agree, you may not use the platform.`,
  },
  {
    heading: '2. Eligibility',
    body: `Access to SquadRidge is by invitation or approved application only. You must be at least 18 years old. You must not use the platform for any unlawful purpose or for surveillance, monitoring, or predictive policing use cases inconsistent with the platform's design.`,
  },
  {
    heading: '3. Facilitator responsibilities',
    body: `Facilitators are responsible for the sessions they create, the participants they invite, the eligibility criteria they configure, and the accuracy of any outcome document submitted for release. Facilitators agree not to use SquadRidge to facilitate sessions involving harassment, coercion, or activity that violates applicable law.`,
  },
  {
    heading: '4. Participant conduct',
    body: `Participants agree to engage in sessions in good faith and in accordance with the ground rules established by the facilitator. Participants agree not to record, reproduce, or share session room content outside the session without explicit facilitator approval.`,
  },
  {
    heading: '5. Outcome records',
    body: `Once released to the public ledger, an outcome record is permanent. Facilitating organisations are responsible for the accuracy and appropriateness of published records. SquadRidge reserves the right to remove records that violate these Terms.`,
  },
  {
    heading: '6. Limitation of liability',
    body: `SquadRidge is provided as-is. We do not guarantee uninterrupted availability. We are not liable for any loss, damage, or harm arising from use of the platform, including from reliance on published outcome records.`,
  },
  {
    heading: '7. Changes to these terms',
    body: `We may update these Terms. We will notify registered users of material changes. Continued use after changes take effect constitutes acceptance of the updated Terms.`,
  },
  {
    heading: '8. Contact',
    body: `For legal queries: legal@squadridge.app`,
  },
];

export function TermsPage() {
  return (
    <div className="bg-surface">
      <MarketingSection className="!pb-12 !pt-20">
        <div className="mx-auto max-w-3xl">
          <SectionLabel text="Legal" />
          <h1 className="font-display mb-2 text-h1 font-medium tracking-tight text-ink">
            Terms of Use
          </h1>
          <p className="text-xs text-ink-faint">Last updated: July 2026</p>
          <p className="mt-5 text-sm leading-relaxed text-ink-secondary">
            {SITE_THESIS_SHORT} These terms govern mediator- and facilitator-led use of protected
            sessions and controlled release of outcome records.
          </p>
          <p className="mt-4 text-sm text-ink-secondary">
            Privacy and security:{' '}
            <Link to="/privacy" className="text-ink underline-offset-4 hover:underline">
              Privacy policy
            </Link>
            {' · '}
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
