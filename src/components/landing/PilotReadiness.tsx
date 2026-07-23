import { Link } from 'react-router-dom';
import { Reveal } from './Reveal';

const SIGNALS = [
  'Manual pilot review—no automated approvals',
  'Honest fit assessment within 5–7 business days',
  'Selective rollout for facilitators and institutions ready for process discipline',
  'Implementation seriousness over growth theater',
];

export function PilotReadiness() {
  return (
    <section
      id="pilot"
      aria-labelledby="pilot-heading"
      className="mx-auto max-w-6xl px-6 py-20 lg:py-28"
    >
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
        <Reveal>
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Pilot readiness
          </p>
          <h2
            id="pilot-heading"
            className="mb-4 text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ color: 'var(--color-text-primary)', lineHeight: 1.15 }}
          >
            Built for a careful first cohort—not mass self-serve.
          </h2>
          <p
            className="mb-8 text-base leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            SquadRidge is in structured pilot. We work with a limited number of facilitators and
            organizations at a time. If your use case matches the architecture, we arrange a
            briefing. If it does not, we say so.
          </p>
          <Link
            to="/request-access"
            className="inline-flex rounded px-6 py-3 text-sm font-medium text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ backgroundColor: 'var(--color-accent)', outlineColor: 'var(--color-accent)' }}
          >
            Request pilot access
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <ul
            className="border p-6 sm:p-8"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            {SIGNALS.map((s) => (
              <li
                key={s}
                className="border-b py-4 text-sm leading-relaxed last:border-b-0 last:pb-0 first:pt-0"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
