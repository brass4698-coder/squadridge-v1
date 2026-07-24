import { Link } from 'react-router-dom';
import { howItWorksVignette } from '../../data/howItWorksVignette';
import { PRODUCT_MECHANICS } from '../../data/institutionalHome';
import { SITE_THESIS } from '../../data/siteMessaging';
import { CTA } from '../../data/siteMessaging';
import { InstitutionalSplit } from '../../components/institutional';
import { CTABlock } from '../../components/shared';
import { ContentColumn } from '../../components/ContentColumn';
import { ProcessStep } from '../../components/ProcessStep';
import { SectionLabel } from '../../components/SectionLabel';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

const ROOM_GUARANTEES = [
  {
    title: 'No auto-publishing',
    body: 'Room dialogue never becomes a public record by timer, webhook, or default setting.',
  },
  {
    title: 'Verification before entry',
    body: 'Participants complete facilitator-defined verification before the room opens to them.',
  },
  {
    title: 'Facilitator-controlled release',
    body: 'Only designated approvals and an explicit release action can publish an outcome.',
  },
  {
    title: 'Approved text only',
    body: 'The released instrument is drafted and approved — not an export of the chat thread.',
  },
  {
    title: 'Identity stays off the ledger',
    body: 'Contact details and attribution are not written onto the public integrity record.',
  },
] as const;

/**
 * How it works — procedural source of truth: spine + guarantees + room/record split.
 */
