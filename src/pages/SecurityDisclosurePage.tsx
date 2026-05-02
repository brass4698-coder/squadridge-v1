import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  FileLock2,
  FileText,
  Hourglass,
  KeyRound,
  ScrollText,
  ShieldCheck,
  Stamp,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { StatusBadge, type StatusTone } from '../components/ui/StatusBadge';
import { BoundaryCard, SectionKicker } from '../components';

/**
 * Plain-language security posture for participants, facilitators, and security
 * reviewers (mirrors `docs/security/encryption-scope.md` and
 * `docs/security/threat-model.md`).
 *
 * Layout: sticky TOC sidebar on `lg+`; horizontal nav chips on smaller
 * viewports. Content is honest about scope (no marketing E2E claims) and ties
 * each boundary to the risk it actually mitigates so a security reviewer can
 * follow the threat model in one read.
 *
 * IMPORTANT: Any change here that strengthens a claim must land in lockstep
 * with the threat model and encryption-scope docs. Update
 * `LAST_REVIEWED_AGAINST_CODE` whenever the claim set changes.
 */

const LAST_REVIEWED_AGAINST_CODE = '2026-04-30';

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

const SECTION_IDS: ReadonlyArray<string> = SECTIONS.map((s) => s.id);

export function SecurityDisclosurePage() {
  const activeId = useActiveSection(SECTION_IDS);

  return (
    <div className="relative mx-auto w-full max-w-[68rem] pb-20 pt-6 md:pt-10">
      <HeroBackdrop />

      <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-x-12">
        <aside className="hidden lg:block">
          <div className="sticky top-24 pt-1">
            <SecurityTableOfContents variant="sidebar" activeId={activeId} />
          </div>
        </aside>

        <article className="mx-auto w-full">
          <SecurityHeader />

          <SecurityTableOfContents variant="chips" activeId={activeId} className="mt-8 lg:hidden" />

          <RevealSection className="mt-10 md:mt-12">
            <SecurityBoundaryModelSection />
          </RevealSection>

          <RevealSection className="mt-6 md:mt-8">
            <SecurityKeyCaveatsSection />
          </RevealSection>

          <RevealSection className="mt-6 md:mt-8">
            <SecurityAtAGlanceSection />
          </RevealSection>

          <div className="mt-12 flex flex-col gap-10 md:mt-16 md:gap-14">
            <RevealSection>
              <SecurityPrivacyModelSection />
            </RevealSection>
            <RevealSection>
              <SecurityOperatorVisibilitySection />
            </RevealSection>
            <RevealSection>
              <SecurityVerificationSection />
            </RevealSection>
            <RevealSection>
              <SecurityPermissionsSection />
            </RevealSection>
            <RevealSection>
              <SecurityDeploymentSection />
            </RevealSection>
            <RevealSection>
              <SecurityNotImplementedSection />
            </RevealSection>
            <RevealSection>
              <SecurityFaqSection />
            </RevealSection>
            <RevealSection>
              <SecurityReferencesSection />
            </RevealSection>
          </div>

          <RevealSection className="mt-14 md:mt-20">
            <SecurityClosingCta />
          </RevealSection>
        </article>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Hero
 * ----------------------------------------------------------------------- */

function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden"
    >
      <div className="absolute -top-32 left-1/2 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(47,143,134,0.10),_transparent_60%)] blur-2xl" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.65),transparent_72%)]" />
    </div>
  );
}

const TRUST_PRINCIPLES: ReadonlyArray<{ icon: ReactNode; text: string }> = [
  {
    icon: <ScrollText className="size-3.5" aria-hidden />,
    text: 'Operators are audited, not blinded.',
  },
  {
    icon: <FileLock2 className="size-3.5" aria-hidden />,
    text: 'Raw transcripts cannot be exported.',
  },
  {
    icon: <ShieldCheck className="size-3.5" aria-hidden />,
    text: 'Public records require explicit in-room approval.',
  },
];

