import { Link } from 'react-router-dom';
import { Reveal } from './Reveal';

const CAPABILITIES = [
  {
    title: 'Zero-Knowledge Harmony Rooms',
    body: 'Identity minimization and need-to-know boundaries inside the session—not a claim that the operator knows nothing. Participants see what the process requires; exposure is constrained by design.',
  },
  {
    title: 'Controlled identity exposure',
    body: 'Identity is verified privately for access. What other participants see is limited to session-appropriate display names and roles—not a searchable public profile.',
  },
  {
    title: 'Invite-only access',
    body: 'Rooms are not open forums. Entry follows facilitator-configured eligibility and verification steps before dialogue begins.',
  },
  {
    title: 'Verified participation',
    body: 'Access is earned through the verification path the facilitator sets—not through a public sign-up funnel.',
  },
  {
    title: 'Need-to-know trust boundaries',
    body: 'Facilitators, participants, and public readers each see a different slice of the process. The room and the record stay different objects.',
  },
];

/**
 * Flagship ZK section — strong product language with technical integrity.
 * Aligns with Security: no operator-blind E2EE claim; anonymity not guaranteed.
 */
export function ZeroKnowledgeArchitecture() {
  return (
    <section
      id="zero-knowledge"
      aria-labelledby="zk-heading"
      className="border-y py-20 lg:py-28"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'color-mix(in oklab, var(--color-surface) 70%, var(--color-bg))',
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="max-w-3xl">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--color-accent)' }}
          >
            Flagship capability
          </p>
          <h2
            id="zk-heading"
            className="mb-4 text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ color: 'var(--color-text-primary)', lineHeight: 1.15 }}
          >
            Zero-Knowledge Harmony Rooms
          </h2>
          <p
            className="mb-3 text-base leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Privacy-first conflict resolution infrastructure where trust comes from access
            boundaries, facilitator control, identity minimization, and verifiable release—not
            surveillance or overclaimed cryptography.
          </p>
          <p
            className="mb-10 text-sm leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            “Zero knowledge” here means reduced exposure of sensitive participant data and
            deliberate need-to-know design. It does{' '}
            <strong style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>not</strong>{' '}
            mean the operator is cryptographically blind to session content today. Transport uses
            TLS; room-level E2EE remains on the roadmap. Anonymity is not guaranteed—identity is
            protected in context and controlled at release.{' '}
            <Link
              to="/security"
              className="font-medium underline-offset-2 hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Read the full security model
            </Link>
            .
          </p>
        </Reveal>

        <ul className="grid gap-x-10 gap-y-10 md:grid-cols-2">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.title} as="li" delay={0.04 * i}>
              <h3
                className="mb-2 text-base font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {c.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {c.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
