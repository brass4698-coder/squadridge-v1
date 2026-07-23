import { Link } from 'react-router-dom';
import { Reveal } from './Reveal';

const PATHS = [
  {
    id: 'executive',
    role: 'Executive buyer',
    question: 'Is this fit for a sensitive organizational matter?',
    body: 'Category, governance model, pilot seriousness, and what a briefing commitment looks like.',
    primary: { label: 'Request a briefing', href: '/request-access?intent=briefing' },
    secondary: { label: 'Executive demo path', href: '/?demo=1' },
  },
  {
    id: 'facilitator',
    role: 'Facilitator / operator',
    question: 'How do I run the room without losing the record?',
    body: 'Verified access, facilitated written session, approvals, and controlled release—step by step.',
    primary: { label: 'See how it works', href: '/how-it-works' },
    secondary: { label: 'Request pilot access', href: '/request-access' },
  },
  {
    id: 'security',
    role: 'Security / trust reviewer',
    question: 'What is exposed, and what is not?',
    body: 'Documented limits, room vs record, verification anchors, and what we explicitly do not claim.',
    primary: { label: 'For security reviewers', href: '/security' },
    secondary: { label: 'Browse public ledger', href: '/ledger' },
  },
];

/**
 * Surgical conversion paths — one journey per stakeholder type.
 * Placed early so reviewers do not have to hunt.
 */
export function AudiencePaths() {
  return (
    <section
      id="audience-paths"
      aria-labelledby="audience-paths-heading"
      className="border-b"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div className="mx-auto max-w-6xl px-6 py-14 lg:py-16">
        <Reveal className="mb-8 max-w-2xl">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Choose your path
          </p>
          <h2
            id="audience-paths-heading"
            className="text-2xl font-medium tracking-tight sm:text-3xl"
            style={{ color: 'var(--color-text-primary)', lineHeight: 1.2 }}
          >
            Three audiences. Three deliberate journeys.
          </h2>
        </Reveal>

        <ul className="grid gap-4 lg:grid-cols-3">
          {PATHS.map((p, i) => (
            <Reveal key={p.id} as="li" delay={0.05 * i}>
              <article
                className="flex h-full flex-col border p-5 sm:p-6"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <p
                  className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {p.role}
                </p>
                <h3
                  className="mb-2 text-base font-semibold leading-snug"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {p.question}
                </h3>
                <p
                  className="mb-6 flex-1 text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {p.body}
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to={p.primary.href}
                    className="inline-flex items-center justify-center rounded px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    {p.primary.label}
                  </Link>
                  <Link
                    to={p.secondary.href}
                    className="inline-flex items-center justify-center rounded border px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {p.secondary.label}
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
