import { Link } from 'react-router-dom';
import { Reveal } from './Reveal';

const MODULES = [
  {
    audience: 'Executive evaluator',
    title: 'Executive overview',
    body: 'Positioning, room vs record, and what a pilot commitment looks like—without product theater.',
    href: '/?demo=1',
    cta: 'Start walkthrough',
  },
  {
    audience: 'Facilitator / operator',
    title: 'Facilitator workflow',
    body: 'Configure access, run the room, draft outcomes, and move through the release gate with recorded approvals.',
    href: '/how-it-works',
    cta: 'See the flow',
  },
  {
    audience: 'Trust reviewer',
    title: 'Participant trust experience',
    body: 'What participants see, what stays private, and how identity boundaries work inside the session.',
    href: '/security',
    cta: 'Review security model',
  },
  {
    audience: 'Diligence / ledger',
    title: 'Release and ledger verification',
    body: 'Inspect how approved outcomes appear publicly with verification anchors—and what never ships.',
    href: '/ledger',
    cta: 'Browse public ledger',
  },
];

export function DemoWalkthroughs() {
  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="border-y py-20 lg:py-28"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'color-mix(in oklab, var(--color-bg) 55%, var(--color-surface))',
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mb-12 max-w-2xl">
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Demo walkthroughs
          </p>
          <h2
            id="demo-heading"
            className="mb-4 text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ color: 'var(--color-text-primary)', lineHeight: 1.15 }}
          >
            Deeper demo surfaces for diligence
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            After you choose your audience path above, use these modules for a deeper walkthrough.
            Illustrative surfaces stay labeled; production claims stay on the Security page.
          </p>
        </Reveal>

        <ul className="grid gap-5 md:grid-cols-2">
          {MODULES.map((m, i) => (
            <Reveal key={m.title} as="li" delay={0.05 * i}>
              <article
                className="flex h-full flex-col border p-6 sm:p-7"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <p
                  className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {m.audience}
                </p>
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {m.title}
                </h3>
                <p
                  className="mb-6 flex-1 text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {m.body}
                </p>
                <Link
                  to={m.href}
                  className="text-sm font-medium underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {m.cta} →
                </Link>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
