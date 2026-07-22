import { Link } from 'react-router-dom';
import { CONFIDENTIALITY_POINTS, VERIFICATION_POINTS } from '../../data/institutionalHome';
import { LedgerProvenancePanel, TrustBoundarySchematic } from '../../components/institutional';
import { CTABlock, ShellWidth } from '../../components/shared';
import { CTA } from '../../data/siteMessaging';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

const NOT_CLAIMED = [
  {
    short: 'Not E2E today',
    line: 'Session content is not end-to-end encrypted against the operator. Transport is TLS. Room-level E2EE is on the roadmap.',
  },
  {
    short: 'Not anonymity',
    line: 'We do not guarantee anonymity. We protect identity inside the session context and control what is released.',
  },
  {
    short: 'Not legal privilege',
    line: 'SquadRidge is process infrastructure, not a legal instrument. Counsel decides privilege for your matter.',
  },
  {
    short: 'Not whistleblower tooling',
    line: 'If your threat model includes state-level adversaries, assess accordingly before piloting.',
  },
  {
    short: 'Not surveillance',
    line: 'Not predictive policing, continuous monitoring, or early-warning product claims — facilitation only.',
  },
] as const;

const SAFEGUARDS = [
  {
    heading: 'Verified access only',
    body: 'Facilitator-configured verification before entry. You set the bar.',
  },
  {
    heading: 'Controlled release',
    body: 'Nothing publishes without designated approvals. The platform cannot release unilaterally.',
  },
  {
    heading: 'Text room only',
    body: 'No audio or video capture. Written rounds under facilitator control.',
  },
  {
    heading: 'Minimal retention',
    body: 'Retain what facilitation and the record require. Released ledger entries are permanent by design.',
  },
  {
    heading: 'Identity isolation',
    body: 'Contact details are not shared between participants or written onto the public record.',
  },
  {
    heading: 'Auditable release chain',
    body: 'Lifecycle metadata is logged — not message bodies. Approvals precede release.',
  },
  {
    heading: 'Invite-only surface',
    body: 'No public forum. Access requires invitation or an approved organisational role.',
  },
] as const;

/**
 * Security — limits lead. Architecture second. Safeguards as a docket, not a feature grid.
 * Visual tone: calm institutional trust / peace-tech — not cyber-SaaS.
 */
