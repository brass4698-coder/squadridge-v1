import { SectionLabel } from '../SectionLabel';
import { publicShellInnerClass } from '../layout/publicShellTokens';

/**
 * Early landing band — what it is, who it serves, safer than chat/email.
 */
export function WhyOverview() {
  return (
    <section
      id="why"
      data-demo="landing-why"
      className="sr-section-enter scroll-mt-24 border-b border-[color:var(--color-border-subtle)] py-16 md:py-20"
      data-scroll-section
      aria-labelledby="why-h"
    >
      <div className={publicShellInnerClass}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:items-start">
          <div className="max-w-[40rem]">
            <SectionLabel className="!mb-2">Why SquadRidge</SectionLabel>
            <h2
              id="why-h"
              className="mt-0 font-display text-[1.75rem] font-medium leading-tight tracking-tight text-ink md:text-[2rem]"
            >
              The room stays private. Only approved outcomes leave.
            </h2>
            <p className="mt-5 mb-0 text-base leading-relaxed text-ink-secondary">
              Invite-only written deliberation lets facilitators resolve sensitive internal matters
              without publishing dialogue or attribution — then release a governed, verifiable
              record when the group is ready.
            </p>
          </div>
          <aside
            className="sr-vault-card max-w-[28rem] p-5 md:p-6"
            aria-label="Safer than chat or email"
          >
            <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              Safer than chat or email
            </p>
            <ul className="mt-4 m-0 list-none space-y-3 p-0 text-sm leading-relaxed text-ink-secondary">
              <li>No sprawling threads parties can forward or screenshot as “the record.”</li>
              <li>No open channel where identity and intensity escalate in real time.</li>
              <li>Release is deliberate — facilitator-gated, approval-backed, never automatic.</li>
            </ul>
            <p className="mt-5 mb-0 border-t border-line pt-4 text-sm leading-relaxed text-ink">
              <span className="font-medium">Example:</span> a board dispute where disclosure is
              inevitable, but timing and framing of the approved outcome must stay controlled.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
