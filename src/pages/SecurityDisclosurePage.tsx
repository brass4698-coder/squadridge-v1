import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/ui/StatusBadge';

/**
 * Plain-language security posture for participants, facilitators, and security
 * reviewers (mirrors `docs/security/encryption-scope.md` and
 * `docs/security/threat-model.md`).
 *
 * Layout: sticky TOC sidebar on `lg+`; inline TOC stacks above content on
 * smaller viewports. Content is honest about scope (no marketing E2E claims)
 * and ties each boundary to the risk it actually mitigates so a security
 * reviewer can follow the threat model in one read.
 *
 * IMPORTANT: Any change here that strengthens a claim must land in lockstep
 * with the threat model and encryption-scope docs. Update
 * `LAST_REVIEWED_AGAINST_CODE` whenever the claim set changes.
 */

const LAST_REVIEWED_AGAINST_CODE = '2026-04-30';

export function SecurityDisclosurePage() {
  return (
    <div className="mx-auto w-full max-w-[64rem] pb-20 pt-6 md:pt-8">
      <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 pt-1">
            <SecurityTableOfContents variant="sidebar" />
          </div>
        </aside>

        <article className="mx-auto w-full max-w-copy">
          <SecurityHeader />
          <SecurityAtAGlanceSection className="mt-8" />
          <SecurityTableOfContents variant="inline" className="mt-8 lg:hidden" />

          <div className="mt-10 flex flex-col gap-7 md:gap-8">
            <SecurityPrivacyModelSection />
            <SecurityOperatorVisibilitySection />
            <SecurityVerificationSection />
            <SecurityPermissionsSection />
            <SecurityDeploymentSection />
            <SecurityNotImplementedSection />
            <SecurityFaqSection />
            <SecurityReferencesSection />
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-10 sm:gap-y-3">
            <Link
              to="/#waitlist"
              className="font-sans text-[0.875rem] font-medium text-[#94a3b8] underline-offset-4 transition-colors hover:text-[#cbd5e1] hover:underline"
            >
              Request pilot access
            </Link>
            <Link
              to="/"
              className="font-sans text-[0.8125rem] text-slate-600 underline-offset-4 transition-colors hover:text-slate-500 hover:underline"
            >
              Return home
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

function SecurityHeader() {
  return (
    <header>
      <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        SECURITY DISCLOSURE
      </p>
      <h1 className="mt-2.5 font-sans text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-[1.15] tracking-tight text-[#f1f5f9]">
        Security boundaries in the current release
      </h1>
      <p className="mt-4 max-w-[40rem] font-sans text-[0.95rem] leading-[1.65] text-[#a8b2c1]">
        This page describes what SquadRidge protects today, what operators can still access during
        normal operation, and which guarantees are not yet part of the current release. Trust comes
        from clarity here, not from claims.
      </p>
      <p className="mt-3 max-w-[40rem] font-sans text-[0.85rem] leading-[1.6] text-ink-faint">
        Written for facilitators preparing pilots, security reviewers running diligence, and counsel
        evaluating data exposure. Engineers can cross-reference{' '}
        <code className="font-mono text-[0.8rem] text-ink-secondary">
          docs/security/threat-model.md
        </code>{' '}
        as the primary source.
      </p>
    </header>
  );
}

const SECTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'security-privacy-model', label: 'Privacy model' },
  { id: 'security-operator', label: 'Operator visibility' },
  { id: 'security-verification', label: 'Verification' },
  { id: 'security-permissions', label: 'Permissions and retention' },
  { id: 'security-deployment', label: 'Deployment and operations' },
  { id: 'security-not-yet', label: 'Not yet implemented' },
  { id: 'security-faq', label: 'FAQ' },
  { id: 'security-refs', label: 'Technical references' },
];

