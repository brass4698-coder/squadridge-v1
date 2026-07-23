import { Reveal } from './Reveal';

const FAILURES = [
  {
    channel: 'Email & shared drives',
    problem:
      'Sensitive threads sprawl across inboxes. Forwarding is uncontrolled. There is no release gate—only accidental exposure.',
  },
  {
    channel: 'Meetings & video calls',
    problem:
      'Dialogue evaporates. Notes are incomplete, contested, or stored where the wrong people can search them later.',
  },
  {
    channel: 'Chat & collaboration suites',
    problem:
      'Built for speed and visibility, not high-stakes organizational truce. Identity, retention, and publication blur together.',
  },
  {
    channel: 'Ad hoc documentation',
    problem:
      'Outcomes live in slides and PDFs without a verification anchor. Approvals are informal. Audit trails are stories, not records.',
  },
];

export function OrdinaryChannelsFail() {
  return (
    <section
      id="why-ordinary-channels"
      aria-labelledby="ordinary-channels-heading"
      className="mx-auto max-w-6xl px-6 py-20 lg:py-28"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <Reveal>
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Institutional reality
          </p>
          <h2
            id="ordinary-channels-heading"
            className="mb-4 text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ color: 'var(--color-text-primary)', lineHeight: 1.15 }}
          >
            Ordinary channels fail when the dispute is sensitive.
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Universities, labor programs, nonprofit leadership, ombuds offices, and enterprise
            ethics teams already know the pattern: the conversation needs containment; the outcome
            needs credibility. Generic tools optimize for neither.
          </p>
        </Reveal>

        <ul className="flex flex-col gap-6">
          {FAILURES.map((f, i) => (
            <Reveal key={f.channel} as="li" delay={0.05 * i}>
              <div className="border-l-2 pl-5" style={{ borderColor: 'var(--color-accent)' }}>
                <p
                  className="mb-1 text-sm font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {f.channel}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {f.problem}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
