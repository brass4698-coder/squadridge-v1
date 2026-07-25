import { Link } from 'react-router-dom';
import { LedgerProvenancePanel, TrustBoundarySchematic } from '../../components/institutional';
import {
  CTABlock,
  MarketingPageHero,
  MarketingSection,
  ProseMeasure,
  SectionLabel,
  ShellWidth,
} from '../../components/shared';
import { CTA } from '../../data/siteMessaging';
import { usePageTitle } from '../../hooks/usePageTitle';

const NOT_CLAIMED = [
  {
    label: 'Not E2E today',
    body: 'Session content is not end-to-end encrypted against the operator. Transport uses TLS. Room-level E2EE is on the roadmap.',
  },
  {
    label: 'Not full ZKP',
    body: 'We do not claim platform-wide zero-knowledge proofs. Prefer the private room, facilitator release, and approved outcomes model.',
  },
  {
    label: 'Not anonymity',
    body: 'We do not guarantee anonymity. Identity is protected inside the session context; release controls what leaves.',
  },
  {
    label: 'Not legal privilege',
    body: 'Process infrastructure, not a legal instrument. Counsel decides privilege for your matter.',
  },
  {
    label: 'Not whistleblower tooling',
    body: 'If your threat model includes state-level adversaries, assess that risk before piloting.',
  },
  {
    label: 'Not surveillance',
    body: 'Not predictive policing, continuous monitoring, or early-warning product claims — facilitation only.',
  },
] as const;

const ROOM_VS_RECORD = [
  {
    mode: 'private' as const,
    title: 'Private session',
    summary: 'Stays inside the room',
    points: [
      {
        label: 'Stays private',
        body: 'Written rounds, drafts, prompts, and private signals to the facilitator.',
      },
      { label: 'Access', body: 'Invite-only entry after facilitator-defined verification.' },
      {
        label: 'Never auto-published',
        body: 'Raw dialogue does not appear on the ledger or in public exports.',
      },
    ],
  },
  {
    mode: 'record' as const,
    title: 'Released record',
    summary: 'Leaves only after approval',
    points: [
      {
        label: 'What is released',
        body: 'Approved outcome text plus limited metadata — not a transcript.',
      },
      {
        label: 'What is verifiable',
        body: 'A verification anchor confirms the published file is unaltered since release.',
      },
      {
        label: 'Who authorises',
        body: 'Designated approvals and an explicit facilitator release action.',
      },
    ],
  },
] as const;

const ANCHOR_PROVES = [
  'The released record is unaltered since publication',
  'It was issued through the SquadRidge release process',
  'Listed metadata matches the anchored file',
] as const;

