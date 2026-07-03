import { Link } from 'react-router-dom';

const stages = [
  {
    number: '01',
    heading: 'Configure',
    body: 'Before any participant enters, the facilitator builds the room. Eligibility requirements, verification steps, and ground rules are locked before invitations go out. Nothing is improvised.',
  },
  {
    number: '02',
    heading: 'Verify',
    body: 'Every participant completes an eligibility and identity assurance process. The facilitator reviews and approves the participant list. Access is not granted until verification is confirmed.',
  },
  {
    number: '03',
    heading: 'Facilitate',
    body: 'The session runs inside a protected room. The facilitator monitors, moderates, and can intervene at any point. Raw discussion is not stored for public access.',
  },
  {
    number: '04',
    heading: 'Draft',
    body: 'After the session closes, the facilitator leads outcome drafting. Participants review the language. No text is published until every required approval is recorded.',
  },
  {
    number: '05',
    heading: 'Release',
    body: 'The approved outcome document is released to the public ledger. It carries a verification anchor, release metadata, and citation reference. The session stays private.',
  },
];

const faqs = [
  {
    q: 'Who can see what happens inside a session?',
    a: 'Only verified participants and the facilitator. Session content is never published. The only public output is the approved outcome document.',
  },
  {
    q: "What if participants don't agree on the outcome text?",
    a: "The facilitator controls the drafting process. Approval is required before release. If consensus isn't reached, no record is published.",
  },
  {
    q: 'Can a released record be withdrawn?',
    a: 'Yes. A facilitator or organisation administrator can withdraw a record. Withdrawn records are replaced with a notice on the public ledger explaining the withdrawal.',
  },
  {
    q: 'What verification methods are supported?',
    a: 'Verification is configured per session by the facilitator. Methods include identity document review, organisational email confirmation, and facilitator manual approval.',
  },
];

export function HowItWorksPage() {
  return (
    <div className="bg-surface">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
          The session lifecycle
        </p>
        <h1 className="mb-5 text-5xl font-medium tracking-tight text-ink">
          Four stages. One protected process.
        </h1>
        <p className="text-lg leading-relaxed text-ink-secondary">
          Every session follows a structured lifecycle — from configuration to verified public
          record.
        </p>
      </section>

      {/* Stages */}
      <section className="border-y border-line py-20" aria-label="Session stages">
        <div className="mx-auto max-w-3xl px-6">
          <ol className="flex flex-col gap-14">
            {stages.map((stage) => (
              <li key={stage.number} className="flex gap-10">
                <span
                  className="mt-1 shrink-0 text-4xl font-light tabular-nums text-line"
                  style={{ minWidth: '3.5rem' }}
                  aria-hidden="true"
                >
                  {stage.number}
                </span>
                <section aria-labelledby={`stage-${stage.number}`}>
                  <h2 id={`stage-${stage.number}`} className="mb-3 text-xl font-semibold text-ink">
                    {stage.heading}
                  </h2>
                  <p className="text-base leading-relaxed text-ink-secondary">{stage.body}</p>
                </section>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="mb-12 text-3xl font-medium tracking-tight text-ink">
          Common questions
        </h2>
        <dl className="flex flex-col gap-10">
          {faqs.map((faq) => (
            <div key={faq.q} className="border-t border-line pt-8">
              <dt className="mb-3 text-base font-semibold text-ink">{faq.q}</dt>
              <dd className="text-base leading-relaxed text-ink-secondary">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA footer */}
      <section className="border-t border-line py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-5 text-3xl font-medium tracking-tight text-ink">
            Ready to run a protected session?
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/request-access"
              className="rounded bg-brand px-6 py-3 text-sm font-medium text-brand-on transition-opacity hover:opacity-90"
            >
              Request Pilot Access
            </Link>
            <Link
              to="/ledger/demo-proposal-001"
              className="text-sm text-ink-secondary underline transition-opacity hover:opacity-70"
            >
              View a sample record →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