export function HowItWorksPage() {
  return (
    <div>
      <header
        className="scroll-mt-20 border-b border-line pt-16 pb-12 md:pt-20 md:pb-14"
        data-demo="how-it-works-spine"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
            <div>
              <SectionLabel>Process</SectionLabel>
              <h1 className="mt-0 max-w-[16ch] font-display text-display font-medium text-ink">
                Configure. Verify. Facilitate. Release.
              </h1>
            </div>
            <p className="max-w-prose text-base leading-relaxed text-ink-secondary">
              {SITE_THESIS} Transitions are gated. You cannot skip verification or publish without
              recorded approvals. Process authority stays with the facilitator.
            </p>
          </div>
        </div>
      </header>

      <section
        className="scroll-mt-20 border-b border-line bg-surface-sunken/40 py-14 md:py-16"
        aria-labelledby="boundary-visual-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
            <div className="max-w-[28rem]">
              <SectionLabel>Boundary model</SectionLabel>
              <h2
                id="boundary-visual-h"
                className="mt-0 font-display text-h2 font-medium tracking-tight text-ink"
              >
                The room. The gate. The record.
              </h2>
              <p className="mt-4 mb-0 text-sm leading-relaxed text-ink-secondary md:text-base">
                Private written dialogue stays enclosed. Only an approved outcome passes the
                facilitator release gate. The public integrity record shows the sealed instrument —
                never the room transcript.
              </p>
              <ul className="mt-6 m-0 list-none space-y-2 p-0 text-sm leading-relaxed text-ink-secondary">
                <li>
                  <span className="font-medium text-ink">The Room</span> — invite-only written
                  deliberation
                </li>
                <li>
                  <span className="font-medium text-ink">The Gate</span> — facilitator-governed
                  release
                </li>
                <li>
                  <span className="font-medium text-ink">The Record</span> — approved outcomes only
                </li>
              </ul>
            </div>
            <figure className="m-0 min-w-0 overflow-hidden rounded-[var(--sr-radius-lg)] border border-line bg-[var(--sr-bg-sunken)] shadow-[var(--sr-shadow-sm)]">
              <img
                src="/assets/how-it-works-room-gate-record.png"
                alt="Diagram: documents in a private room pass through a glowing release gate to become a single verified approved record"
                width={768}
                height={1152}
                className="block h-auto w-full"
                decoding="async"
                loading="lazy"
              />
              <figcaption className="border-t border-line px-4 py-3 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                Private session rooms · facilitator-governed release · approved outcomes only
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 border-b border-line py-16 md:py-20"
        aria-labelledby="spine-h"
        data-scroll-section
      >
        <div className={publicShellInnerClass}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)] lg:gap-14">
            <div>
              <SectionLabel>Spine</SectionLabel>
              <h2 id="spine-h" className="mt-0 font-display text-h2 font-medium text-ink">
                One vertical process
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-secondary">
                Each stage has a clear owner and an exit condition. The public ledger only appears
                after Release — never as a live feed of the room.
              </p>
              <div className="mt-10 flex flex-col gap-0 border-l-2 border-line pl-6 md:pl-8">
                {PRODUCT_MECHANICS.map((step, index) => {
                  const titles: Record<string, string> = {
                    Configure: 'Set scope, invites, and release rules',
                    Verify: 'Confirm eligibility before the room opens',
                    Facilitate: 'Run structured written rounds under control',
                    Release: 'Publish only approved outcome text',
                  };
                  return (
                    <ProcessStep
                      key={step.step}
                      number={step.step}
                      phase={step.title}
                      title={titles[step.title] ?? step.title}
                    >
                      <p className="m-0 leading-relaxed">{step.body}</p>
                      {index < PRODUCT_MECHANICS.length - 1 ? (
                        <p className="mt-3 mb-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
                          Gate → next stage
                        </p>
                      ) : null}
                    </ProcessStep>
                  );
                })}
              </div>
            </div>

            <aside
              data-demo="how-it-works-guarantees"
              className="sr-mode-room h-fit rounded-[var(--sr-radius-lg)] border border-[color:var(--sr-mode-room-border)] bg-[color:var(--sr-mode-room-bg)] p-5 lg:sticky lg:top-24"
              aria-labelledby="guarantees-h"
            >
              <p
                id="guarantees-h"
                className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint"
              >
                Room guarantees
              </p>
              <ul className="mt-4 m-0 list-none space-y-4 p-0">
                {ROOM_GUARANTEES.map((g) => (
                  <li key={g.title}>
                    <h3 className="m-0 text-sm font-semibold text-ink">{g.title}</h3>
                    <p className="mt-1.5 mb-0 text-xs leading-relaxed text-ink-secondary">
                      {g.body}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section
        className="scroll-mt-20 border-b border-line py-16 md:py-20"
        aria-labelledby="vignette-h"
        data-scroll-section
      >
        <ContentColumn>
          <div className="mb-10">
            <SectionLabel>{howItWorksVignette.eyebrow}</SectionLabel>
            <h2 id="vignette-h" className="mt-0 font-display text-h2 font-medium text-ink">
              {howItWorksVignette.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              {howItWorksVignette.lede}
            </p>
          </div>

          <div className="flex flex-col gap-0">
            {howItWorksVignette.steps.map((step, index) => (
              <ProcessStep
                key={step.label}
                number={String(index + 1).padStart(2, '0')}
                phase={step.stage}
                title={step.title}
              >
                <p className="m-0 leading-relaxed">{step.body}</p>
              </ProcessStep>
            ))}
          </div>

          <p className="sr-vault-card mt-10 px-5 py-4 text-sm leading-relaxed text-ink-secondary">
            <span className="font-medium text-ink">Released: </span>
            {howItWorksVignette.outcome}{' '}
            <Link to="/ledger" className="underline-offset-4 hover:underline">
              Record format
            </Link>
          </p>
        </ContentColumn>
      </section>

      <section className="scroll-mt-20 bg-surface-sunken/50 py-16 md:py-20" data-scroll-section>
        <ContentColumn wide>
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-h2 font-medium text-ink">
              Inside the room vs. the released record
            </h2>
            <Link
              to="/security"
              className="text-sm text-[color:var(--color-text-secondary)] underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {CTA.secondarySecurity} →
            </Link>
          </div>
          <InstitutionalSplit />
        </ContentColumn>
      </section>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.pilotBody}
        secondaryLabel={CTA.secondaryLedger}
        secondaryHref={CTA.secondaryLedgerHref}
      />
    </div>
  );
}
