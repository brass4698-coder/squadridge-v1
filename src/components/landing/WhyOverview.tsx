import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';
import { SITE_WHY_NOW } from '../../data/siteMessaging';

/**
 * Early landing band — why the room/record split exists.
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
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-16">
          <div className="max-w-[40rem]">
            <SectionLabel className="!mb-2">Why this exists</SectionLabel>
            <h2
              id="why-h"
              className="mt-0 font-heading text-h2 font-semibold leading-tight tracking-tight text-ink"
            >
              Not every difficult conversation should be public. The outcome still can be.
            </h2>
            <p className="mt-4 mb-0 text-base leading-relaxed text-ink-secondary">{SITE_WHY_NOW}</p>
            <p className="mt-4 mb-0 text-sm leading-relaxed text-ink-secondary">
              SquadRidge makes that separation structural: dialogue stays in a facilitator-governed
              written room; only approved outcome text can leave.
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
            className="max-w-[28rem] border-l border-line pl-5 md:pl-6"
            aria-label="Unlike chat or email"
          >
            <p className="m-0 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              Unlike chat or email
            </p>
            <ul className="mt-4 m-0 list-none space-y-3 p-0 text-sm leading-relaxed text-ink-secondary">
              <li>No sprawling thread treated as “the record.”</li>
              <li>No open channel that escalates identity and intensity.</li>
              <li>Release is deliberate — never automatic.</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
