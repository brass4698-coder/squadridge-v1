import { Link } from 'react-router-dom';
import { LedgerProvenancePanel, TrustBoundarySchematic } from '../../components/institutional';
import {
  CTABlock,
  GlossTerm,
  ImplementationStatusBadge,
  MarketingPageHero,
  MarketingSection,
  PrivatePublicSplit,
  ProseMeasure,
  SectionLabel,
  ShellWidth,
  StickySpineNav,
} from '../../components/shared';
import {
  claimsByIds,
  IMPLEMENTATION_REGISTRY_VERSION,
  TRUST_FEATURE_CLAIM_IDS,
} from '../../data/implementationStatus';
import { CTA } from '../../data/siteMessaging';
import { usePageTitle } from '../../hooks/usePageTitle';

const SECURITY_SECTIONS = [
  { id: 'reviewers', label: 'Limits' },
  { id: 'live-vs-planned', label: 'Status' },
  { id: 'room-and-record', label: 'Architecture' },
  { id: 'verification-anchor', label: 'Anchor' },
  { id: 'safeguards', label: 'Safeguards' },
  { id: 'diligence-packet', label: 'Packet' },
  { id: 'diligence-faq', label: 'Diligence FAQ' },
  { id: 'reviewer-appendix', label: 'Appendix' },
] as const;

/** From Implementation Status Registry — never hardcode LIVE/PLANNED here. */
const TRUST_STATUS = claimsByIds(TRUST_FEATURE_CLAIM_IDS);

const DILIGENCE_FAQ = [
  {
    q: 'Can the operator read room messages today?',
    a: 'Yes. v2 rooms store written dialogue as access-controlled plaintext. Staff with service-role or database access can read it. There is no cryptographic barrier against the operator. Cover this in your MOU — we do not claim Signal-grade E2E.',
  },
  {
    q: 'Does the verification anchor prove when something was released?',
    a: 'No. SHA-256 proves integrity of the approved text. RFC 3161 trusted timestamping is scaffolded (schema + optional client gate) and is not LIVE in the Implementation Status Registry until a verified TSA path stores a token on release.',
  },
  {
    q: 'Are you IOA-certified or a court instrument?',
    a: 'No. Architecture aligns with IOA confidentiality practice as a professional benchmark. We are not an IOA-certified ombuds office and do not invent legal privilege or court-admissible timestamps.',
  },
  {
    q: 'What if parties never agree to release?',
    a: 'Release stays blocked without required approvals and facilitator attestation. The room may close or archive with no public record. Nothing auto-publishes. See How it works → non-consensus path.',
  },
  {
    q: 'Where is operator-blind encryption on the roadmap?',
    a: 'PLANNED. ADR 005 compares per-session key-share wrapping vs Double Ratchet / MLS while preserving facilitator-authored outcome drafting. Status stays Planned until exit criteria in that ADR are met.',
  },
] as const;

/** Precise, checkable statement of who can read room content. */
const OPERATOR_ACCESS = [
  {
    heading: 'Inside the room',
    body: 'Written messages are stored as plaintext in Postgres. Direct API access is restricted by row-level security to the facilitator of that session; participants reach their room only through token-scoped functions.',
  },
  {
    heading: 'Operator and infrastructure',
    body: 'Staff with service-role or database access can read room content. There is no cryptographic barrier between us and the room — assume operator-readable and cover it in your MOU.',
  },
  {
    heading: 'Facilitator-only fields',
    body: 'Facilitator notes are excluded from the columns published clients may read, so they cannot leak through the ledger API alongside a released record.',
  },
  {
    heading: 'What never leaves',
    body: 'Room dialogue is never published, exported to the ledger, or importable into an outcome. The release path only accepts facilitator-authored text.',
  },
] as const;

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
    label: 'Not anonymity as a legal guarantee',
    body: 'Directional anonymity on the public record is a system property — not anonymity from the operator, and not a legal guarantee against re-identification.',
  },
  {
    label: 'Not legal privilege',
    body: 'Process infrastructure, not a legal instrument. We are not an IOA-certified ombuds office. Counsel decides privilege for your matter.',
  },
  {
    label: 'Not court-admissible timestamps',
    body: 'SHA-256 proves integrity of the released file. RFC 3161 trusted timestamping is planned, not live — do not treat anchors as court evidence of time today.',
  },
  {
    label: 'Not whistleblower tooling',
    body: 'If your threat model includes state-level adversaries, assess that risk before piloting.',
  },
  {
    label: 'Not surveillance',
    body: 'Not predictive policing, continuous monitoring, or early-warning product claims — facilitation only. Optional tone signals are advisory; facilitators control pacing.',
  },
] as const;

