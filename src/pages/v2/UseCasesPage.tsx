import { Link } from 'react-router-dom';

const cases = [
  {
    audience: 'Civil mediators & conflict resolution practitioners',
    heading: 'Structured mediation with a published outcome',
    body: 'Facilitate multi-party dialogue in a protected environment. Produce a formal joint statement or consensus record that can be cited by courts, institutions, or media — without exposing the mediation itself.',
    cta: 'Request access as a facilitator',
    href: '/request-access',
  },
  {
    audience: 'Government & public institutions',
    heading: 'Consultation processes with accountability',
    body: 'Run structured public consultations where the process is protected and the outcome is verifiable. Replace informal stakeholder engagement with a recorded, approver-signed result.',
    cta: 'Request institutional access',
    href: '/request-access',
  },
  {
    audience: 'NGOs & civil society organisations',
    heading: 'Community dialogue without exposure risk',
    body: 'Bring together communities in conflict or tension for facilitated conversation. Protect participants from exposure while still producing a credible, publishable statement of agreed principles.',
    cta: 'Talk to us',
    href: '/request-access',
  },
  {
    audience: 'Peace-tech operators & humanitarian programs',
    heading: 'High-stakes dialogue in difficult contexts',
    body: 'SquadRidge was designed for contexts where trust is absent, exposure risk is real, and the stakes of failure are high. Use it for ceasefire talks, displaced community consultations, post-crisis recovery dialogue, and similar operations.',
    cta: 'Request pilot access',
    href: '/request-access',
  },
  {
    audience: 'Academic researchers & evaluators',
    heading: 'Process integrity for research-grade dialogue',
    body: 'Run structured, documented dialogue sessions with verifiable process records. The outcome ledger provides a citable, time-stamped record that meets institutional standards for evidence-based research.',
    cta: 'Learn more',
    href: '/how-it-works',
  },
  {
    audience: 'Legal and corporate dispute resolution',
    heading: 'Private mediation, documented outcome',
    body: 'Conduct structured mediation between parties in commercial or legal disputes. Produce an agreed settlement record that can be referenced as evidence of good-faith negotiation without exposing confidential session content.',
    cta: 'Request access',
    href: '/request-access',
  },
];

export function UseCasesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-14 text-center">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Applications
        </p>
        <h1
          className="mb-4 text-3xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Who SquadRidge is built for
        </h1>
        <p
          className="mx-auto max-w-xl text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          SquadRidge is not a general-purpose platform. It was purpose-built for high-stakes, facilitated dialogue where the room must remain private and the outcome must be credible. These are the contexts it is designed to serve.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {cases.map((c) => (
          <article
            key={c.heading}
            className="flex flex-col rounded-xl border p-8"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--color-accent)' }}
            >
              {c.audience}
            </p>
            <h2
              className="mb-3 text-lg font-semibold leading-snug"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {c.heading}
            </h2>
            <p
              className="mb-6 flex-1 text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {c.body}
            </p>
            <Link
              to={c.href}
              className="text-sm font-medium underline transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-accent)' }}
            >
              {c.cta} →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