function SecurityHeader() {
  return (
    <header className="relative">
      <div className="flex items-center gap-3">
        <SectionKicker className="mb-0">Security disclosure</SectionKicker>
        <span aria-hidden className="h-px w-10 bg-line-divider" />
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
          v.{LAST_REVIEWED_AGAINST_CODE}
        </span>
      </div>

      <h1 className="mt-4 font-display text-[clamp(2.15rem,4.2vw,3.5rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-ink">
        Trust boundaries for sealed rooms and public records.
      </h1>

      <p className="mt-6 max-w-[44rem] border-l-2 border-brand bg-brand-soft/60 py-3 pl-4 pr-3 font-sans text-[1.02rem] font-medium leading-[1.6] text-ink md:text-[1.08rem]">
        Security here is structural: verification before access, bounded confidentiality inside the
        room, release controls before publication, and honest disclosure of operator visibility.
      </p>

      <ul className="mt-7 grid list-none gap-3 p-0 sm:grid-cols-3">
        {TRUST_PRINCIPLES.map((p) => (
          <li
            key={p.text}
            className="m-0 flex items-start gap-3 rounded-md border border-line bg-surface-elevated px-4 py-3.5 transition-colors duration-200 hover:border-line-strong"
          >
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface-sunken text-brand">
              {p.icon}
            </span>
            <span className="font-sans text-[0.85rem] font-semibold leading-snug text-ink">
              {p.text}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-7 max-w-[42rem] font-sans text-[0.95rem] leading-[1.7] text-ink-secondary">
        This page describes what SquadRidge protects today, what operators can still access during
        normal operation, and which guarantees are not yet part of the current release. Trust comes
        from clarity here, not from claims.
      </p>
      <p className="mt-3 max-w-[42rem] font-sans text-[0.85rem] leading-[1.65] text-ink-faint">
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

/* -------------------------------------------------------------------------
 * Table of contents
 * ----------------------------------------------------------------------- */

function SecurityTableOfContents({
  variant = 'sidebar',
  activeId,
  className = '',
}: {
  variant?: 'sidebar' | 'chips';
  activeId?: string | null;
  className?: string;
}) {
  if (variant === 'chips') {
    return (
      <nav
        aria-label="Security disclosure sections"
        className={twMerge(
          'rounded-md border border-line bg-surface-elevated px-3 py-3',
          className,
        )}
      >
        <p className="px-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
          On this page
        </p>
        <ol className="mt-2 -mx-1 flex list-none gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:thin]">
          {SECTIONS.map((s, i) => {
            const isActive = activeId === s.id;
            return (
              <li key={s.id} className="m-0 list-none p-0">
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={twMerge(
                    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 font-sans text-[0.78rem] font-medium transition-colors',
                    isActive
                      ? 'border-brand bg-brand-soft text-ink'
                      : 'border-line bg-surface-sunken text-ink-secondary hover:border-line-strong hover:text-ink',
                  )}
                >
                  <span
                    className={twMerge(
                      'font-mono text-[0.66rem] tabular-nums',
                      isActive ? 'text-brand' : 'text-ink-faint',
                    )}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.label}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Security disclosure sections" className={className}>
      <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        On this page
      </p>
      <ol className="mt-4 m-0 list-none space-y-1 p-0">
        {SECTIONS.map((s, i) => {
          const isActive = activeId === s.id;
          return (
            <li key={s.id} className="m-0 p-0">
              <a
                href={`#${s.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={twMerge(
                  'group relative flex items-baseline gap-3 rounded-sm py-1.5 pl-3 pr-2 transition-colors',
                  isActive ? 'text-ink' : 'text-ink-secondary hover:text-ink',
                )}
              >
                <span
                  aria-hidden
                  className={twMerge(
                    'absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full transition-all duration-200',
                    isActive ? 'bg-brand opacity-100' : 'bg-line opacity-0 group-hover:opacity-60',
                  )}
                />
                <span
                  className={twMerge(
                    'font-mono text-[0.7rem] tabular-nums tracking-tight transition-colors',
                    isActive ? 'text-brand' : 'text-ink-faint',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className={twMerge(
                    'font-sans text-[0.84rem] font-medium leading-snug',
                    isActive ? 'text-ink' : 'text-ink-secondary',
                  )}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------
 * Boundary model + structural principles
 * ----------------------------------------------------------------------- */

const STRUCTURE_PRINCIPLES: ReadonlyArray<{
  label: string;
  detail: string;
  icon: ReactNode;
}> = [
  {
    label: 'Access',
    detail: 'Verification and invite state are checked before live matching or room entry.',
    icon: <KeyRound className="size-4" aria-hidden />,
  },
  {
    label: 'Exposure',
    detail: 'In-room identity and public attribution are separated by design.',
    icon: <EyeOff className="size-4" aria-hidden />,
  },
  {
    label: 'Release',
    detail:
      'A leaked snippet is not a citable outcome. Only approved release produces a public record.',
    icon: <Stamp className="size-4" aria-hidden />,
  },
];

function SecurityBoundaryModelSection() {
  return (
    <section aria-labelledby="security-boundary-model">
      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <BoundaryCard label="Private surface" title="The room is not the artifact" tone="sealed">
          <p className="mb-0">
            Participants enter after eligibility checks. The session is facilitated, time-bounded,
            and not exported as a raw transcript.
          </p>
        </BoundaryCard>
        <BoundaryCard label="Public surface" title="The record is approved release" tone="record">
          <p className="mb-0">
            Publication is a separate act. Approved outcomes can be cited without exposing
            participant identity, raw statements, or deliberation paths.
          </p>
        </BoundaryCard>
      </div>

      <div className="mt-5 rounded-md border border-line bg-surface-elevated px-5 py-5 md:px-6 md:py-6">
        <div className="flex items-baseline gap-3">
          <h2
            id="security-boundary-model"
            className="m-0 font-sans text-[0.95rem] font-semibold leading-snug text-ink"
          >
            What structure enforces
          </h2>
          <span aria-hidden className="h-px flex-1 bg-line-divider" />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
            Three controls
          </span>
        </div>
        <ul className="m-0 mt-5 grid list-none gap-3 p-0 md:grid-cols-3 md:gap-4">
          {STRUCTURE_PRINCIPLES.map((p) => (
            <li
              key={p.label}
              className="m-0 flex flex-col gap-2.5 rounded-md border border-line bg-surface-sunken p-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-7 items-center justify-center rounded-md border border-line bg-surface-elevated text-brand">
                  {p.icon}
                </span>
                <p className="m-0 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-ink">
                  {p.label}
                </p>
              </div>
              <p className="m-0 font-sans text-[0.86rem] leading-[1.6] text-ink-secondary">
                {p.detail}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
 * Read this first — three caveats
 * ----------------------------------------------------------------------- */

const KEY_CAVEATS: ReadonlyArray<{
  label: string;
  detail: string;
  status: string;
  statusTone: StatusTone;
}> = [
  {
    label: 'Operators can still decrypt — with audited justification',
    detail:
      'Plaintext access is not technically prevented today. Every decrypt action requires a written justification and is logged before plaintext is returned. Moderation is audited, not blinded.',
    status: 'Honest disclosure',
    statusTone: 'info',
  },
  {
    label: 'No raw transcript export',
    detail:
      'By design — even facilitators cannot pull a full transcript out of the platform. The most attractive artifact in a future compromise does not exist.',
    status: 'Structural limit',
    statusTone: 'success',
  },
  {
    label: 'End-to-end encryption is not yet live',
    detail:
      'Per-user E2E is on the roadmap. Today the squad’s symmetric key sits on the platform alongside ciphertext. This is documented honestly rather than implied away.',
    status: 'Roadmap status',
    statusTone: 'warning',
  },
];

function SecurityKeyCaveatsSection() {
  return (
    <section
      aria-label="Read this first: three caveats"
      className="relative overflow-hidden rounded-lg border border-sem-warning/45 bg-gradient-to-br from-sem-warning-soft via-surface-elevated to-surface-elevated px-5 py-6 shadow-[0_0_0_1px_rgba(245,166,35,0.04),0_24px_48px_-32px_rgba(0,0,0,0.55)] md:px-7 md:py-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sem-warning/[0.06] blur-3xl"
      />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-sem-warning">
            <span aria-hidden className="size-1.5 rounded-full bg-sem-warning" />
            Read this first
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.25rem,1.6vw,1.5rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink">
            Three caveats reviewers should not miss
          </h2>
        </div>
        <StatusBadge tone="warning" className="self-start sm:self-end">
          Scope disclosure
        </StatusBadge>
      </div>

      <ol className="relative m-0 mt-6 grid list-none gap-3 p-0 md:grid-cols-3 md:gap-4">
        {KEY_CAVEATS.map((c, i) => (
          <li
            key={c.label}
            className="group m-0 flex flex-col gap-3 rounded-md border border-sem-warning/25 bg-surface-sunken/95 p-4 transition-colors duration-200 hover:border-sem-warning/45 md:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span
                aria-hidden
                className="font-mono text-[0.72rem] font-semibold tabular-nums text-sem-warning/80"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <StatusBadge tone={c.statusTone} className="text-[0.66rem]">
                {c.status}
              </StatusBadge>
            </div>
            <p className="m-0 font-sans text-[0.94rem] font-semibold leading-snug text-ink">
              {c.label}
            </p>
            <p className="m-0 font-sans text-[0.86rem] leading-[1.65] text-ink-secondary">
              {c.detail}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* -------------------------------------------------------------------------
 * At a glance — 4 summary cards
 * ----------------------------------------------------------------------- */

const SCAN_CARDS: ReadonlyArray<{
  label: string;
  status: string;
  tone: StatusTone;
  icon: ReactNode;
  items: ReadonlyArray<string>;
}> = [
  {
    label: 'What we protect',
    status: 'Active',
    tone: 'success',
    icon: <ShieldCheck className="size-4" aria-hidden />,
    items: [
      'Message payloads encrypted at rest with AES-256-GCM.',
      'Identity stays inside the room — public records are anonymous and timestamped.',
      'No publishing without an explicit in-room approval vote.',
    ],
  },
  {
    label: 'What staff can access',
    status: 'Honest',
    tone: 'info',
    icon: <Eye className="size-4" aria-hidden />,
    items: [
      'Ciphertext and squad keys during normal operation.',
      'Plaintext only via an audited RPC requiring a written justification.',
      'Every decrypt action is logged before plaintext is returned.',
    ],
  },
  {
    label: 'What gets published',
    status: 'Explicit',
    tone: 'default',
    icon: <FileText className="size-4" aria-hidden />,
    items: [
      'A public outcome record only when in-room approval is granted.',
      'The outcome — not the transcript, not participant identifiers.',
      'Citable, anonymous, timestamped. Cannot be retracted in place once published.',
    ],
  },
  {
    label: 'What is not yet true',
    status: 'Not yet',
    tone: 'warning',
    icon: <Hourglass className="size-4" aria-hidden />,
    items: [
      'Operator-blind end-to-end encryption.',
      'Automated key rotation between sessions / managed-KMS storage of squad keys.',
      'Operator-blind moderation tooling — current model is audited, not blinded.',
    ],
  },
];

function SecurityAtAGlanceSection() {
  return (
    <section
      aria-label="At a glance: what we protect, who can access what, what gets published, and what is not yet true"
      className="rounded-lg border border-line bg-surface-elevated px-5 py-6 md:px-7 md:py-7"
    >
      <div className="flex items-baseline gap-3">
        <p className="m-0 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          At a glance
        </p>
        <span aria-hidden className="h-px flex-1 bg-line-divider" />
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-faint">
          Diligence panel
        </span>
      </div>

      <div className="m-0 mt-5 grid gap-3 p-0 sm:grid-cols-2 sm:gap-4">
        {SCAN_CARDS.map((card) => (
          <div
            key={card.label}
            className="flex h-full flex-col gap-3 rounded-md border border-line bg-surface-sunken p-4 transition-colors duration-200 hover:border-line-strong md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface-elevated text-brand">
                  {card.icon}
                </span>
                <h3 className="m-0 font-sans text-[0.95rem] font-semibold leading-snug text-ink">
                  {card.label}
                </h3>
              </div>
              <StatusBadge tone={card.tone} className="shrink-0 text-[0.66rem]">
                {card.status}
              </StatusBadge>
            </div>
            <ul className="m-0 list-none space-y-2 p-0 font-sans text-[0.86rem] leading-[1.6] text-ink-secondary">
              {card.items.map((item) => (
                <li key={item} className="m-0 flex items-start gap-2.5 p-0">
                  <span
                    aria-hidden
                    className="mt-[0.55rem] size-1 shrink-0 rounded-full bg-ink-subtle"
                  />
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
 * Section primitives (DocSection / heading)
 * ----------------------------------------------------------------------- */

function DocSection({
  id,
  labelledBy,
  children,
  className = '',
}: {
  id?: string;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={twMerge(
        'scroll-mt-24 rounded-lg border border-line bg-surface-elevated px-5 py-6 md:px-8 md:py-8',
        className,
      )}
    >
      {children}
    </section>
  );
}

function SectionHeader({
  id,
  index,
  title,
  intro,
  meta,
}: {
  id: string;
  index: number;
  title: string;
  intro?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-5 md:mb-6">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[0.66rem] font-semibold tabular-nums uppercase tracking-[0.18em] text-brand">
          {String(index).padStart(2, '0')}
        </span>
        <span aria-hidden className="h-px flex-1 bg-line-divider" />
        {meta}
      </div>
      <h2
        id={id}
        className="mt-3 font-display text-[clamp(1.35rem,1.9vw,1.65rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
      >
        {title}
      </h2>
      {intro ? (
        <p className="mt-3 max-w-[44rem] font-sans text-[0.95rem] leading-[1.7] text-ink-secondary">
          {intro}
        </p>
      ) : null}
    </header>
  );
}

const SECTION_INDEX: Record<string, number> = SECTIONS.reduce<Record<string, number>>(
  (acc, s, i) => {
    acc[s.id] = i + 1;
    return acc;
  },
  {},
);

/* -------------------------------------------------------------------------
 * Privacy model
 * ----------------------------------------------------------------------- */

function SecurityPrivacyModelSection() {
  const ROWS: ReadonlyArray<{ label: string; control: string; limitation?: string; risk: string }> =
    [
      {
        label: 'In-room',
        control:
          'Participation is pseudonymous; real-name identity is never the product surface inside a session.',
        risk: 'Mitigates social and reputational risk among participants and observers in the same room.',
      },
      {
        label: 'At rest',
        control:
          'Message payloads are encrypted with AES-256-GCM and a 12-byte random IV before the row is written.',
        limitation:
          'Today each squad key is also stored in Postgres. Key rotation between sessions and managed-KMS storage are not yet automated.',
        risk: 'Mitigates casual database read by collapsing the attack surface to “key + ciphertext together”; does not defeat a privileged operator — see Operator visibility below.',
      },
      {
        label: 'On release',
        control:
          'A public outcome record is published only when explicitly approved for release. The discussion stays private even after release; the record carries the outcome, not the transcript.',
        risk: 'Mitigates participants being attached to public artifacts they did not consent to.',
      },
    ];
  return (
    <DocSection id="security-privacy-model" labelledBy="security-privacy-model-heading">
      <SectionHeader
        id="security-privacy-model-heading"
        index={SECTION_INDEX['security-privacy-model']}
        title="Privacy model"
        intro="Three boundaries define how information moves between a session, the platform, and any downstream record. Each boundary names the risk it is intended to reduce."
      />
      <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-3 md:gap-4">
        {ROWS.map((row) => (
          <li
            key={row.label}
            className="m-0 flex flex-col gap-3 rounded-md border border-line bg-surface-sunken p-4 transition-colors duration-200 hover:border-line-strong md:p-5"
          >
            <StatusBadge tone="default" className="self-start text-[0.68rem]">
              {row.label}
            </StatusBadge>
            <div className="flex-1 space-y-2.5">
              <p className="m-0 font-sans text-[0.88rem] leading-[1.65] text-ink-secondary">
                {row.control}
              </p>
              {row.limitation ? (
                <p className="m-0 rounded border border-sem-warning/25 bg-sem-warning-soft px-3 py-2 font-sans text-[0.8rem] leading-[1.6] text-ink-secondary">
                  <span className="font-semibold text-ink">Not yet: </span>
                  {row.limitation}
                </p>
              ) : null}
              <p className="m-0 font-sans text-[0.81rem] leading-[1.6] text-ink-faint">
                <span className="font-semibold uppercase tracking-[0.1em] text-ink-faint">
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

/* -------------------------------------------------------------------------
 * Operator visibility
 * ----------------------------------------------------------------------- */

const OPERATOR_VISIBILITY_ROWS: ReadonlyArray<{
  surface: string;
  who: string;
  condition: string;
}> = [
  {
    surface: 'Ciphertext and squad keys',
    who: 'Platform operators',
    condition: 'Available during normal hosting and database operation.',
  },
  {
    surface: 'Plaintext room messages',
    who: 'Named moderators / operators',
    condition: 'Only through the audited decrypt RPC with written justification.',
  },
  {
    surface: 'Moderation audit log',
    who: 'Named pilot operators',
    condition: 'Reviewable for incident debriefs and retained for the life of the pilot.',
  },
];

function SecurityOperatorVisibilitySection() {
  return (
    <DocSection id="security-operator" labelledBy="security-operator-heading">
      <SectionHeader
        id="security-operator-heading"
        index={SECTION_INDEX['security-operator']}
        title="Operator visibility"
        intro="What SquadRidge staff can see during normal operation."
        meta={<StatusBadge tone="warning">Active disclosure</StatusBadge>}
      />

      <p className="mb-5 flex items-start gap-3 rounded-md border border-sem-warning/40 bg-sem-warning-soft px-4 py-3 font-sans text-[0.92rem] font-medium leading-[1.6] text-ink">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sem-warning" aria-hidden />
        <span>
          Operators can technically read stored messages, but only via an audited, justified decrypt
          flow.
        </span>
      </p>

      <div className="space-y-3.5 font-sans text-[0.95rem] leading-[1.7] text-ink-secondary">
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

      <StyledTable
        className="mt-6"
        ariaLabel="Operator visibility surfaces"
        columns={['Surface', 'Who can see', 'Under what conditions']}
        rows={OPERATOR_VISIBILITY_ROWS.map((r) => ({
          key: r.surface,
          primary: r.surface,
          cells: [r.who, r.condition],
        }))}
      />
    </DocSection>
  );
}

/* -------------------------------------------------------------------------
 * Verification
 * ----------------------------------------------------------------------- */

function SecurityVerificationSection() {
  return (
    <DocSection id="security-verification" labelledBy="security-verification-heading">
      <SectionHeader
        id="security-verification-heading"
        index={SECTION_INDEX['security-verification']}
        title="Verification"
        intro={
          <>
            Eligibility checks rely on Semaphore-style proofs where the stack is live. The property
            we verify is{' '}
            <strong className="font-semibold text-ink">
              group membership without revealing identity
            </strong>
            : a participant proves they belong to an issuer-managed anonymity group; the room learns
            the eligibility scope, not the underlying identifier.
          </>
        }
      />
      <p className="mb-4 max-w-[44rem] font-sans text-[0.9rem] leading-[1.7] text-ink-faint">
        An eligibility scope looks like:{' '}
        <em className="not-italic text-ink-secondary">
          “current members of an accredited pilot organisation, in good standing as of issuance,
          verified by the named issuing authority.”
        </em>{' '}
        Each pilot agreement names the issuer and the attribute being attested.
      </p>
      <ul className="m-0 list-none space-y-2.5 p-0 font-sans text-[0.92rem] leading-[1.7] text-ink-secondary">
        {[
          'Facilitators are accredited and named in pilot agreements.',
          'Participants are pseudonymous in-room; verification scope is documented per pilot.',
          'Cross-pilot identity reuse is bounded by the pilot’s anonymity group.',
        ].map((item) => (
          <li key={item} className="m-0 flex items-start gap-3 p-0">
            <span aria-hidden className="mt-[0.6rem] size-1 shrink-0 rounded-full bg-brand/70" />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </DocSection>
  );
}

/* -------------------------------------------------------------------------
 * Permissions and retention
 * ----------------------------------------------------------------------- */

const PERMISSION_ROWS: ReadonlyArray<{
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

function permissionTone(value: string): StatusTone {
  if (value.startsWith('No')) return 'danger';
  if (value.startsWith('Yes')) return 'warning';
  if (value.includes('audit') || value.includes('justified')) return 'info';
  return 'default';
}

function PermissionValue({ children }: { children: string }) {
  return (
    <StatusBadge tone={permissionTone(children)} className="whitespace-nowrap text-[0.68rem]">
      {children}
    </StatusBadge>
  );
}

function SecurityPermissionsSection() {
  return (
    <DocSection id="security-permissions" labelledBy="security-permissions-heading">
      <SectionHeader
        id="security-permissions-heading"
        index={SECTION_INDEX['security-permissions']}
        title="Permissions and retention"
        intro="A snapshot of who can do what during normal operation."
      />

      {/* Desktop / tablet table */}
      <div className="hidden overflow-hidden rounded-md border border-line bg-surface-sunken md:block">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-surface-elevated">
              {['Action', 'Participant', 'Facilitator', 'Operator'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-faint"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_ROWS.map((r, i) => (
              <tr
                key={r.scope}
                className={twMerge(
                  'border-b border-line-divider last:border-b-0 transition-colors',
                  i % 2 === 1 ? 'bg-white/[0.012]' : '',
                )}
              >
                <th scope="row" className="px-4 py-3 font-sans text-[0.86rem] font-medium text-ink">
                  {r.scope}
                </th>
                <td className="px-4 py-3 font-sans text-[0.85rem] text-ink-secondary">
                  <PermissionValue>{r.participant}</PermissionValue>
                </td>
                <td className="px-4 py-3 font-sans text-[0.85rem] text-ink-secondary">
                  <PermissionValue>{r.facilitator}</PermissionValue>
                </td>
                <td className="px-4 py-3 font-sans text-[0.85rem] text-ink-secondary">
                  <PermissionValue>{r.operator}</PermissionValue>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="m-0 flex list-none flex-col gap-3 p-0 md:hidden">
        {PERMISSION_ROWS.map((r) => (
          <li key={r.scope} className="m-0 rounded-md border border-line bg-surface-sunken p-4">
            <p className="m-0 mb-3 font-sans text-[0.88rem] font-semibold leading-snug text-ink">
              {r.scope}
            </p>
            <dl className="m-0 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-2 p-0">
              {[
                ['Participant', r.participant],
                ['Facilitator', r.facilitator],
                ['Operator', r.operator],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="m-0 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                    {k}
                  </dt>
                  <dd className="m-0 min-w-0">
                    <PermissionValue>{v}</PermissionValue>
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      <p className="mt-5 mb-0 flex items-start gap-3 rounded-md border border-line-strong bg-surface-sunken px-4 py-3 font-sans text-[0.92rem] font-semibold leading-[1.6] text-ink">
        <FileLock2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
        <span>
          Nobody can export raw transcripts — not participants, not facilitators, not operators.
        </span>
      </p>

      <div className="mt-6 grid gap-3 border-t border-line-divider pt-5 md:grid-cols-2 md:gap-4">
        <div className="rounded-md border border-line bg-surface-sunken p-4">
          <p className="m-0 mb-1.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Retention
          </p>
          <p className="m-0 font-sans text-[0.88rem] leading-[1.7] text-ink-secondary">
            Encrypted message rows are retained for the life of the pilot by default; concrete
            windows (for example, 30 or 90 days post-archival) are set in each pilot agreement.
            Audit-log rows for moderator decrypts are retained at least as long as their underlying
            messages, so legitimate review can always be reconstructed.
          </p>
        </div>
        <div className="rounded-md border border-line bg-surface-sunken p-4">
          <p className="m-0 mb-1.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Why no raw transcript export
          </p>
          <p className="m-0 font-sans text-[0.88rem] leading-[1.7] text-ink-secondary">
            Exporting full transcripts — even to facilitators — is intentionally out of scope so the
            platform does not become a long-term collection point that outlives the room. The aim is
            to reduce the value of any later compromise, subpoena, or insider misuse: the most
            attractive artifact does not exist.
          </p>
        </div>
      </div>
    </DocSection>
  );
}

/* -------------------------------------------------------------------------
 * Deployment and operations
 * ----------------------------------------------------------------------- */

const DEPLOYMENT_CARDS: ReadonlyArray<{
  term: string;
  body: ReactNode;
}> = [
  {
    term: 'Hosting',
    body: (
      <>
        Supabase managed Postgres and Edge Functions, fronted by HTTPS. The platform vendor and its
        subprocessors are part of the trust boundary; their access posture is described in §3 of the
        threat model.
      </>
    ),
  },
  {
    term: 'Privileged access',
    body: (
      <>
        Service-role and dashboard access require MFA, are limited to a minimal headcount, and
        follow a documented break-glass procedure. Authorization is not based on user-editable JWT
        metadata.
      </>
    ),
  },
  {
    term: 'Logging',
    body: (
      <>
        Edge Functions emit structured outcome-only logs in production. Full proof bodies, raw
        payloads, and PII are not logged. Vendor-edge auth-event metadata is disclosed in the pilot
        agreement.
      </>
    ),
  },
  {
    term: 'Incident response',
    body: (
      <>
        Suspected mass correlation, export, or key compromise is treated as Severity-0, with a
        runbook covering key rotation and pilot-partner notification. Report concerns to the contact
        in your pilot agreement, or the security email in{' '}
        <code className="font-mono text-[0.85rem] text-ink-secondary">
          docs/security/threat-model.md
        </code>
        .
      </>
    ),
  },
];

function SecurityDeploymentSection() {
  return (
    <DocSection id="security-deployment" labelledBy="security-deployment-heading">
      <SectionHeader
        id="security-deployment-heading"
        index={SECTION_INDEX['security-deployment']}
        title="Deployment and operations"
        intro="Concrete environment details for security reviewers and counsel. Pilot-specific parameters (region, named subprocessors, retention windows) are set per pilot agreement."
      />
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {DEPLOYMENT_CARDS.map((card) => (
          <div
            key={card.term}
            className="flex h-full flex-col gap-2 rounded-md border border-line bg-surface-sunken p-4 transition-colors duration-200 hover:border-line-strong md:p-5"
          >
            <p className="m-0 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand">
              {card.term}
            </p>
            <p className="m-0 font-sans text-[0.88rem] leading-[1.7] text-ink-secondary">
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </DocSection>
  );
}

/* -------------------------------------------------------------------------
 * Not yet implemented
 * ----------------------------------------------------------------------- */

const NOT_YET_ITEMS: ReadonlyArray<string> = [
  'Per-user end-to-end encryption, where the server never holds decryptable content. Today the squad symmetric key sits on the platform; true E2E remains a future architecture direction rather than a current guarantee.',
  'Automated key rotation between sessions and managed-KMS storage of squad keys.',
  'Operator-blind moderation tooling. Moderation today is audited rather than blinded.',
];

function SecurityNotImplementedSection() {
  return (
    <DocSection id="security-not-yet" labelledBy="security-not-yet-heading">
      <SectionHeader
        id="security-not-yet-heading"
        index={SECTION_INDEX['security-not-yet']}
        title="Not yet implemented"
        meta={<StatusBadge tone="warning">Roadmap</StatusBadge>}
      />
      <ul className="m-0 list-none space-y-3 p-0 font-sans text-[0.94rem] leading-[1.7] text-ink-secondary">
        {NOT_YET_ITEMS.map((item) => (
          <li
            key={item}
            className="m-0 flex items-start gap-3 rounded-md border border-line bg-surface-sunken p-4"
          >
            <Hourglass className="mt-1 size-4 shrink-0 text-sem-warning" aria-hidden />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-5 mb-0 max-w-[44rem] font-sans text-[0.86rem] leading-[1.65] text-ink-faint">
        This list is expected to shrink over time. Material changes are dated below so operators and
        counsel can track improvements between releases.
      </p>
      <p className="mt-3 mb-0 inline-flex items-center gap-2 font-mono text-[0.78rem] text-ink-faint">
        <span className="size-1.5 rounded-full bg-brand" />
        Last reviewed against code:{' '}
        <span className="text-ink-secondary">{LAST_REVIEWED_AGAINST_CODE}</span>
      </p>
    </DocSection>
  );
}

/* -------------------------------------------------------------------------
 * FAQ
 * ----------------------------------------------------------------------- */

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
      <SectionHeader id="security-faq-heading" index={SECTION_INDEX['security-faq']} title="FAQ" />
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {FAQS.map((item) => (
          <li key={item.q} className="m-0 list-none p-0">
            <details
              open
              className="group rounded-md border border-line bg-surface-sunken px-4 py-3.5 transition-colors duration-200 open:border-line-strong open:bg-surface-elevated md:px-5 md:py-4"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded border border-brand/40 bg-brand-soft font-mono text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-brand">
                    Q
                  </span>
                  <span className="min-w-0 font-sans text-[0.96rem] font-semibold leading-snug text-ink">
                    {item.q}
                  </span>
                </div>
                <ChevronDown
                  className="mt-0.5 size-4 shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="mt-3 flex items-start gap-2.5 border-t border-line-divider pt-3">
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded border border-line bg-surface-elevated font-mono text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-faint"
                >
                  A
                </span>
                <p className="m-0 font-sans text-[0.9rem] leading-[1.75] text-ink-secondary">
                  {item.a}
                </p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </DocSection>
  );
}

/* -------------------------------------------------------------------------
 * Technical references
 * ----------------------------------------------------------------------- */

function SecurityReferencesSection() {
  return (
    <DocSection id="security-refs" labelledBy="security-refs-heading">
      <SectionHeader
        id="security-refs-heading"
        index={SECTION_INDEX['security-refs']}
        title="Technical references"
        intro="Further technical detail is documented in the repository:"
      />
      <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 sm:gap-3">
        {['docs/security/encryption-scope.md', 'docs/security/threat-model.md'].map((ref) => (
          <li
            key={ref}
            className="m-0 flex items-center gap-2.5 rounded-md border border-line bg-surface-sunken px-4 py-3"
          >
            <FileText className="size-4 shrink-0 text-ink-faint" aria-hidden />
            <code className="min-w-0 break-all font-mono text-[0.82rem] text-ink-secondary">
              {ref}
            </code>
          </li>
        ))}
      </ul>
    </DocSection>
  );
}

/* -------------------------------------------------------------------------
 * Closing CTA
 * ----------------------------------------------------------------------- */

function SecurityClosingCta() {
  return (
    <section
      aria-label="Pilot access and closing thesis"
      className="relative overflow-hidden rounded-lg border border-line-strong bg-gradient-to-br from-surface-elevated via-surface-elevated to-surface-sunken px-6 py-7 md:px-9 md:py-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand/[0.06] blur-3xl"
      />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
        <div className="max-w-[40rem]">
          <p className="m-0 flex items-center gap-2 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-brand">
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            Closing thesis
          </p>
          <p className="mt-3 font-display text-[clamp(1.15rem,1.7vw,1.4rem)] font-semibold leading-[1.35] tracking-[-0.015em] text-ink">
            The room is private. The record is deliberate. The two are never the same artifact.
          </p>
        </div>
        <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-4 md:flex-col md:items-end md:gap-2.5">
          <Link
            to="/#waitlist"
            className="group inline-flex items-center gap-2 rounded-md border border-brand/50 bg-brand-soft px-4 py-2.5 font-sans text-[0.88rem] font-semibold text-ink transition-all duration-200 hover:border-brand hover:bg-brand/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Apply for a pilot
            <ArrowRight
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <Link
            to="/"
            className="font-sans text-[0.82rem] font-medium text-ink-faint underline-offset-4 transition-colors hover:text-ink-secondary hover:underline"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
 * Reusable: styled responsive table (used by Operator visibility)
 * ----------------------------------------------------------------------- */

function StyledTable({
  ariaLabel,
  columns,
  rows,
  className = '',
}: {
  ariaLabel?: string;
  columns: readonly string[];
  rows: ReadonlyArray<{
    key: string;
    primary: string;
    cells: readonly string[];
  }>;
  className?: string;
}) {
  const [primaryHeader, ...secondaryHeaders] = columns;

  return (
    <div className={className}>
      {/* Desktop / tablet */}
      <div className="hidden overflow-hidden rounded-md border border-line bg-surface-sunken md:block">
        <table className="w-full min-w-[36rem] border-collapse text-left" aria-label={ariaLabel}>
          <thead>
            <tr className="border-b border-line bg-surface-elevated">
              {columns.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-ink-faint"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.key}
                className={twMerge(
                  'border-b border-line-divider last:border-b-0 transition-colors',
                  i % 2 === 1 ? 'bg-white/[0.012]' : '',
                )}
              >
                <th
                  scope="row"
                  className="px-4 py-3 font-sans text-[0.86rem] font-medium leading-[1.55] text-ink"
                >
                  {r.primary}
                </th>
                {r.cells.map((cell, idx) => (
                  <td
                    key={idx}
                    className="px-4 py-3 font-sans text-[0.85rem] leading-[1.6] text-ink-secondary"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="m-0 flex list-none flex-col gap-3 p-0 md:hidden">
        {rows.map((r) => (
          <li key={r.key} className="m-0 rounded-md border border-line bg-surface-sunken p-4">
            <p className="m-0 mb-3 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
              {primaryHeader}
            </p>
            <p className="m-0 mb-3 font-sans text-[0.9rem] font-semibold leading-snug text-ink">
              {r.primary}
            </p>
            <dl className="m-0 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 border-t border-line-divider p-0 pt-3">
              {secondaryHeaders.map((h, idx) => (
                <div key={h} className="contents">
                  <dt className="m-0 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                    {h}
                  </dt>
                  <dd className="m-0 min-w-0 font-sans text-[0.85rem] leading-[1.6] text-ink-secondary">
                    {r.cells[idx]}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------
 * Hooks: scroll-spy + reveal on scroll
 * ----------------------------------------------------------------------- */

function useActiveSection(ids: ReadonlyArray<string>): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0) ||
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.7] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function RevealSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={twMerge(
        'transition-[opacity,transform] duration-700 ease-soft',
        revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
