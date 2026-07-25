import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Early landing band — room/record separation and safer-than-chat contrast.
 * Documented limits live once in BoundarySection; this section only points there.
 */
export function WhyOverview() {
  return (
    <section
      id="why"
      data-demo="landing-why"
      className="sr-section-enter scroll-mt-24 border-b border-line py-16 md:py-20"
      data-scroll-section
      aria-labelledby="why-h"
    >
      <div className={publicShellInnerClass}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-12">
          <div className="max-w-[40rem]">
            <SectionLabel className="!mb-2">Why SquadRidge</SectionLabel>
            <h2
              id="why-h"
              className="mt-0 font-display text-h2 font-medium leading-tight tracking-tight text-ink"
            >
              The room and the record are separate by design.
            </h2>
            <p className="mt-4 mb-0 text-base leading-relaxed text-ink-secondary">
              Most tools collapse deliberation and disclosure into one channel. SquadRidge keeps
              them apart: dialogue stays in a facilitator-governed session; only approved outcome
              text can leave.
            </p>
            <p className="mt-4 mb-0">
              <a
                href="#documented-limits"
                className="text-sm font-medium text-ink-secondary no-underline underline-offset-4 hover:text-ink hover:underline"
              >
                Documented limits →
              </a>
              <span className="text-sm text-ink-faint">
                {' '}
                — what we protect, and refuse to overclaim.
              </span>
            </p>
          </div>

          <aside
            className="sr-vault-card max-w-[28rem] p-5 md:p-6"
            aria-label="Safer than chat or email"
          >
            <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              Safer than chat or email
            </p>
            <ul className="mt-4 m-0 list-none space-y-2.5 p-0 text-sm leading-relaxed text-ink-secondary">
              <li>No sprawling threads treated as “the record.”</li>
              <li>No open channel that escalates identity and intensity.</li>
              <li>Release is deliberate — never automatic.</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
