import { Reveal } from './Reveal';

const FEATURES = [
  {
    title: 'Zero-Knowledge Harmony Rooms',
    body: 'Identity-minimized, invite-only session spaces with need-to-know boundaries—honest about operator visibility today.',
    span: 'lg:col-span-2',
    emphasis: true,
  },
  {
    title: 'Facilitated Written Truce Workflow',
    body: 'Structured written process for organizational conflict. Calm pacing tools; facilitator judgment remains primary.',
    span: 'lg:col-span-1',
    emphasis: false,
  },
  {
    title: 'Controlled Release Architecture',
    body: 'No unilateral publish. Multi-party approvals are recorded before anything crosses into the public ledger.',
    span: 'lg:col-span-1',
    emphasis: false,
  },
  {
    title: 'Verifiable Public Record',
    body: 'Approved outcome text plus limited metadata, anchored so integrity can be checked after release.',
    span: 'lg:col-span-1',
    emphasis: false,
  },
  {
    title: 'Pilot-Ready Operational Trust',
    body: 'Manual onboarding, fit assessment, and selective rollout for institutions that need process seriousness—not a marketplace.',
    span: 'lg:col-span-2',
    emphasis: true,
  },
];

/** Varied density feature modules — not a generic equal card row. */
export function CoreFeatures() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="mx-auto max-w-6xl px-6 py-20 lg:py-28"
    >
      <Reveal className="mb-12 max-w-2xl">
        <p
          className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Core capabilities
        </p>
        <h2
          id="features-heading"
          className="text-3xl font-medium tracking-tight sm:text-4xl"
          style={{ color: 'var(--color-text-primary)', lineHeight: 1.15 }}
        >
          Infrastructure for organizational truce—not another chat surface.
        </h2>
      </Reveal>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} as="li" delay={0.05 * i} className={f.span}>
            <article
              className="h-full border p-6 transition-[box-shadow,border-color] hover:shadow-[var(--shadow-card)] sm:p-8"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: f.emphasis
                  ? 'color-mix(in oklab, var(--color-accent-light) 35%, var(--color-surface))'
                  : 'var(--color-surface)',
              }}
            >
              <h3
                className="mb-3 text-lg font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {f.body}
              </p>
            </article>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