export function SecurityPage() {
  return (
    <div className="sr-security-page">
      <header className="border-b border-line pt-16 pb-14 md:pt-20" data-demo="security-hero">
        <div className={publicShellInnerClass}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16">
            <div>
              <p className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.14em] text-ink-faint">
                Security · Documented limits
              </p>
              <h1 className="mt-4 font-display text-display font-medium text-ink">
                Verified, not exposed.
              </h1>
              <p className="mt-5 max-w-prose text-base leading-relaxed text-ink-secondary">
                The room and the record are different objects. Trust comes from access boundaries
                and release gates — not continuous monitoring or overclaimed cryptography.
              </p>
            </div>
            <TrustBoundarySchematic className="w-full" />
          </div>
        </div>
      </header>

      {/* Limits first — the distinctive trust move */}
      <section
        id="reviewers"
        className="sr-security-limits scroll-mt-20 border-b border-line py-14 md:py-16"
        aria-labelledby="limits-h"
      >
        <ShellWidth>
          <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-8">
            <h2 id="limits-h" className="font-display text-h2 font-medium text-ink">
              What we do not claim
            </h2>
            <p className="max-w-sm text-sm text-ink-faint">
              Read this before the safeguards. Accurate expectations are part of the product.
            </p>
          </div>
          <ol className="divide-y divide-line overflow-hidden rounded-lg border border-line">
            {NOT_CLAIMED.map((item, i) => (
              <li
                key={item.short}
                className="sr-security-limit-row grid gap-3 px-5 py-5 md:grid-cols-[8rem_minmax(0,1fr)] md:gap-8"
              >
                <div className="font-mono text-xs text-ink-faint">
                  <span className="text-ink-subtle">{String(i + 1).padStart(2, '0')}</span>
                  <span className="sr-security-limit-label mt-1 block font-medium uppercase tracking-[0.08em]">
                    {item.short}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-ink-secondary">{item.line}</p>
              </li>
            ))}
          </ol>
        </ShellWidth>
      </section>

      <section className="border-b border-line py-16 md:py-20">
        <ShellWidth>
          <h2 className="font-display text-h2 font-medium text-ink">Two layers</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-2">
            <div className="sr-security-layer-private p-6 md:p-8">
              <p className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
                Private session
              </p>
              <ul className="mt-6 space-y-5">
                {CONFIDENTIALITY_POINTS.map((p) => (
                  <li key={p.title}>
                    <h3 className="text-sm font-semibold text-ink">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{p.body}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sr-security-layer-record p-6 md:p-8">
              <p className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.12em] text-ink-faint">
                Released record
              </p>
              <ul className="mt-6 space-y-5">
                {VERIFICATION_POINTS.map((p) => (
                  <li key={p.title}>
                    <h3 className="text-sm font-semibold text-ink">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{p.body}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-ink-faint">
                <Link to="/how-it-works" className="text-brand underline-offset-4 hover:underline">
                  Process overview
                </Link>
              </p>
            </div>
          </div>
        </ShellWidth>
      </section>

      <section
        id="verification-anchor"
        className="scroll-mt-20 border-b border-line bg-surface-secondary/50 py-16"
      >
        <ShellWidth>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
            <div>
              <h2 className="font-display text-h2 font-medium text-ink">
                What the anchor proves — and does not.
              </h2>
              <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink-secondary">
                A verification anchor is a cryptographic hash of the released record at the moment
                of release. Anyone with the record can recompute it.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="sr-security-proves border p-5">
                  <p className="sr-security-proves-label font-mono text-[length:var(--text-label)] uppercase tracking-[0.1em]">
                    Proves
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
                    <li>Record unaltered since release</li>
                    <li>Issued through SquadRidge process</li>
                    <li>Listed metadata matches the file</li>
                  </ul>
                </div>
                <div className="sr-security-nonprove border border-line p-5">
                  <p className="font-mono text-[length:var(--text-label)] uppercase tracking-[0.1em] text-ink-faint">
                    Does not prove
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
                    <li>What was said in the room</li>
                    <li>Who each participant is</li>
                    <li>External endorsement of substance</li>
                  </ul>
                </div>
              </div>
            </div>
            <LedgerProvenancePanel />
          </div>
        </ShellWidth>
      </section>

      <section className="border-b border-line py-16">
        <ShellWidth>
          <h2 className="font-display text-h2 font-medium text-ink">Operational safeguards</h2>
          <ol className="mt-10">
            {SAFEGUARDS.map((s, i) => (
              <li
                key={s.heading}
                className="grid gap-2 border-t border-line py-5 md:grid-cols-[3rem_12rem_minmax(0,1fr)] md:gap-8"
              >
                <span className="font-mono text-xs text-ink-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-sm font-semibold text-ink">{s.heading}</h3>
                <p className="text-sm leading-relaxed text-ink-secondary">{s.body}</p>
              </li>
            ))}
          </ol>
        </ShellWidth>
      </section>

      <section className="border-b border-line py-12">
        <ShellWidth>
          <details className="max-w-measure overflow-hidden rounded-lg border border-line bg-surface-elevated">
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-ink">
              Technical appendix — engineers & auditors
            </summary>
            <div className="space-y-3 border-t border-line px-5 py-5 text-sm leading-relaxed text-ink-secondary">
              <p>Transport: TLS 1.2+ (not message-level E2E against the operator).</p>
              <p>
                v2 session storage: facilitator-led messages in Postgres as access-controlled
                plaintext. Legacy squad chat uses application-layer AES-GCM with operator-readable
                keys.
              </p>
              <p>
                Verification anchor: SHA-256 of canonicalised released record at facilitator
                sign-off.
              </p>
              <p>Approvals must be recorded before release. Audit events are metadata-only.</p>
            </div>
          </details>
          <a
            href="mailto:security@squadridge.com"
            className="btn-institutional btn-institutional--ghost mt-8 inline-flex"
          >
            security@squadridge.com
          </a>
        </ShellWidth>
      </section>

      <CTABlock
        headline="Review the trust model you can explain to parties."
        body={CTA.pilotBody}
        secondaryLabel={CTA.secondaryLedger}
        secondaryHref={CTA.secondaryLedgerHref}
      />
    </div>
  );
}
