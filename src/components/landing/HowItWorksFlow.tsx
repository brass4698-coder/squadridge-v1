import { Reveal } from './Reveal';

const STEPS = [
  {
    number: '01',
    title: 'Intake',
    body: 'Pilot fit assessment and manual review. Selective rollout—not open self-serve onboarding.',
  },
  {
    number: '02',
    title: 'Verified access',
    body: 'Invite-only entry. Facilitator-configured eligibility and identity assurance before admission.',
  },
  {
    number: '03',
    title: 'Facilitated written session',
    body: 'Structured dialogue in a protected room. Facilitator authority stays primary; pacing tools support calm process.',
  },
  {
    number: '04',
    title: 'Recorded approvals',
    body: 'Outcome drafts move only with explicit, recorded approval from designated parties.',
  },
  {
    number: '05',
    title: 'Controlled release',
    body: 'A deliberate facilitator action publishes approved outcome text and limited metadata—never raw dialogue by default.',
  },
  {
    number: '06',
    title: 'Verification anchor',
    body: 'The public record carries a cryptographic hash so modification after release is detectable.',
  },
];

export function HowItWorksFlow() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-works-heading"
      className="border-y py-20 lg:py-28"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Operational flow
          </p>
          <h2
            id="how-works-heading"
            className="mb-12 text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ color: 'var(--color-text-primary)', lineHeight: 1.15 }}
          >
            How a high-stakes session becomes a verifiable record
          </h2>
        </Reveal>

        <ol className="flex flex-col gap-10">
          {STEPS.map((step, i) => (
            <Reveal key={step.number} as="li" delay={0.04 * i} className="flex gap-6 sm:gap-8">
              <span
                className="mt-0.5 shrink-0 font-mono text-2xl font-light tabular-nums"
                style={{
                  color: 'color-mix(in oklab, var(--color-border) 40%, var(--color-accent))',
                  minWidth: '2.5rem',
                }}
                aria-hidden
              >
                {step.number}
              </span>
              <div>
                <h3
                  className="mb-2 text-lg font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
