import { Link } from 'react-router-dom';
import { CTABlock, ProseMeasure } from '../../components/shared';
import { CTA } from '../../data/siteMessaging';
import {
  LedgerProvenancePanel,
  ProtectedThresholdVisual,
  SessionLedgerSchematic,
} from '../../components/institutional';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

const FOR_MEDIATORS = [
  'You define who is in the room, when they can speak, and in what format.',
  'You control when (or if) an outcome leaves the room.',
  'You can give parties a verifiable record without exposing raw session content or identities.',
];

const NEVER_DO = [
  'Publish raw session dialogue or a public transcript.',
  'Host video, audio, or real-time calls.',
  'Auto-release outcomes without facilitator action.',
  'Claim E2E encryption or legal privilege without sign-off.',
  'Replace mediation judgment with automated decisions.',
  'Present as surveillance or early-warning monitoring.',
];

/**
 * About — thesis, architecture schematic, commitments. Cut the stacked list kit.
 */
export function AboutPage() {
  return (
    <div>
      <header className="border-b border-line pt-16 pb-14 md:pt-20">
        <div className={publicShellInnerClass}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-faint">
                About
              </p>
              <h1 className="mt-4 max-w-[18ch] font-display text-display font-medium text-ink">
                Why we built SquadRidge
              </h1>
              <p className="mt-5 max-w-prose text-base leading-relaxed text-ink-secondary">
                Most mediation does not fail because people refuse to talk. It fails because the
                room is unsafe, the process is unclear, or the outcome cannot be trusted outside the
                room.
              </p>
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink-faint">
                Structured facilitation infrastructure for high-stakes matters — not a collaboration
                app, not a monitoring product.
              </p>
            </div>
            <ProtectedThresholdVisual className="w-full" />
          </div>
        </div>
      </header>

      <section className="border-b border-line bg-surface-sunken/50 py-14 md:py-16">
        <div className={publicShellInnerClass}>
          <h2 className="font-display text-h2 font-medium text-ink">
            Private session → approval gate → public record
          </h2>
          <p className="mt-3 max-w-prose text-sm text-ink-secondary">
            Dialogue stays inside a protected session until you approve an outcome and release it
            with verifiable provenance.
          </p>
          <div className="mt-10 border border-line bg-surface p-4 md:p-6">
            <SessionLedgerSchematic />
          </div>
        </div>
      </section>

      <section className="border-b border-line py-16">
        <div className={publicShellInnerClass}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <ProseMeasure className="space-y-5 text-sm leading-relaxed text-ink-secondary md:text-base">
              <p>
                There is no purpose-built platform that combines participant protection, facilitator
                process control, and a credible route to a public outcome record. SquadRidge is a
                written room only — no calls, no side channels — so faces and voices stay out of
                scope.
              </p>
              <p className="font-medium text-ink">For mediators, this means:</p>
              <ul className="space-y-2">
                {FOR_MEDIATORS.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-line-strong" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                Early access: private pilots with municipal community safety teams, mediators, and
                peacebuilding partners — co-designed before broader release.
              </p>
            </ProseMeasure>
            <LedgerProvenancePanel />
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-surface-sunken/40 py-14">
        <div className={publicShellInnerClass}>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-h2 font-medium text-ink">We will never</h2>
              <p className="mt-2 text-sm text-ink-faint">
                Architectural commitments — see{' '}
                <Link to="/security" className="underline-offset-4 hover:underline">
                  Security
                </Link>
                .
              </p>
              <ul className="mt-6 space-y-3">
                {NEVER_DO.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-ink-secondary">
                    <span aria-hidden className="text-ink-faint">
                      ×
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-line bg-surface-elevated p-6 md:p-8">
              <h2 className="font-display text-h2 font-medium text-ink">When it may fit</h2>
              <ul className="mt-6 space-y-4 text-sm leading-relaxed text-ink-secondary">
                <li>
                  Parties need a protected space; institutions still need a credible outcome record.
                </li>
                <li>Multi-party matters where process control and auditability are critical.</li>
                <li>
                  You need to show a governed dialogue produced an outcome — without exposing who
                  said what.
                </li>
              </ul>
              <p className="mt-6 text-sm text-ink-faint">
                Infrastructure for your craft — not a replacement for it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.pilotBody}
        secondaryLabel={CTA.secondaryUseCases}
        secondaryHref={CTA.secondaryUseCasesHref}
      />
    </div>
  );
}
