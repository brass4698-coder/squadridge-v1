import { Link } from 'react-router-dom';

const pillars = [
  {
    heading: 'Private by design',
    body: 'Session room content is never stored in a retrievable, human-readable form accessible to MENDguild staff. The platform is designed so that facilitating a session does not require platform-side access to its content.',
  },
  {
    heading: 'Verified access only',
    body: 'Every participant must pass a facilitator-configured verification process before they are admitted to a session. Eligibility, identity document review, and manual approval are all available as configuration options.',
  },
  {
    heading: 'Controlled release',
    body: 'No outcome document is published to the public ledger without passing through an explicit, multi-party approval process. The platform cannot unilaterally release anything. Release requires positive approval from every designated approver.',
  },
  {
    heading: 'Cryptographic anchoring',
    body: 'Every released outcome record is anchored with a cryptographic hash at the moment of approval. This makes retroactive modification detectable. The anchor is publicly visible on the record.',
  },
  {
    heading: 'Participant identity protection',
    body: 'Participants are identified within the room only by the display name and role assigned during onboarding. Personal contact information is not shared between participants. Facilitators see verification data that is not visible to other participants.',
  },
  {
    heading: 'Minimal data retention',
    body: 'MENDguild retains only the data necessary to facilitate the session and produce outcome records. Session room dialogue is not retained on platform infrastructure after a session is closed and archived.',
  },
];

export function SecurityPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-14 text-center">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Security & Privacy
        </p>
        <h1
          className="mb-4 text-3xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          How we protect the room
        </h1>
        <p
          className="mx-auto max-w-xl text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          MENDguild is used in contexts where security and privacy are operational requirements, not marketing features. This page describes how the platform actually works.
        </p>
      </div>

      <div className="mb-16 grid gap-6 md:grid-cols-2">
        {pillars.map((p) => (
          <div
            key={p.heading}
            className="rounded-xl border p-7"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h2
              className="mb-3 text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {p.heading}
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {p.body}
            </p>
          </div>
        ))}
      </div>

      {/* Disclosure */}
      <div
        className="mb-12 rounded-xl border p-8"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          What we do not claim
        </h2>
        <ul className="flex flex-col gap-3">
          {[
            'We do not claim end-to-end encryption of session content at this time. Content transits over TLS. Room-level E2EE is on the development roadmap.',
            'We do not guarantee anonymity. We guarantee identity protection within the session context and controlled release of outcomes.',
            'We do not provide legal protection. MENDguild is a process platform, not a legal instrument. Consult legal counsel for binding agreements.',
            'We are not a whistleblower platform. If your use case involves protection from state-level adversaries, please assess accordingly.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <span className="mt-0.5 shrink-0">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Security questions? Responsible disclosure?
        </p>
        <Link
          to="/request-access"
          className="text-sm font-medium underline transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-accent)' }}
        >
          Contact us →
        </Link>
      </div>
    </div>
  );
}
