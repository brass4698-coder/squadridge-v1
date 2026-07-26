import { CapsLabel } from '../shared/CapsLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Early narrative anchor — institutional scenario + compact approved-record cue.
 * Labeled as example data; not a pilot outcome or partner claim.
 */
export function IllustrativeScenarioStrip() {
  return (
    <section
      className="sr-section-enter py-12 md:py-14"
      data-scroll-section
      aria-labelledby="scenario-h"
    >
      <div className={publicShellInnerClass}>
        <div className="grid max-w-[52rem] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] lg:items-start lg:gap-10">
          <div className="grid gap-4 md:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] md:items-start md:gap-8">
            <div>
              <CapsLabel>Example scenario</CapsLabel>
              <h2
                id="scenario-h"
                className="mt-2 mb-0 font-heading text-h3 font-semibold leading-snug tracking-tight text-ink"
              >
                Board dispute
              </h2>
            </div>
            <div className="max-w-[32rem]">
              <p className="m-0 text-sm leading-relaxed text-ink-secondary md:text-base">
                Disclosure is inevitable; timing and framing of the approved outcome must stay
                controlled. The room stays private — only facilitator-released text can leave.
              </p>
              <p className="mt-2 mb-0 text-xs leading-relaxed text-ink-faint">
                Example data — not a live pilot outcome.
              </p>
            </div>
          </div>

          <aside
            className="rounded-[var(--sr-radius-md)] bg-surface-elevated px-4 py-3.5 shadow-sr-card"
            aria-label="Example approved record"
          >
            <CapsLabel>What leaves the room</CapsLabel>
            <p className="mt-2 mb-0 text-sm font-medium leading-snug text-ink">
              Approved board outcome memo
            </p>
            <p className="mt-1.5 mb-0 font-mono text-[0.7rem] leading-relaxed text-ink-faint">
              SHA-256 integrity · No transcript
            </p>
            <a
              href="#record-specimen"
              className="mt-3 inline-flex text-xs font-medium text-ink-secondary no-underline underline-offset-4 hover:text-ink hover:underline"
            >
              See approved-record specimen →
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