const ROOM_ITEMS = [
  'Written rounds, drafts, prompts, and private signals',
  'Invite-only entry after facilitator-defined verification',
  'Raw dialogue never appears on the ledger or in public exports',
] as const;

const RECORD_ITEMS = [
  'Approved outcome text plus limited metadata — not a transcript',
  'Verification anchor confirms the published file is unaltered',
  'Designated approvals and an explicit facilitator release action',
] as const;

const ANCHOR_PROVES = [
  'The released record is unaltered since publication (SHA-256 integrity)',
  'It was issued through the SquadRidge release process',
  'Listed metadata matches the anchored file',
] as const;

const ANCHOR_DOES_NOT = [
  'What was said inside the private room',
  'Who each participant is',
  'External endorsement of the substance',
  'Independent proof of when the hash was created (RFC 3161 TSA — planned, not shipped)',
] as const;

const OMBUDS_ALIGNED = [
  {
    heading: 'Independence & informality',
    body: 'The room is a governed informal channel — distinct from formal grievance, litigation, or public forum tracks.',
  },
  {
    heading: 'Impartial process authority',
    body: 'The facilitator owns stages and release. Optional AI heat signals are private and advisory — never an autonomous mute.',
  },
  {
    heading: 'Confidentiality architecture',
    body: 'Aligned with established ombuds practice standards: no public transcript; identifying dialogue stays in the room; only an approved outcome may leave after release.',
  },
  {
    heading: 'Narrow exceptions (policy template)',
    body: 'Pilot ground rules may reserve imminent serious harm, defense against misconduct claims, and explicit permission — operational policy, not product-invented legal privilege.',
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
 */
export function SecurityPage() {
  usePageTitle('Security');

  return (
    <div className="sr-security-page" data-page="security">
      <div data-demo="security-hero">
        <MarketingPageHero
          label="Security"
          title="Privacy boundaries you can explain"
          lead={
            <>
              <p>
                Trust comes from boundaries you can diligence: verification before entry,
                facilitator authority over release, and a record integrity check — not continuous
                monitoring or overclaimed cryptography.
              </p>
              <p className="mt-3 mb-0 text-sm text-ink-faint">
                What each layer protects — and what we refuse to overclaim — for facilitators and
                security reviewers alike.
              </p>
            </>
          }
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

      <StickySpineNav stages={SECURITY_SECTIONS} aria-label="Security sections" />

      <section
        id="reviewers"
        data-demo="security-limits"
        className="sr-security-limits scroll-mt-28 border-b border-line bg-surface-sunken/60 py-12 text-left md:py-16"
        aria-labelledby="limits-h"
      >
        <ShellWidth>
          <div className="mb-8 max-w-measure">
            <SectionLabel>Documented limits</SectionLabel>
            <h2 id="limits-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
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
      <MarketingSection
        id="live-vs-planned"
        tone="sunken"
        density="compact"
        className="scroll-mt-28"
      >
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Implementation status</SectionLabel>
            <h2 id="status-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Live today, and what is not
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              A trust feature is either running in the product or it is not. Rows below come from
              the Implementation Status Registry (v{IMPLEMENTATION_REGISTRY_VERSION}) — the same
              source Home, How it works, and Ledger badges use — so marketing copy cannot drift
              ahead of shipped code.
            </p>
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 sm:grid-cols-2">
            {TRUST_STATUS.map((item) => (
              <li key={item.id} className="bg-surface-elevated px-5 py-5">
                <ImplementationStatusBadge status={item.status} />
                <p className="mt-2 mb-0 text-sm font-semibold text-ink">{item.label}</p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">
                  {item.summary}
                </p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="operator-access" density="compact">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Operator access</SectionLabel>
            <h2 id="operator-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Who can read the room
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              The uncomfortable answer, stated plainly, because a facilitator has to be able to
              explain it to the people in the room before they type anything.
            </p>
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 sm:grid-cols-2">
            {OPERATOR_ACCESS.map((item) => (
              <li key={item.heading} className="bg-surface-elevated px-5 py-5">
                <p className="m-0 text-sm font-semibold text-ink">{item.heading}</p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
              </li>
            ))}
          </ul>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="room-and-record" density="default" className="scroll-mt-28">
        <ShellWidth>
          <div className="mb-10 max-w-measure">
            <SectionLabel>Architecture</SectionLabel>
            <h2 id="layers-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Private session vs released record
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Separation is structural, not a policy toggle. What stays private, what can be
              released, and what outsiders can verify are different questions. Process walkthrough
              on{' '}
              <Link
                to={CTA.secondaryProcessHref}
                className="text-ink-secondary underline-offset-4 hover:underline"
              >
                How it works
              </Link>
              .
            </p>
          </div>
          <PrivatePublicSplit
            size="compact"
            privateHeading="Private session"
            publicHeading="Released record"
            bridgeLabel="Facilitator release gate"
            privateFooter="Stays inside the room — never auto-published"
            publicFooter="Leaves only after designated approvals"
            privateItems={[...ROOM_ITEMS]}
            publicItems={[...RECORD_ITEMS]}
          />
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="confidentiality-precedent" density="compact">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Confidentiality precedent</SectionLabel>
            <h2 id="ombuds-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Aligned with established ombuds practice standards
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              SquadRidge mirrors the International Ombuds Association confidentiality architecture —
              independence, impartiality, informality, and confidentiality — as a professional
              benchmark for how the room relates to the record. We are not an IOA-certified ombuds
              office, and we do not invent legal privilege.
            </p>
          </ProseMeasure>
          <ul className="m-0 grid list-none gap-px overflow-hidden border border-line bg-line p-0 sm:grid-cols-2">
            {OMBUDS_ALIGNED.map((item) => (
              <li key={item.heading} className="bg-surface-elevated px-5 py-5">
                <p className="m-0 text-sm font-semibold text-ink">{item.heading}</p>
                <p className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{item.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-measure text-xs leading-relaxed text-ink-faint">
            Sources:{' '}
            <a
              href="https://www.ombudsassociation.org/assets/docs/IOA_Standards_of_Practice_Oct09.pdf"
              className="underline-offset-2 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              IOA Standards of Practice
            </a>
            {' · '}
            <a
              href="https://www.nasa.gov/wp-content/uploads/2019/05/ioa_standards_of_practice_tagged.pdf"
              className="underline-offset-2 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              NASA-hosted IOA SoP
            </a>
            . Full synthesis in internal research brief.
          </p>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection
        id="verification-anchor"
        tone="sunken"
        density="compact"
        className="scroll-mt-28"
      >
        <ShellWidth>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
            <div>
              <SectionLabel>Verification anchor</SectionLabel>
              <h2 id="anchor-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
                What the anchor proves — and does not
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-secondary">
                Today the <GlossTerm term="verification-anchor" /> is a SHA-256 hash of the released
                record at publication. Anyone with the record can recompute it. That proves{' '}
                <em className="not-italic text-ink">integrity</em> — not an independently attested{' '}
                <em className="not-italic text-ink">when</em>. <GlossTerm term="rfc-3161" /> trusted
                timestamping is the planned next layer beside the hash; it is not requested during
                release today.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="sr-security-proves border p-5">
                  <p className="sr-security-proves-label sr-verify m-0 text-sm font-semibold">
                    <span className="sr-verify-dot" aria-hidden />
                    Proves
                  </p>
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
      <MarketingSection id="safeguards" density="compact" className="scroll-mt-28">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Operations</SectionLabel>
            <h2 id="safeguards-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Operational safeguards
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Process controls that keep the room closed and release deliberate — not a feature
              grid.
            </p>
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
      <MarketingSection id="diligence-packet" density="compact" className="scroll-mt-28">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Trust &amp; diligence packet</SectionLabel>
            <h2 id="packet-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Downloadable packet for board and funder sign-off
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              Version-controlled summary generated from the Implementation Status Registry: current
              vs planned posture, threat-model bounds, residency, subprocessors, incident targets,
              and deletion on pilot termination. Forward it during the 5–7 day manual review window.
            </p>
          </ProseMeasure>
          <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
            <li>
              <a
                href="/diligence/trust-diligence-packet.md"
                className="btn-institutional btn-institutional--primary"
                download
              >
                Download diligence packet (.md)
              </a>
            </li>
            <li>
              <a
                href="/diligence/sample-approved-record.md"
                className="btn-institutional btn-institutional--ghost"
                download
              >
                Sample approved record
              </a>
            </li>
            <li>
              <a
                href="/diligence/sample-audit-trail-export.md"
                className="btn-institutional btn-institutional--ghost"
                download
              >
                Sample audit-trail export
              </a>
            </li>
          </ul>
          <p className="mt-4 mb-0 text-xs text-ink-faint">
            Samples are synthetic and labeled illustrative — not verifiable live releases.
            Operator-blind design options: ADR 005 in the repository.
          </p>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection id="diligence-faq" tone="sunken" density="compact" className="scroll-mt-28">
        <ShellWidth>
          <ProseMeasure className="mb-8">
            <SectionLabel>Diligence FAQ</SectionLabel>
            <h2 id="diligence-faq-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
              Objections answered inline
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              For evaluators who will not open a separate FAQ page. Limits stay above safeguards —
              these answers do not soften them.
            </p>
          </ProseMeasure>
          <dl className="m-0 space-y-0 border border-line">
            {DILIGENCE_FAQ.map((item) => (
              <div
                key={item.q}
                className="border-b border-line bg-surface-elevated px-5 py-5 last:border-b-0"
              >
                <dt className="text-sm font-semibold text-ink">{item.q}</dt>
                <dd className="mt-2 mb-0 text-sm leading-relaxed text-ink-secondary">{item.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 mb-0 text-sm text-ink-secondary">
            Broader product FAQ:{' '}
            <Link to="/faq" className="text-brand underline-offset-2 hover:underline">
              /faq
            </Link>
            .
          </p>
        </ShellWidth>
      </MarketingSection>
      <MarketingSection
        id="reviewer-appendix"
        tone="bordered"
        density="compact"
        className="scroll-mt-28"
      >
        <ShellWidth>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] lg:gap-16">
            <div className="max-w-measure">
              <SectionLabel>For reviewers</SectionLabel>
              <h2 id="appendix-h" className="mt-0 font-heading text-h2 font-semibold text-ink">
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
                    SHA-256 (
                    <GlossTerm term="ledger-sha">
                      <span className="font-mono">ledger_sha</span>
                    </GlossTerm>
                    ) of the <GlossTerm term="canonicalised" /> approved instrument at facilitator
                    sign-off — integrity of the released text. Not a Merkle tree of room messages,
                    not a live RFC 3161 Time Stamp Authority token, and not on-chain notarisation in
                    the current pilot. Optional `timestamp_token` columns exist as a scaffold for a
                    future TSA path; release does not request a token today. Semaphore Merkle
                    groups, where used, apply to identity verification cohorts — not to ledger
                    anchoring.
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-ink">Release preconditions</dt>
                  <dd className="mt-1 mb-0 text-sm leading-relaxed text-ink-secondary">
                    Release is refused unless the session has ended, every approval is recorded
                    against the current instrument hash, a facilitator authorship attestation covers
                    that same hash, and no approved text repeats a room message verbatim. Revising
                    the instrument resets approvals and clears the attestation, and each refused
                    attempt is written to the session audit trail.
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
        statusLine={CTA.pilotStatusLine}
      />
    </div>
  );
}