function SecurityTableOfContents({
  variant = 'inline',
  className = '',
}: {
  variant?: 'inline' | 'sidebar';
  className?: string;
}) {
  const isSidebar = variant === 'sidebar';
  return (
    <nav
      aria-label="Security disclosure sections"
      className={`${
        isSidebar
          ? 'border-l border-line pl-4'
          : 'rounded-md border border-line bg-surface-elevated px-4 py-4'
      } ${className}`.trim()}
    >
      <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        On this page
      </p>
      <ol
        className={`mt-3 m-0 list-none p-0 ${
          isSidebar ? 'space-y-2' : 'grid gap-x-6 gap-y-2 sm:grid-cols-2'
        }`}
      >
        {SECTIONS.map((s, i) => (
          <li key={s.id} className="m-0 flex items-baseline gap-2 p-0">
            <span className="font-mono text-[0.7rem] tabular-nums text-ink-faint">
              {String(i + 1).padStart(2, '0')}
            </span>
            <a
              href={`#${s.id}`}
              className="font-sans text-[0.85rem] font-medium text-ink-secondary underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

const AT_A_GLANCE: ReadonlyArray<{
  tone: 'success' | 'danger' | 'warning';
  label: 'We do' | 'We do not' | 'Not yet';
  body: string;
}> = [
  {
    tone: 'success',
    label: 'We do',
    body: 'Encrypt every message payload at rest with AES-256-GCM before it is written to storage.',
  },
  {
    tone: 'success',
    label: 'We do',
    body: 'Log every operator decrypt action — with a written justification — before plaintext is returned.',
  },
  {
    tone: 'danger',
    label: 'We do not',
    body: 'Publish anything outside the room without an explicit in-room approval vote.',
  },
  {
    tone: 'danger',
    label: 'We do not',
    body: 'Stand up real-name profiles, cross-pilot identity reuse, or raw transcript exports.',
  },
  {
    tone: 'warning',
    label: 'Not yet',
    body: 'Operator-blind end-to-end encryption — the platform can still decrypt content for moderation today.',
  },
];

function SecurityAtAGlanceSection({ className = '' }: { className?: string }) {
  return (
    <section
      aria-label="Key guarantees and non-guarantees at a glance"
      className={`rounded-md border border-line bg-surface-elevated px-5 py-5 ${className}`.trim()}
    >
      <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        At a glance
      </p>
      <ul className="m-0 mt-3 grid list-none gap-2.5 p-0 sm:grid-cols-2">
        {AT_A_GLANCE.map((item, i) => (
          <li key={i} className="m-0 flex items-start gap-2.5 p-0">
            <StatusBadge tone={item.tone} className="mt-0.5 shrink-0">
              {item.label}
            </StatusBadge>
            <p className="m-0 font-sans text-[0.85rem] leading-[1.55] text-ink-secondary">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Documentation-style section block: subtle border, restrained radius. */
function DocSection({
  id,
  labelledBy,
  children,
  className = '',
}: {
  id?: string;
  labelledBy?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`scroll-mt-24 rounded-md border border-line bg-surface-elevated px-5 py-5 md:px-6 md:py-6 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-3 font-sans text-[1.0625rem] font-semibold leading-snug text-[#e2e8f0]"
    >
      {children}
    </h2>
  );
}

function SecurityPrivacyModelSection() {
  const ROWS: ReadonlyArray<{ label: string; body: string; risk: string }> = [
    {
      label: 'In-room',
      body: 'Participation is pseudonymous; real-name identity is never the product surface inside a session.',
      risk: 'Mitigates social and reputational risk among participants and observers in the same room.',
    },
    {
      label: 'At rest',
      body: 'Message payloads are encrypted with AES-256-GCM and a 12-byte random IV before the row is written. Each squad uses a shared symmetric key currently stored in Postgres alongside the ciphertext column. Key rotation between sessions is not yet automated, and squad keys are not yet held in a managed KMS.',
      risk: 'Mitigates casual database read by collapsing the attack surface to “key + ciphertext together”; does not defeat a privileged operator — see Operator visibility below.',
    },
    {
      label: 'On release',
      body: 'A public outcome record is published only when explicitly approved for release. The discussion stays private even after release; the record carries the outcome, not the transcript.',
      risk: 'Mitigates participants being attached to public artifacts they did not consent to.',
    },
  ];
  return (
    <DocSection id="security-privacy-model" labelledBy="security-privacy-model-heading">
      <SectionHeading id="security-privacy-model-heading">Privacy model</SectionHeading>
      <p className="mb-4 font-sans text-[0.95rem] leading-[1.65] text-ink-secondary">
        Three boundaries define how information moves between a session, the platform, and any
        downstream record. Each boundary names the risk it is intended to reduce.
      </p>
      <ul className="m-0 list-none space-y-3 p-0">
        {ROWS.map((row) => (
          <li key={row.label} className="m-0 flex flex-col gap-1.5 p-0 sm:flex-row sm:gap-4">
            <StatusBadge
              tone="default"
              className="self-start sm:w-28 sm:flex-shrink-0 sm:justify-center"
            >
              {row.label}
            </StatusBadge>
            <div className="flex-1 space-y-1.5">
              <p className="m-0 font-sans text-[0.9rem] leading-[1.6] text-ink-secondary">
                {row.body}
              </p>
              <p className="m-0 font-sans text-[0.8125rem] leading-[1.55] text-ink-faint">
                <span className="font-semibold uppercase tracking-[0.08em] text-ink-faint">
                  Mitigates&nbsp;·{' '}
                </span>
                {row.risk}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </DocSection>
  );
}

function SecurityOperatorVisibilitySection() {
  return (
    <section
      id="security-operator"
      aria-labelledby="security-operator-heading"
      className="scroll-mt-24 rounded-md border border-line-strong bg-surface-elevated px-5 py-5 md:px-6 md:py-6"
    >
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <SectionHeading id="security-operator-heading">Operator visibility</SectionHeading>
        <StatusBadge tone="warning">Active disclosure</StatusBadge>
      </div>
      <p className="mb-3 font-sans text-[0.8125rem] leading-[1.55] text-ink-faint">
        What SquadRidge staff can see during normal operation.
      </p>
      <div className="space-y-3 font-sans text-[0.95rem] leading-[1.65] text-[#b8c2cf]">
        <p className="mb-0">
          The hosting environment, including the database and logs, can access ciphertext and squad
          keys during normal operation. SquadRidge does not currently claim that operators are
          technically unable to read stored messages when moderation, legal process, or incident
          response requires access.
        </p>
        <p className="mb-0">
          Decrypt actions are gated by an audited RPC. Every plaintext fetch writes a{' '}
          <code className="font-mono text-[0.85rem] text-ink-secondary">
            message_plaintext_decrypt_review
          </code>{' '}
          row to the moderation audit log, with a required justification of at least eight
          characters, <em className="not-italic font-semibold text-ink">before</em> plaintext is
          returned to the moderator. The audit log is reviewable by named pilot operators and is
          retained for the life of the pilot for incident debriefs.
        </p>
      </div>
    </section>
  );
}

function SecurityVerificationSection() {
  return (
    <DocSection id="security-verification" labelledBy="security-verification-heading">
      <SectionHeading id="security-verification-heading">Verification</SectionHeading>
      <p className="mb-3 font-sans text-[0.95rem] leading-[1.65] text-ink-secondary">
        Eligibility checks rely on Semaphore-style proofs where the stack is live. The property we
        verify is{' '}
        <strong className="font-semibold text-ink">
          group membership without revealing identity
        </strong>
        : a participant proves they belong to an issuer-managed anonymity group; the room learns the
        eligibility scope, not the underlying identifier.
      </p>
      <p className="mb-3 font-sans text-[0.9rem] leading-[1.6] text-ink-faint">
        An eligibility scope looks like:{' '}
        <em className="not-italic text-ink-secondary">
          “current members of an accredited pilot organisation, in good standing as of issuance,
          verified by the named issuing authority.”
        </em>{' '}
        Each pilot agreement names the issuer and the attribute being attested.
      </p>
      <ul className="m-0 list-disc space-y-2 pl-5 font-sans text-[0.9rem] leading-[1.6] text-ink-secondary marker:text-slate-600">
        <li className="pl-1">Facilitators are accredited and named in pilot agreements.</li>
        <li className="pl-1">
          Participants are pseudonymous in-room; verification scope is documented per pilot.
        </li>
        <li className="pl-1">
          Cross-pilot identity reuse is bounded by the pilot’s anonymity group.
        </li>
      </ul>
    </DocSection>
  );
}

function SecurityPermissionsSection() {
  const ROWS: ReadonlyArray<{
    scope: string;
    participant: string;
    facilitator: string;
    operator: string;
  }> = [
    {
      scope: 'Read room messages',
      participant: 'In active session',
      facilitator: 'During and after, with audit',
      operator: 'On justified review',
    },
    {
      scope: 'Decrypt with justification',
      participant: 'No',
      facilitator: 'No',
      operator: 'Yes — logged',
    },
    {
      scope: 'Publish public record',
      participant: 'Vote in-room',
      facilitator: 'Initiate release',
      operator: 'No unilateral publish',
    },
    {
      scope: 'Export raw transcript',
      participant: 'No',
      facilitator: 'No',
      operator: 'No (out of scope today)',
    },
  ];
  return (
    <DocSection id="security-permissions" labelledBy="security-permissions-heading">
      <SectionHeading id="security-permissions-heading">Permissions and retention</SectionHeading>
      <p className="mb-4 font-sans text-[0.95rem] leading-[1.65] text-ink-secondary">
        A snapshot of who can do what during normal operation.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line">
              {['Action', 'Participant', 'Facilitator', 'Operator'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="py-2 pr-3 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-faint"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.scope} className="border-b border-line-divider last:border-b-0">
                <th scope="row" className="py-3 pr-3 font-sans text-[0.85rem] font-medium text-ink">
                  {r.scope}
                </th>
                <td className="py-3 pr-3 font-sans text-[0.85rem] text-ink-secondary">
                  {r.participant}
                </td>
                <td className="py-3 pr-3 font-sans text-[0.85rem] text-ink-secondary">
                  {r.facilitator}
                </td>
                <td className="py-3 font-sans text-[0.85rem] text-ink-secondary">{r.operator}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-3 border-t border-line-divider pt-4 font-sans text-[0.9rem] leading-[1.6] text-ink-secondary">
        <p className="m-0">
          <span className="font-semibold text-ink">Retention.</span> Encrypted message rows are
          retained for the life of the pilot by default; concrete windows (for example, 30 or 90
          days post-archival) are set in each pilot agreement. Audit-log rows for moderator decrypts
          are retained at least as long as their underlying messages, so legitimate review can
          always be reconstructed.
        </p>
        <p className="m-0">
          <span className="font-semibold text-ink">Why no raw transcript export.</span> Exporting
          full transcripts — even to facilitators — is intentionally out of scope so the platform
          does not become a long-term collection point that outlives the room. The aim is to reduce
          the value of any later compromise, subpoena, or insider misuse: the most attractive
          artifact does not exist.
        </p>
      </div>
    </DocSection>
  );
}

function SecurityDeploymentSection() {
  return (
    <DocSection id="security-deployment" labelledBy="security-deployment-heading">
      <SectionHeading id="security-deployment-heading">Deployment and operations</SectionHeading>
      <p className="mb-4 font-sans text-[0.95rem] leading-[1.65] text-ink-secondary">
        Concrete environment details for security reviewers and counsel. Pilot-specific parameters
        (region, named subprocessors, retention windows) are documented in each pilot agreement.
      </p>
      <dl className="m-0 grid gap-x-6 gap-y-3 p-0 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <SecurityKv term="Hosting">
          Supabase managed Postgres and Edge Functions, fronted by HTTPS. The platform vendor and
          its subprocessors are part of the trust boundary; their access posture is described in §3
          of the threat model.
        </SecurityKv>
        <SecurityKv term="Privileged access">
          Service-role and dashboard access require multi-factor authentication, are limited to a
          minimal headcount, and follow a documented break-glass procedure. Authorization decisions
          are not based on user-editable JWT metadata.
        </SecurityKv>
        <SecurityKv term="Logging">
          Edge Functions emit structured outcome-only logs in production. Full proof bodies, raw
          payloads, and PII are not logged. Auth-event metadata captured by the platform vendor at
          the edge is disclosed in the pilot agreement.
        </SecurityKv>
        <SecurityKv term="Incident response">
          Suspected mass correlation, export, or key compromise is treated as Severity-0 with a
          runbook that includes key rotation and pilot-partner notification. Report concerns to the
          contact in your pilot agreement, or to the security email referenced in{' '}
          <code className="font-mono text-[0.85rem] text-ink-secondary">
            docs/security/threat-model.md
          </code>
          .
        </SecurityKv>
      </dl>
    </DocSection>
  );
}

function SecurityKv({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="m-0 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-ink-faint">
        {term}
      </dt>
      <dd className="m-0 font-sans text-[0.9rem] leading-[1.6] text-ink-secondary">{children}</dd>
    </>
  );
}

function SecurityNotImplementedSection() {
  return (
    <DocSection id="security-not-yet" labelledBy="security-not-yet-heading">
      <SectionHeading id="security-not-yet-heading">Not yet implemented</SectionHeading>
      <ul className="m-0 list-disc space-y-2 pl-5 font-sans text-[0.95rem] leading-[1.65] text-ink-secondary marker:text-slate-600">
        <li className="pl-1">
          Per-user end-to-end encryption, where the server never holds decryptable content. Today
          the squad symmetric key sits on the platform; true E2E remains a future architecture
          direction rather than a current guarantee.
        </li>
        <li className="pl-1">
          Automated key rotation between sessions and managed-KMS storage of squad keys.
        </li>
        <li className="pl-1">
          Operator-blind moderation tooling. Moderation today is audited rather than blinded.
        </li>
      </ul>
      <p className="mt-4 mb-0 font-sans text-[0.85rem] leading-[1.6] text-ink-faint">
        This list is expected to shrink over time. Material changes are dated below so operators and
        counsel can track improvements between releases.
      </p>
      <p className="mt-3 mb-0 font-mono text-[0.78rem] text-ink-faint">
        Last reviewed against code:{' '}
        <span className="text-ink-secondary">{LAST_REVIEWED_AGAINST_CODE}</span>
      </p>
    </DocSection>
  );
}

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Can the SquadRidge team read my room?',
    a: 'During normal operation operators can access ciphertext and the squad key. Reading message content requires a moderator action with logged justification, which becomes part of the audit log before plaintext is returned.',
  },
  {
    q: 'Is anything published without my consent?',
    a: 'No. A public outcome record is only created from an outcome explicitly approved for release. The room itself stays private.',
  },
  {
    q: 'Is my identity in the public record?',
    a: 'No. Public records are intentionally anonymous and timestamped — designed to be cited without exposing participants.',
  },
  {
    q: 'How long are messages retained?',
    a: 'Retention is pilot-scoped and documented in the pilot agreement. The default direction is the minimum retention consistent with safety review.',
  },
  {
    q: 'Where can I report a security concern?',
    a: 'Use the contact in the pilot agreement, or the security email referenced in docs/security/threat-model.md. Suspected mass correlation, export, or key compromise is treated as Severity-0.',
  },
];

function SecurityFaqSection() {
  return (
    <DocSection id="security-faq" labelledBy="security-faq-heading">
      <SectionHeading id="security-faq-heading">FAQ</SectionHeading>
      <dl className="m-0 divide-y divide-line-divider p-0">
        {FAQS.map((item, i) => (
          <div
            key={item.q}
            className={`${i === 0 ? 'pt-0' : 'pt-4'} ${i === FAQS.length - 1 ? 'pb-0' : 'pb-4'}`}
          >
            <dt className="m-0 font-sans text-[0.92rem] font-semibold leading-snug text-ink">
              {item.q}
            </dt>
            <dd className="m-0 mt-1.5 font-sans text-[0.9rem] leading-[1.6] text-ink-secondary">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
    </DocSection>
  );
}

function SecurityReferencesSection() {
  return (
    <DocSection id="security-refs" labelledBy="security-refs-heading">
      <SectionHeading id="security-refs-heading">Technical references</SectionHeading>
      <p className="mb-3 font-sans text-[0.95rem] leading-[1.65] text-ink-secondary">
        Further technical detail is documented in the repository:
      </p>
      <div className="rounded border border-line bg-surface-sunken px-3 py-3 font-mono text-[0.8125rem] leading-relaxed text-ink-secondary">
        <ul className="m-0 list-none space-y-1.5 p-0">
          <li className="break-all pl-0">
            <code className="text-[0.8125rem] text-ink">docs/security/encryption-scope.md</code>
          </li>
          <li className="break-all pl-0">
            <code className="text-[0.8125rem] text-ink">docs/security/threat-model.md</code>
          </li>
        </ul>
      </div>
    </DocSection>
  );
}
