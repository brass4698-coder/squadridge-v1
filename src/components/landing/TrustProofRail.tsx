import { Reveal } from './Reveal';

const MARKERS = [
  {
    title: 'Invite-only access',
    body: 'No open rooms. Participants enter through facilitator-configured verification.',
  },
  {
    title: 'Approved outcomes only',
    body: 'Raw dialogue is never auto-published. Release is a deliberate facilitator action.',
  },
  {
    title: 'Verification anchors',
    body: 'Released records carry a cryptographic hash so tampering is detectable.',
  },
  {
    title: 'Documented limits',
    body: 'TLS in transit today. Room-level E2EE on the roadmap. Anonymity is not guaranteed.',
  },
];

/** Trust proof rail — honest markers, not vanity stats. */
export function TrustProofRail() {
  return (
    <section
      aria-label="Trust markers"
      className="border-b"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Reveal>
          <p
            className="mb-6 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            How trust is earned
          </p>
        </Reveal>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {MARKERS.map((m, i) => (
            <Reveal key={m.title} as="li" delay={0.06 * i}>
              <p
                className="mb-2 text-sm font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {m.title}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {m.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