const ANCHOR_DOES_NOT = [
  'What was said inside the private room',
  'Who each participant is',
  'External endorsement of the substance',
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
 */
export function SecurityPage() {
  usePageTitle('Security');

  return (
    <div className="sr-security-page" data-page="security">
      <div data-demo="security-hero">
        <MarketingPageHero
          label="Security"
          title="Privacy boundaries you can explain"
          lead="The room and the record are different objects. Trust comes from verification before entry, facilitator authority over release, and record integrity — not continuous monitoring or overclaimed cryptography."
          aside={<TrustBoundarySchematic className="w-full" />}
          meta={
            <p className="text-sm text-ink-faint">
              Documented limits first. Safeguards second.{' '}
              <a
                href="#reviewers"
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                Jump to limits
              </a>
            </p>
          }
        />
      </div>
      <section
        id="reviewers"
        data-demo="security-limits"
        className="sr-security-limits scroll-mt-20 border-b border-line bg-surface-sunken/60 py-12 text-left md:py-16"
        aria-labelledby="limits-h"
      >
        <ShellWidth>
          <div className="mb-8 max-w-measure">
            <SectionLabel>Documented limits</SectionLabel>
            <h2 id="limits-h" className="mt-0 font-display text-h2 font-medium text-ink">
              What we do not do
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Read this before the safeguards. Accurate expectations are part of the product.
            </p>
          </div>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 sm:grid-cols-2 lg:grid-cols-3">
            {NOT_CLAIMED.map((item) => (
              <li key={item.label} className="sr-security-limit-row bg-surface-elevated px-5 py-5">
                <p className="m-0 text-sm font-semibold text-ink">{item.label}</p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </section>
      <MarketingSection id="room-and-record" density="default">
        <ShellWidth>
          <div className="mb-10 max-w-measure">
            <SectionLabel>Architecture</SectionLabel>
            <h2 id="layers-h" className="mt-0 font-display text-h2 font-medium text-ink">
              Private session vs released record
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Separation is structural, not a policy toggle. What stays private, what can be
              released, and what outsiders can verify are different questions.
            </p>
          </div>
          <div className="sr-vault-card grid gap-px overflow-hidden bg-line lg:grid-cols-2">
            {ROOM_VS_RECORD.map((layer) => (
              <div
                key={layer.title}
                className={
                  layer.mode === 'private'
                    ? 'sr-security-layer-private p-6 md:p-8'
                    : 'sr-security-layer-record p-6 md:p-8'
                }
              >
                <p className="m-0 text-sm font-semibold text-ink">{layer.title}</p>
                <p className="mt-1 text-sm text-ink-faint">{layer.summary}</p>
                <ul className="mt-6 m-0 list-none space-y-5 p-0">
                  {layer.points.map((p) => (
                    <li key={p.label}>
                      <h3 className="m-0 text-sm font-semibold text-ink">{p.label}</h3>
                      <p className="mt-1.5 mb-0 text-sm leading-relaxed text-ink-secondary">
                        {p.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-faint">
            <Link
              to={CTA.secondaryProcessHref}
              className="text-brand underline-offset-4 hover:underline"
            >
              {CTA.secondaryProcess}
            </Link>
          </p>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="verification-anchor" tone="sunken" density="compact">
        <ShellWidth>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
            <div>
              <SectionLabel>Verification anchor</SectionLabel>
              <h2 id="anchor-h" className="mt-0 font-display text-h2 font-medium text-ink">
                What the anchor proves — and does not
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-secondary">
                A verification anchor is a cryptographic hash of the released record at the moment
                of release. Anyone with the record can recompute it.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="sr-security-proves border p-5">
                  <p className="sr-security-proves-label m-0 text-sm font-semibold">Proves</p>
                  <ul className="mt-3 m-0 list-none space-y-2 p-0 text-sm text-ink-secondary">
                    {ANCHOR_PROVES.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span aria-hidden className="text-ink-faint">
                          ·
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="sr-security-nonprove border border-line p-5">
                  <p className="m-0 text-sm font-semibold text-ink-faint">Does not prove</p>
                  <ul className="mt-3 m-0 list-none space-y-2 p-0 text-sm text-ink-secondary">
                    {ANCHOR_DOES_NOT.map((line) => (
                      <li key={line} className="flex gap-2">
                        <span aria-hidden className="text-ink-faint">
                          ·
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <LedgerProvenancePanel />
          </div>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="safeguards" density="compact">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Operations</SectionLabel>
            <h2 id="safeguards-h" className="mt-0 font-display text-h2 font-medium text-ink">
              Operational safeguards
            </h2>
          </ProseMeasure>
          <ol className="m-0 list-none p-0">
            {SAFEGUARDS.map((s, i) => (
              <li
                key={s.heading}
                className="grid gap-2 border-t border-line py-5 md:grid-cols-[3rem_minmax(10rem,12rem)_minmax(0,1fr)] md:gap-8"
              >
                <span className="font-mono text-xs text-ink-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="m-0 text-sm font-semibold text-ink">{s.heading}</h3>
                <p className="m-0 max-w-prose text-sm leading-relaxed text-ink-secondary">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="reviewer-appendix" tone="bordered" density="compact">
        <ShellWidth>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:gap-16">
            <div className="max-w-measure">
              <SectionLabel>For reviewers</SectionLabel>
              <h2 id="appendix-h" className="mt-0 font-display text-h2 font-medium text-ink">
                Technical appendix
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Concise notes for engineers and auditors. Full threat model is available on request
                during diligence.
              </p>
              <dl className="mt-8 m-0 space-y-4 border-t border-line pt-6">
                <div>
                  <dt className="text-sm font-semibold text-ink">Transport</dt>
                  <dd className="mt-1 mb-0 text-sm leading-relaxed text-ink-secondary">
                    TLS 1.2+ — not message-level E2E against the operator.
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-ink">Session storage</dt>
                  <dd className="mt-1 mb-0 text-sm leading-relaxed text-ink-secondary">
                    Facilitator-led messages in Postgres as access-controlled plaintext. Legacy
                    squad chat uses application-layer AES-GCM with operator-readable keys.
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-ink">Verification anchor</dt>
                  <dd className="mt-1 mb-0 text-sm leading-relaxed text-ink-secondary">
                    SHA-256 (`ledger_sha`) of the canonicalised approved instrument at facilitator
                    sign-off. This is an integrity hash of the released text — not a Merkle tree of
                    room messages, and not a public timestamping authority or on-chain notarisation
                    in the current pilot. Semaphore Merkle groups, where used, apply to identity
                    verification cohorts — not to ledger anchoring.
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-ink">Export &amp; citation</dt>
                  <dd className="mt-1 mb-0 text-sm leading-relaxed text-ink-secondary">
                    Released dossiers support copyable citation text and verification against the
                    listed anchor. Machine-readable citation APIs and bulk export formats for
                    institutional CMS integration are diligence-scoped — not a public self-serve API
                    today.
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-ink">Audit log access</dt>
                  <dd className="mt-1 mb-0 text-sm leading-relaxed text-ink-secondary">
                    Approvals must be recorded before release. Session audit trails are
                    metadata-only (lifecycle events — not message bodies). Pilot partners receive
                    export of the audit trail after close under the MOU; there is no public audit
                    feed.
                  </dd>
                </div>
              </dl>
            </div>
            <aside className="h-fit border border-line bg-surface-elevated p-6">
              <p className="m-0 text-sm font-semibold text-ink">Security contact</p>
              <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
                Responsible disclosure and diligence questions.
              </p>
              <a
                href="mailto:security@squadridge.com"
                className="btn-institutional btn-institutional--ghost mt-6 inline-flex"
              >
                security@squadridge.com
              </a>
            </aside>
          </div>
        </ShellWidth>
      </MarketingSection>
      <CTABlock
        headline={CTA.pilotHeadline}
        body={CTA.closeSecurity}
        secondaryLabel={CTA.secondaryBriefingLabel}
        secondaryHref={CTA.secondaryBriefingHref}
      />{' '}
    </div>
  );
}
