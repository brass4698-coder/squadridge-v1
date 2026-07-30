export function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-10">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Legal
        </p>
        <h1
          className="mb-2 text-3xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Terms of Use
        </h1>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Last updated: June 2024
        </p>
      </div>

      <div className="flex flex-col gap-10 text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
        {[
          {
            heading: '1. Acceptance',
            body: `By accessing or using MENDguild, you agree to these Terms of Use. If you do not agree, you may not use the platform.`,
          },
          {
            heading: '2. Eligibility',
            body: `Access to MENDguild is by invitation or approved application only. You must be at least 18 years old. You must not use the platform for any unlawful purpose.`,
          },
          {
            heading: '3. Facilitator responsibilities',
            body: `Facilitators are responsible for the sessions they create, the participants they invite, the eligibility criteria they configure, and the accuracy of any outcome document submitted for release. Facilitators agree not to use MENDguild to facilitate sessions involving harassment, coercion, or activity that violates applicable law.`,
          },
          {
            heading: '4. Participant conduct',
            body: `Participants agree to engage in sessions in good faith and in accordance with the ground rules established by the facilitator. Participants agree not to record, reproduce, or share session room content outside the session without explicit facilitator approval.`,
          },
          {
            heading: '5. Outcome records',
            body: `Once released to the public ledger, an outcome record is permanent. Facilitating organisations are responsible for the accuracy and appropriateness of published records. MENDguild reserves the right to remove records that violate these Terms.`,
          },
          {
            heading: '6. Limitation of liability',
            body: `MENDguild is provided as-is. We do not guarantee uninterrupted availability. We are not liable for any loss, damage, or harm arising from use of the platform, including from reliance on published outcome records.`,
          },
          {
            heading: '7. Changes to these terms',
            body: `We may update these Terms. We will notify registered users of material changes. Continued use after changes take effect constitutes acceptance of the updated Terms.`,
          },
          {
            heading: '8. Contact',
            body: `For legal queries: legal@mendguild.app`,
          },
        ].map((section) => (
          <section key={section.heading}>
            <h2
              className="mb-3 text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {section.heading}
            </h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
