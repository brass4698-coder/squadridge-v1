import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Copy, List, Shield } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  LedgerPageSkeletonCards,
  LedgerPageSkeletonRows,
  LedgerPublishDramatization,
  PrimaryCTA,
} from '../components';
import {
  useLedgerProposalBySlug,
  useLedgerPublishedList,
  type LedgerProposalListRow,
} from '../hooks';
import {
  DEMO_PROPOSAL_ID,
  getSiteUrl,
  isSupabaseConfigured,
  type Json,
  type LedgerProposalStatus,
} from '../lib';

function parseConsensusItems(raw: Json): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string');
}

type OutcomeExtras = {
  unresolved?: string[];
  follow_up?: string[];
  confidence_note?: string;
  alignment?: string;
};

function parseOutcomeExtras(raw: Json): OutcomeExtras {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const asStrArr = (k: string): string[] | undefined => {
    const v = o[k];
    if (!Array.isArray(v)) return undefined;
    return v.filter((x): x is string => typeof x === 'string');
  };
  return {
    unresolved: asStrArr('unresolved'),
    follow_up: asStrArr('follow_up'),
    confidence_note: typeof o.confidence_note === 'string' ? o.confidence_note : undefined,
    alignment: typeof o.alignment === 'string' ? o.alignment : undefined,
  };
}

const DEMO_LEDGER_ROOT_SHORT = '0x7f3a…c91d';
/** Demo detail: publication date shown in trust block (aligns with index sample rows). */
const DEMO_LEDGER_PUBLISHED = '2026-03-18';
const DEMO_RECORD_NOTICE =
  'This is a sample public outcome record for product demonstration. The scenario is fictional and representative; the anchor and dates illustrate how a released record would be presented.';

/** Narrow reading measure for ledger prose — reads as a controlled artifact, not marketing width. */
const ledgerReadCol = 'max-w-[min(100%,34rem)]';

function ledgerLifecycleLabel(status: LedgerProposalStatus): string {
  switch (status) {
    case 'draft':
      return 'DRAFT';
    case 'published':
      return 'RELEASED';
    case 'archived':
      return 'SUPERSEDED';
    default:
      return 'RELEASED';
  }
}

function LedgerDemoNotice() {
  return (
    <section
      className="mb-4 mt-4 rounded-md border border-amber/35 bg-amber/[0.08] px-4 py-3 sm:px-5"
      aria-label="Demo record notice"
    >
      <p className="mb-0 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-amber/95">
        Demo record
      </p>
      <p className="mt-1.5 max-w-[42rem] font-sans text-[0.84rem] leading-relaxed text-ink-secondary">
        {DEMO_RECORD_NOTICE}
      </p>
    </section>
  );
}

/** Compact record strip: category · status · public slug (dominates hierarchy vs marketing chrome). */
function LedgerPublicRecordHeader({
  title,
  statusLabel,
  slug,
}: {
  title: string;
  statusLabel: string;
  slug: string;
}) {
  return (
    <header className="sr-record-sheet p-6 md:p-8">
      <p className="mb-5 font-mono text-[0.62rem] font-normal uppercase tracking-[0.12em] text-record-faint">
        <span className="text-record-muted">Public outcome record</span>
        <span className="mx-2 text-ink-subtle" aria-hidden>
          ·
        </span>
        <span className="font-semibold text-brand">{statusLabel}</span>
        <span className="mx-2 text-ink-subtle" aria-hidden>
          ·
        </span>
        <span className="break-all font-normal tracking-normal text-ink-secondary">{slug}</span>
      </p>
      <h1
        className="font-display text-record-ink"
        style={{
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.12,
        }}
      >
        {title}
      </h1>
    </header>
  );
}

function LedgerMissionPublicationBlock({ missionLine }: { missionLine: React.ReactNode }) {
  const publicationRest =
    'The session remains private. Only the outcome approved for release is published here, giving downstream partners a citable record without exposing participant identity, raw discussion, or attribution risk.';
  return (
    <section
      className="mt-8 border border-white/[0.08] bg-[#070b10]/60 px-4 py-4 sm:px-5 sm:py-5"
      aria-labelledby="ledger-mission-heading"
    >
      <div className={`space-y-4 ${ledgerReadCol}`}>
        <p
          id="ledger-mission-heading"
          className="mb-0 font-sans text-[0.9rem] font-medium leading-[1.55] text-ink"
        >
          {missionLine}
        </p>
        <p className="mb-0 font-sans text-[0.82rem] leading-[1.55] text-ink-secondary">
          {publicationRest}
        </p>
      </div>
    </section>
  );
}

function LedgerVerificationStrip({
  slug,
  publishedLabel,
  ledgerRef,
  illustrative = false,
}: {
  slug: string;
  publishedLabel: string;
  ledgerRef: string;
  illustrative?: boolean;
}) {
  const dateLabel = illustrative ? 'Sample release date' : 'Release date';
  const refLabel = illustrative ? 'Illustrative reference' : 'Ledger reference';
  const referenceNote = illustrative
    ? 'Demo-only reference. It shows the intended shape of an anchor, not an audited external proof.'
    : 'Opaque anchor recorded with the released row. Confirm against the publication date before relying on the record.';
  return (
    <section
      className="mt-8 overflow-hidden border border-white/[0.1] bg-[#060910]/90"
      aria-label="Verification identifiers for this record"
    >
      <div className="border-b border-white/[0.07] bg-[#080d14] px-4 py-3">
        <h2 className="font-heading text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          Verification metadata
        </h2>
        <p className="mt-1.5 max-w-[42rem] font-sans text-[0.76rem] leading-relaxed text-ink-muted">
          {referenceNote}
        </p>
      </div>
      <dl className="grid divide-y divide-white/[0.08] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3.5">
          <dt className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Public slug
          </dt>
          <dd className="mt-1.5 break-all font-mono text-[0.72rem] leading-snug text-ink-secondary">
            {slug}
          </dd>
        </div>
        <div className="px-4 py-3.5">
          <dt className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            {dateLabel}
          </dt>
          <dd className="mt-1.5 font-mono text-[0.72rem] text-ink-secondary">{publishedLabel}</dd>
        </div>
        <div className="px-4 py-3.5">
          <dt className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            {refLabel}
          </dt>
          <dd className="mt-1.5 break-all font-mono text-[0.72rem] leading-snug text-ink-secondary">
            {ledgerRef}
          </dd>
        </div>
      </dl>
    </section>
  );
}

type MachineFields = {
  publicReleaseScope: string;
  decisionClass: string;
  sessionType: string;
  downstreamApplicability: string;
};

function LedgerMachineReadablePanel({ fields }: { fields: MachineFields }) {
  const rows: { k: keyof MachineFields; label: string }[] = [
    { k: 'publicReleaseScope', label: 'Public release scope' },
    { k: 'decisionClass', label: 'Decision class' },
    { k: 'sessionType', label: 'Session type' },
    { k: 'downstreamApplicability', label: 'Downstream applicability' },
  ];
  return (
    <section
      className="mt-10 border border-white/[0.09] bg-[#05080e]/80 p-4"
      aria-labelledby="ledger-machine-heading"
    >
      <h2
        id="ledger-machine-heading"
        className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle"
      >
        Machine-readable summary
      </h2>
      <dl className="mt-4 space-y-2">
        {rows.map(({ k, label }) => (
          <div
            key={k}
            className="grid gap-1.5 border border-white/[0.07] bg-[#060910]/70 px-3 py-3 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="font-heading text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle sm:pt-0.5">
              {label}
            </dt>
            <dd className="min-w-0 font-sans text-[0.82rem] leading-relaxed text-ink-secondary">
              {fields[k]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function LedgerPrivacyConstraintsList() {
  const limits = [
    'Identity inside the room is not exposed.',
    'Raw statements and deliberation paths are not exposed.',
    'Room composition details are not exposed.',
    'Only the agreed outcome and its verification data are public.',
  ];
  return (
    <section
      className="mt-10 border border-white/[0.08] bg-[#070b10]/50 px-4 py-4 sm:px-5"
      aria-labelledby="privacy-constraints-h"
    >
      <h2
        id="privacy-constraints-h"
        className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-muted"
      >
        Disclosure constraints
      </h2>
      <ul
        className={`mt-3 list-none space-y-2 pl-0 font-sans text-[0.8rem] leading-relaxed text-ink-secondary ${ledgerReadCol}`}
      >
        {limits.map((x) => (
          <li key={x} className="flex gap-2">
            <span className="select-none text-ink-subtle" aria-hidden>
              ·
            </span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Short institutional citation line for reports and annexes. */
function buildLedgerRecordCitationLine(args: {
  title: string;
  slug: string;
  publishedDate: string;
  sample?: boolean;
}): string {
  if (args.sample) {
    return `SquadRidge sample public outcome record ${args.slug}, ${args.title}, product demonstration, sample date ${args.publishedDate}.`;
  }
  return `SquadRidge public outcome record ${args.slug}, ${args.title}, published ${args.publishedDate}.`;
}

function LedgerCitationBlock({
  title,
  slug,
  publishedDate,
  sample = false,
}: {
  title: string;
  slug: string;
  publishedDate: string;
  sample?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const line = buildLedgerRecordCitationLine({ title, slug, publishedDate, sample });
  const copy = useCallback(() => {
    void navigator.clipboard.writeText(line).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }, [line]);
  return (
    <section className="mt-10" aria-labelledby="citation-block-h">
      <h2
        id="citation-block-h"
        className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle"
      >
        {sample ? 'Sample citation' : 'Cite this record'}
      </h2>
      {sample ? (
        <p className="mt-2 max-w-[42rem] font-sans text-[0.8rem] leading-relaxed text-ink-muted">
          Use this as a formatting example only. It should not be cited as evidence of a real-world
          corridor agreement.
        </p>
      ) : null}
      <div className="mt-3 border border-white/[0.1] bg-[#060910] p-4">
        <pre className="m-0 max-w-full overflow-x-auto whitespace-pre-wrap break-words font-mono text-[0.7rem] leading-relaxed text-ink-secondary">
          {line}
        </pre>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-[44px] items-center gap-2 rounded border border-white/[0.12] bg-[#0d141f] px-3 py-2 font-sans text-[0.8rem] text-ink-secondary transition-colors hover:border-white/[0.2] hover:text-ink"
          >
            {copied ? (
              <Check className="size-4 text-teal-light" aria-hidden strokeWidth={2.5} />
            ) : (
              <Copy className="size-4 text-ink-muted" aria-hidden strokeWidth={2} />
            )}
            {copied ? 'Copied' : sample ? 'Copy sample citation' : 'Copy citation'}
          </button>
        </div>
      </div>
    </section>
  );
}

function LedgerReleasedOrderCards({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-10" aria-labelledby="released-orders-h">
      <h2
        id="released-orders-h"
        className="font-heading text-[1.05rem] font-bold leading-tight text-ink md:text-section-title"
      >
        Released orders
      </h2>
      <p className={`mt-2 font-sans text-[0.8rem] leading-snug text-ink-muted ${ledgerReadCol}`}>
        The following directives were approved for public release.
      </p>
      <ul className="mt-6 space-y-3">
        {items.map((line, i) => (
          <li key={i}>
            <article className="border border-white/[0.1] border-l-2 border-l-white/[0.18] bg-[#070b12]/55 px-4 py-3.5">
              <p className="mb-0 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                Order {(i + 1).toString().padStart(2, '0')}
              </p>
              <p
                className={`mb-0 mt-2.5 font-sans text-[0.85rem] font-normal leading-[1.55] text-ink-secondary [word-break:break-word] ${ledgerReadCol}`}
              >
                {line}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Single classification line, placed next to structured metadata (machine-readable block follows). */
function LedgerClassificationRow({ segments }: { segments: readonly string[] }) {
  if (segments.length === 0) return null;
  return (
    <p
      className={`mt-10 font-sans text-[0.82rem] leading-relaxed text-ink-secondary ${ledgerReadCol}`}
    >
      <span className="font-medium text-ink-muted">Classification:</span> {segments.join(' · ')}
    </p>
  );
}

function LedgerDetailFooterNav() {
  const cell =
    'flex flex-1 flex-col gap-2 rounded border border-white/[0.1] bg-[#070b10]/80 px-4 py-4 transition-colors hover:border-white/[0.18]';
  return (
    <nav
      className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-10 md:flex-row md:gap-4"
      aria-label="Next actions for this ledger record"
    >
      <Link to="/ledger" className={cell}>
        <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-teal-light/90">
          Browse
        </span>
        <span className="flex items-center gap-2 font-sans text-sm font-medium leading-snug text-ink">
          <List className="size-4 shrink-0 text-teal-light/90" aria-hidden strokeWidth={2} />
          Ledger index
        </span>
      </Link>
      <Link to="/trust" className={cell}>
        <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
          Trust
        </span>
        <span className="flex items-center gap-2 font-sans text-sm font-medium leading-snug text-ink-secondary">
          <Shield className="size-4 shrink-0 text-ink-muted" aria-hidden strokeWidth={2} />
          Trust &amp; Safety overview
        </span>
      </Link>
    </nav>
  );
}

/**
 * Public SquadRidge Ledger — index lists published proposals from Postgres when configured; detail by slug.
 */
export function LedgerPage() {
  const { proposalSlug } = useParams<{ proposalSlug?: string }>();
  const configured = isSupabaseConfigured();

  if (proposalSlug) {
    return <LedgerProposalDetailRoute proposalSlug={proposalSlug} configured={configured} />;
  }

  return <LedgerIndex />;
}

function LedgerProposalDetailRoute({
  proposalSlug,
  configured,
}: {
  proposalSlug: string;
  configured: boolean;
}) {
  const q = useLedgerProposalBySlug(proposalSlug);

  if (!configured) {
    if (proposalSlug === DEMO_PROPOSAL_ID) return <LedgerDemoProposalDetail />;
    return <LedgerIndex unknownProposalSlug={proposalSlug} />;
  }

  if (q.isPending) {
    return (
      <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
        <div className="relative z-[1] mx-auto w-full max-w-copy px-gutter py-16">
          <p className="font-sans text-sm text-ink-muted">Loading proposal…</p>
          <div className="vault-frost mt-8 animate-pulse p-8">
            <div className="h-6 w-2/3 rounded bg-[#1e2a3d]" />
            <div className="mt-4 h-4 w-full rounded bg-[#1e2a3d]/80" />
          </div>
        </div>
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
        <div className="relative z-[1] mx-auto w-full max-w-copy px-gutter py-10">
          <p
            className="rounded-lg border border-amber/30 bg-amber/10 px-4 py-3 font-sans text-sm text-amber"
            role="alert"
          >
            {q.error instanceof Error ? q.error.message : 'Could not load this proposal.'}
          </p>
          <Link
            to="/ledger"
            className="mt-6 inline-block font-sans text-sm text-teal-light underline-offset-4 hover:underline"
          >
            Back to ledger
          </Link>
        </div>
      </div>
    );
  }

  if (q.data) {
    return <LedgerProposalFromDb row={q.data} />;
  }

  if (proposalSlug === DEMO_PROPOSAL_ID) {
    return <LedgerDemoProposalDetail />;
  }

  return <LedgerIndex unknownProposalSlug={proposalSlug} />;
}

function LedgerProposalFromDb({
  row,
}: {
  row: {
    slug: string;
    title: string;
    summary: string;
    consensus_items: Json;
    outcome_extras: Json;
    tags: string[];
    published_at: string | null;
    ledger_ref: string | null;
    status: LedgerProposalStatus;
  };
}) {
  const bullets = parseConsensusItems(row.consensus_items);
  const outcome = parseOutcomeExtras(row.outcome_extras);
  const dateStr = row.published_at ? new Date(row.published_at).toISOString().slice(0, 10) : '—';
  const ledgerRefLine = row.ledger_ref ?? '—';
  const isDemoRecord = row.slug === DEMO_PROPOSAL_ID;
  const machine: MachineFields = {
    publicReleaseScope:
      'Released fields only: title, summary, consensus directives, timestamps, and reference metadata — not room contents.',
    decisionClass: isDemoRecord
      ? 'Representative operational consensus directives (fictional demo content).'
      : 'Operational consensus directives (domain labels appear under Classification).',
    sessionType:
      'Facilitator-led squad session (private); publication follows squad release policy.',
    downstreamApplicability: isDemoRecord
      ? 'For product demonstration only; do not rely on this sample as a real released outcome.'
      : 'Partners may cite released directives; verify reference metadata and publication date before reliance.',
  };

  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-3xl px-gutter py-10">
        <LedgerPublicRecordHeader
          title={row.title}
          statusLabel={isDemoRecord ? 'DEMO SAMPLE' : ledgerLifecycleLabel(row.status)}
          slug={row.slug}
        />

        {isDemoRecord ? <LedgerDemoNotice /> : null}

        <LedgerMissionPublicationBlock missionLine={row.summary} />

        <LedgerVerificationStrip
          slug={row.slug}
          publishedLabel={isDemoRecord ? `${dateStr} (sample)` : dateStr}
          ledgerRef={ledgerRefLine}
          illustrative={isDemoRecord}
        />

        <LedgerReleasedOrderCards items={bullets} />

        <LedgerOutcomeRecordSections outcome={outcome} />

        <LedgerClassificationRow segments={row.tags} />

        <LedgerMachineReadablePanel fields={machine} />

        <LedgerPrivacyConstraintsList />

        <LedgerCitationBlock
          title={row.title}
          slug={row.slug}
          publishedDate={dateStr}
          sample={isDemoRecord}
        />

        <LedgerDetailFooterNav />
      </div>
    </div>
  );
}

const DEMO_CONSENSUS_LINES = [
  'Corridor coordinators establish a neutral coordination frequency and a single written chain of custody for corridor access before any movement windows open.',
  'Corridor stewards post visible de-escalation markers at agreed intervals; if any marker is contested, all crossings pause for 15 minutes while the channel resolves the incident.',
  'Displaced civilians are routed through three pre-cleared nodes only; no ad-hoc detours occur without unanimous squad sign-off on the shared channel.',
] as const;

const DEMO_OUTCOME: OutcomeExtras = {
  unresolved: [
    'Long-term status of cross-line observation posts not settled in this session (requires policy owners).',
  ],
  follow_up: [
    'Schedule a neutral-facility dry run of marker placement before the next movement window.',
    'Publish a single coordination frequency in the public annex before opening crossings.',
  ],
  confidence_note:
    'Participants reported medium confidence in de-escalation markers; alignment on civilian routing was high.',
  alignment: 'Strong on pause-and-resolve; medium on cross-authority comms for contested markers.',
};

function LedgerOutcomeRecordSections({ outcome }: { outcome: OutcomeExtras }) {
  const has =
    (outcome.unresolved?.length ?? 0) > 0 ||
    (outcome.follow_up?.length ?? 0) > 0 ||
    Boolean(outcome.confidence_note) ||
    Boolean(outcome.alignment);
  if (!has) {
    return (
      <p
        className={`mt-10 font-sans text-[0.8rem] leading-relaxed text-ink-muted ${ledgerReadCol}`}
      >
        No private outcome addenda stored for this record — released orders only appear on this
        page.
      </p>
    );
  }
  return (
    <div className="mt-10 max-w-[min(100%,38rem)] space-y-6 border-t border-white/[0.08] pt-8">
      <h2 className="break-words font-heading text-[1.05rem] font-bold text-ink md:text-section-title">
        Session outcome (structured)
      </h2>
      {outcome.unresolved && outcome.unresolved.length > 0 ? (
        <div>
          <h3 className="font-heading text-[0.8rem] font-semibold uppercase tracking-wide text-amber/90">
            Unresolved
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
            {outcome.unresolved.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {outcome.follow_up && outcome.follow_up.length > 0 ? (
        <div>
          <h3 className="font-heading text-[0.8rem] font-semibold uppercase tracking-wide text-teal/80">
            Follow-up recommendations
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
            {outcome.follow_up.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {outcome.alignment ? (
        <p className="font-sans text-[0.88rem] text-ink-secondary">
          <span className="font-medium text-ink-muted">Alignment: </span>
          {outcome.alignment}
        </p>
      ) : null}
      {outcome.confidence_note ? (
        <p className="font-sans text-[0.88rem] text-ink-secondary">
          <span className="font-medium text-ink-muted">Confidence: </span>
          {outcome.confidence_note}
        </p>
      ) : null}
    </div>
  );
}

function LedgerDemoProposalDetail() {
  const demoTitle = 'Civilian protection protocols — displacement corridor';
  const missionLine =
    'Reduce civilian harm and miscoordination during corridor movements in mixed-control zones by operating temporary displacement corridors with time-boxed civilian movement windows agreed by armed actors.';
  const demoMachine: MachineFields = {
    publicReleaseScope:
      'Sample released fields only: title, summary, representative directives, date, and illustrative reference metadata.',
    decisionClass: 'Representative operational corridor controls · civilian routing',
    sessionType: 'Simulated facilitator-led squad session (private-room model)',
    downstreamApplicability:
      'Product demonstration for how movement coordinators, observers, and adjacent authorities could read a bounded public record.',
  };

  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-3xl px-gutter py-10">
        <LedgerPublicRecordHeader
          title={demoTitle}
          statusLabel="DEMO SAMPLE"
          slug={DEMO_PROPOSAL_ID}
        />

        <LedgerDemoNotice />

        <LedgerPublishDramatization />

        <LedgerMissionPublicationBlock missionLine={missionLine} />

        <LedgerVerificationStrip
          slug={DEMO_PROPOSAL_ID}
          publishedLabel={`${DEMO_LEDGER_PUBLISHED} (sample)`}
          ledgerRef={`ledger:root=${DEMO_LEDGER_ROOT_SHORT}`}
          illustrative
        />

        <LedgerReleasedOrderCards items={[...DEMO_CONSENSUS_LINES]} />

        <LedgerOutcomeRecordSections outcome={DEMO_OUTCOME} />

        <LedgerClassificationRow segments={['Climate', 'Displacement', 'Corridor operations']} />

        <LedgerMachineReadablePanel fields={demoMachine} />

        <LedgerPrivacyConstraintsList />

        <LedgerCitationBlock
          title={demoTitle}
          slug={DEMO_PROPOSAL_ID}
          publishedDate={DEMO_LEDGER_PUBLISHED}
          sample
        />

        <LedgerDetailFooterNav />
      </div>
    </div>
  );
}

const EMPTY_LEDGER_ROWS: LedgerProposalListRow[] = [];

function LedgerIndex({ unknownProposalSlug }: { unknownProposalSlug?: string } = {}) {
  const listQuery = useLedgerPublishedList();
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [citeCopied, setCiteCopied] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const modalTitleId = useId();
  const modalDescId = useId();

  const citation = useLedgerCitation();
  const configured = isSupabaseConfigured();
  const allDbRows = listQuery.data ?? EMPTY_LEDGER_ROWS;

  // Search / tag / sort state — filters are applied client-side over the
  // already-fetched list; the published-row volume in v1 is small enough that
  // a server-side filter would only complicate the cache key.
  const [searchInput, setSearchInput] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const row of allDbRows) {
      for (const t of row.tags ?? []) set.add(t);
    }
    return Array.from(set).sort();
  }, [allDbRows]);

  const dbRows = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    let rows = allDbRows.filter((r) => {
      const matchesTag = !activeTag || (r.tags ?? []).includes(activeTag);
      if (!matchesTag) return false;
      if (!q) return true;
      const haystack = `${r.title} ${r.summary}`.toLowerCase();
      return haystack.includes(q);
    });
    rows = rows.slice().sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      const ta = a.published_at ? Date.parse(a.published_at) : 0;
      const tb = b.published_at ? Date.parse(b.published_at) : 0;
      return sortBy === 'newest' ? tb - ta : ta - tb;
    });
    return rows;
  }, [allDbRows, searchInput, activeTag, sortBy]);

  const showDb = configured && !listQuery.isError && dbRows.length > 0;
  const filteredEverything =
    configured && !listQuery.isError && allDbRows.length > 0 && dbRows.length === 0;

  const copyCitation = useCallback(() => {
    void navigator.clipboard.writeText(citation).then(() => {
      setCiteCopied(true);
      window.setTimeout(() => setCiteCopied(false), 2000);
    });
  }, [citation]);

  useEffect(() => {
    if (!ledgerModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLedgerModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [ledgerModalOpen]);

  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-gutter py-8 md:py-10">
        <div className="flex flex-col gap-4 border-b border-[#1a2236]/90 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="mb-0 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-brand">
              Public record layer
            </p>
            <h1
              className="mb-0 mt-2 flex flex-wrap items-end gap-x-3 gap-y-2 font-display text-ink"
              style={{
                fontSize: 'clamp(1.85rem, 3.2vw, 2.65rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
              }}
            >
              <span className="min-w-0">The SquadRidge Ledger</span>
            </h1>
            <p className="mt-3 max-w-2xl font-sans text-body-lg font-normal leading-relaxed text-ink-secondary">
              A public archive of approved outcomes from sealed facilitator-led rooms. Citable,
              timestamped, and structurally separate from the private discussion.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLedgerModalOpen(true)}
            className="inline-flex min-h-[44px] max-w-full items-center self-start text-left font-sans text-sm font-medium leading-snug text-teal-light underline-offset-4 hover:underline md:self-auto"
          >
            What is the SquadRidge Ledger?
          </button>
        </div>

        <p className="mt-6 max-w-[52rem] font-sans text-body-lg font-normal leading-relaxed text-ink-secondary">
          The ledger is a public archive of consensus proposals published from facilitator-led
          squads. It preserves the outcome of a session — not the private discussion — so others can
          cite, review, and build on what was agreed.
        </p>

        {unknownProposalSlug ? (
          <p className="mt-6 rounded-lg border border-amber/25 bg-amber/5 px-4 py-3 font-sans text-sm text-ink-secondary">
            No public entry for{' '}
            <span className="font-mono text-ink-muted">{unknownProposalSlug}</span> yet. Browse the
            ledger below or start from a squad session when entries go live.
          </p>
        ) : null}

        {configured && listQuery.isError ? (
          <p
            className="mt-6 rounded-lg border border-amber/25 bg-amber/5 px-4 py-3 font-sans text-sm text-ink-secondary"
            role="alert"
          >
            Could not load live ledger entries (
            {listQuery.error instanceof Error ? listQuery.error.message : 'error'}
            ). Showing static preview rows until the database is reachable and migrations are
            applied.
          </p>
        ) : null}

        <div
          className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3"
          role="search"
          aria-label="Filter ledger entries"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="block min-w-0 flex-1">
              <span className="sr-only">Search published proposals</span>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search title or summary"
                className="block w-full rounded-md border border-white/[0.08] bg-[#070b13] px-3 py-2 font-sans text-sm text-ink placeholder:text-ink-subtle focus:border-teal/60 focus:outline-none"
              />
            </label>
            <div className="flex items-center gap-2 md:shrink-0">
              <label className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-ink-subtle">
                Sort
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                className="rounded-md border border-white/[0.08] bg-[#070b13] px-2 py-1.5 font-sans text-sm text-ink focus:border-teal/60 focus:outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">By title</option>
              </select>
            </div>
          </div>
          {allTags.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                aria-pressed={activeTag === null}
                onClick={() => setActiveTag(null)}
                className={`inline-flex min-h-[44px] items-center rounded-full border px-3 py-1 font-mono text-[0.7rem] transition-colors ${
                  activeTag === null
                    ? 'border-teal/60 bg-teal/15 text-teal-light'
                    : 'border-white/10 bg-white/[0.02] text-ink-secondary hover:border-teal/30 hover:text-ink'
                }`}
              >
                All tags
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`inline-flex min-h-[44px] items-center rounded-full border px-3 py-1 font-mono text-[0.7rem] transition-colors ${
                    activeTag === tag
                      ? 'border-teal/60 bg-teal/15 text-teal-light'
                      : 'border-white/10 bg-white/[0.02] text-ink-secondary hover:border-teal/30 hover:text-ink'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : null}
          {filteredEverything ? (
            <p className="mt-3 font-sans text-sm text-ink-muted">
              No published entries match the current filters.{' '}
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setActiveTag(null);
                }}
                className="inline-flex min-h-[44px] items-center text-teal-light underline-offset-4 hover:underline"
              >
                Reset filters
              </button>
              .
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_min(22rem,100%)] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <h2 className="font-heading text-section-title font-bold text-ink">Entries</h2>
            <p className="mt-1 font-sans text-sm text-ink-muted">
              Published proposals appear here after a squad closes with consensus.
            </p>

            <div className="vault-frost mt-6 overflow-hidden">
              <div className="hidden overflow-x-auto overscroll-x-contain md:block">
                <table className="w-full min-w-[46rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="w-[8.5rem] px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Date
                      </th>
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Record
                      </th>
                      <th className="w-[9.5rem] px-4 py-3 text-right font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-sans text-sm text-ink-secondary">
                    {configured && listQuery.isPending ? (
                      <LedgerPageSkeletonRows count={4} />
                    ) : showDb ? (
                      <>
                        {dbRows.map((row) => (
                          <LedgerDemoRowDesktop
                            key={row.id}
                            date={
                              row.published_at
                                ? new Date(row.published_at).toISOString().slice(0, 10)
                                : '—'
                            }
                            topic={row.title}
                            summary={row.summary}
                            tags={row.tags}
                            href={`/ledger/${row.slug}`}
                            demo={row.slug === DEMO_PROPOSAL_ID}
                            ledgerRef={row.ledger_ref}
                          />
                        ))}
                        <LedgerDemoRowDesktop
                          date="2026-02-02"
                          topic="Watershed governance"
                          summary="Illustrative entry: shared monitoring commitments across a transboundary basin (preview)."
                          tags={['Water', 'Governance']}
                          href={null}
                          demo
                        />
                      </>
                    ) : (
                      <>
                        <LedgerDemoRowDesktop
                          date="2026-03-18"
                          topic="Climate & corridors"
                          summary="Example proposal from a cross-border climate squad: coordinated civilian movement and de-escalation markers."
                          tags={['Climate', 'Displacement']}
                          href={`/ledger/${DEMO_PROPOSAL_ID}`}
                          demo
                          ledgerRef={`ledger:root=${DEMO_LEDGER_ROOT_SHORT}`}
                        />
                        <LedgerDemoRowDesktop
                          date="2026-02-02"
                          topic="Watershed governance"
                          summary="Illustrative entry: shared monitoring commitments across a transboundary basin (preview)."
                          tags={['Water', 'Governance']}
                          href={null}
                          demo
                        />
                        <LedgerPageSkeletonRows count={3} />
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/10 md:hidden">
                {configured && listQuery.isPending ? (
                  <LedgerPageSkeletonCards count={3} />
                ) : showDb ? (
                  <>
                    {dbRows.map((row) => (
                      <LedgerDemoCard
                        key={row.id}
                        date={
                          row.published_at
                            ? new Date(row.published_at).toISOString().slice(0, 10)
                            : '—'
                        }
                        topic={row.title}
                        summary={row.summary}
                        tags={row.tags}
                        href={`/ledger/${row.slug}`}
                        demo={row.slug === DEMO_PROPOSAL_ID}
                        ledgerRef={row.ledger_ref}
                      />
                    ))}
                    <LedgerDemoCard
                      date="2026-02-02"
                      topic="Watershed governance"
                      summary="Illustrative entry: shared monitoring commitments across a transboundary basin (preview)."
                      tags={['Water', 'Governance']}
                      href={null}
                      demo
                    />
                  </>
                ) : (
                  <>
                    <LedgerDemoCard
                      date="2026-03-18"
                      topic="Climate & corridors"
                      summary="Example proposal from a cross-border climate squad: coordinated civilian movement and de-escalation markers."
                      tags={['Climate', 'Displacement']}
                      href={`/ledger/${DEMO_PROPOSAL_ID}`}
                      demo
                      ledgerRef={`ledger:root=${DEMO_LEDGER_ROOT_SHORT}`}
                    />
                    <LedgerDemoCard
                      date="2026-02-02"
                      topic="Watershed governance"
                      summary="Illustrative entry: shared monitoring commitments across a transboundary basin (preview)."
                      tags={['Water', 'Governance']}
                      href={null}
                      demo
                    />
                    <LedgerPageSkeletonCards count={2} />
                  </>
                )}
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-8 lg:sticky lg:top-24">
            <section className="vault-frost p-5">
              <h2 className="font-heading text-[0.95rem] font-bold text-ink">How entries work</h2>
              <p className="mt-2 font-sans text-[0.78rem] leading-snug text-ink-faint">
                What is true today, and what is on the roadmap.
              </p>
              <ul className="mt-4 list-none space-y-4 font-sans text-[0.875rem] leading-relaxed text-ink-secondary">
                <li>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-flex items-center rounded border border-teal/45 bg-teal/10 px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-teal-light"
                    >
                      Current
                    </span>
                    <span className="font-medium text-ink-muted">Publishing</span>
                  </div>
                  In the product model, when a facilitator-led squad closes a session with
                  consensus, a compact proposal — not a transcript — is released here with a public
                  timestamp and internal moderator attestation.
                </li>
                <li>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-flex items-center rounded border border-teal/45 bg-teal/10 px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-teal-light"
                    >
                      Current
                    </span>
                    <span className="font-medium text-ink-muted">Bounded public metadata</span>
                  </div>
                  Identities stay off the record. Each released entry can carry a public reference (
                  <code className="font-mono text-[0.78rem] text-ink-secondary">ledger:root=…</code>
                  ) that is checked against platform-held release metadata without exposing who was
                  in the room.
                </li>
                <li>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-flex items-center rounded border border-teal/45 bg-teal/10 px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-teal-light"
                    >
                      Policy
                    </span>
                    <span className="font-medium text-ink-muted">Append-only by policy</span>
                  </div>
                  Published rows are never silently edited or deleted. A correction appears as a new
                  entry that{' '}
                  <em className="not-italic font-medium text-ink-secondary">supersedes</em> the old
                  one; the original stays in the ledger marked{' '}
                  <code className="font-mono text-[0.78rem] text-ink-secondary">SUPERSEDED</code>.
                  The version you cite today is the version that was attested.
                </li>
                <li className="border-t border-white/[0.07] pt-4">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-flex items-center rounded border border-amber/35 bg-amber/[0.08] px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-amber/95"
                    >
                      Coming next
                    </span>
                    <span className="font-medium text-ink-muted">External hash anchoring</span>
                  </div>
                  <p className="m-0 text-ink-faint">
                    Cryptographic chaining of ledger entries to an external anchor for
                    cross-platform verifiability. Today the chain of trust ends at SquadRidge’s
                    internal moderator attestation; a future release adds a third-party-verifiable
                    hash trail.
                  </p>
                </li>
              </ul>
            </section>

            <section className="vault-frost p-5" aria-labelledby="cite-section-heading">
              <h2
                id="cite-section-heading"
                className="font-heading text-[0.95rem] font-bold text-ink"
              >
                How to cite this
              </h2>
              <p className="mt-2 font-sans text-[0.8125rem] leading-relaxed text-ink-muted">
                Use this as a template for reports, footnotes, or policy annexes. The sample text is
                illustrative; a real record citation should use the exact record URL and retrieval
                date.
              </p>
              <div
                className="mt-4 rounded-xl border border-white/[0.12] bg-[#070b10]/80 p-4 shadow-inner"
                role="region"
                aria-labelledby="ledger-citation-label"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p
                    id="ledger-citation-label"
                    className="mb-0 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle"
                  >
                    Citation template
                  </p>
                  <span className="rounded border border-amber/30 bg-amber/[0.08] px-2 py-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-amber/90">
                    Sample content
                  </span>
                </div>
                <div id="ledger-citation-text" className="min-w-0 overflow-x-auto">
                  <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[0.72rem] leading-relaxed tracking-tight text-ink-secondary">
                    {citation}
                  </pre>
                </div>
              </div>
              <div
                className="mt-5 flex flex-col gap-2 border-t border-white/[0.1] pt-5"
                role="group"
                aria-label="Copy citation to clipboard"
              >
                <button
                  type="button"
                  onClick={copyCitation}
                  aria-describedby="ledger-citation-text"
                  className="inline-flex min-h-[44px] w-full max-w-xs shrink-0 items-center justify-center rounded-md border border-white/[0.14] bg-[#0f1623] px-4 py-2.5 font-sans text-[0.85rem] font-semibold text-teal-light shadow-[0_2px_12px_rgba(0,0,0,0.28)] transition-[border-color,background-color] hover:border-teal/35 hover:bg-white/[0.04] sm:w-auto"
                >
                  {citeCopied ? 'Copied template' : 'Copy citation template'}
                </button>
                <p className="mb-0 font-sans text-[0.74rem] leading-relaxed text-ink-faint">
                  Copies the visible template only; it is not evidence of a real released outcome.
                </p>
              </div>
            </section>
          </aside>
        </div>

        <section
          className="mt-14 w-full border-t border-white/[0.12] pt-12"
          aria-labelledby="ledger-cta-heading"
        >
          <h2 id="ledger-cta-heading" className="sr-only">
            Next steps
          </h2>
          <div className="flex w-full flex-col gap-8 sm:flex-row sm:items-center sm:gap-0">
            <div className="min-w-0 sm:pr-10 lg:pr-14">
              <PrimaryCTA
                label="Apply for pilot access"
                href="/#waitlist"
                size="md"
                shape="squircle"
                className="w-full sm:w-fit"
              />
            </div>
            <span className="hidden h-10 w-px shrink-0 bg-white/[0.14] sm:block" aria-hidden />
            <div className="flex min-h-[44px] items-center sm:pl-10 lg:pl-14">
              <Link
                to="/"
                className="font-sans text-sm text-ink-muted underline-offset-4 hover:text-ink-secondary hover:underline"
              >
                Back to home
              </Link>
            </div>
          </div>
          <p className="mb-0 mt-6 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
            Interested in publishing through a facilitated squad?{' '}
            <Link
              to="/#how-it-works"
              className="font-medium text-teal-light/95 underline-offset-4 hover:text-teal-light hover:underline"
            >
              Learn how facilitated matching works
            </Link>
          </p>
        </section>
      </div>

      {ledgerModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setLedgerModalOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            aria-describedby={modalDescId}
            className="vault-frost relative z-10 max-h-[min(90vh,32rem)] w-full max-w-lg overflow-y-auto p-6 shadow-[0_24px_64px_rgba(0,0,0,0.55)]"
          >
            <h2 id={modalTitleId} className="font-heading text-section-title font-bold text-ink">
              What is the SquadRidge Ledger?
            </h2>
            <div
              id={modalDescId}
              className="mt-4 space-y-4 font-sans text-body-lg font-normal leading-relaxed text-ink-secondary"
            >
              <p className="mb-0">
                The ledger is a public archive of consensus proposals published from facilitator-led
                squads. It records outcomes, not transcripts, so the result can be cited without
                exposing who participated in the room.
              </p>
              <p className="mb-0">
                The Ledger is also the durable summary of what squads agreed—without exposing every
                word that was said in private. It exists so journalists, donors, and institutions
                can point to outcomes that matter across borders while participants stay protected.
              </p>
              <p className="mb-0">
                SquadRidge is infrastructure for conversations that cannot happen in public. The
                Ledger is how those conversations leave a trace that still holds up in the open.
              </p>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setLedgerModalOpen(false)}
              className="btn-primary mt-8 w-full min-h-[44px] sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Stable canonical origin for the *displayed* sample citation.
 *
 * The sample is a public-facing example of how a real citation should look.
 * If the deployment has a public origin set (`VITE_SITE_URL`), use that.
 * Otherwise — including dev / preview / localhost — fall back to a stable
 * production-shaped placeholder. We deliberately do NOT use
 * `window.location.origin` here, because a sample that says "localhost:5173"
 * undermines the archival feel of the whole page.
 */
const LEDGER_CITATION_FALLBACK_ORIGIN = 'https://squadridge.org';

function isPublicOrigin(origin: string): boolean {
  if (!origin) return false;
  return !/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|\d+\.\d+\.\d+\.\d+)(:|$|\/)/i.test(
    origin,
  );
}

function buildLedgerCitationLine(): string {
  const configured = getSiteUrl().replace(/\/$/, '');
  const origin = isPublicOrigin(configured) ? configured : LEDGER_CITATION_FALLBACK_ORIGIN;
  return `SquadRidge Ledger. “Civilian protection protocols — displacement corridor” (example entry). Retrieved ${todayIso()}, from ${origin}/ledger.`;
}

function useLedgerCitation(): string {
  const [line, setLine] = useState(buildLedgerCitationLine);
  useEffect(() => {
    setLine(buildLedgerCitationLine());
  }, []);
  return line;
}

function todayIso(): string {
  try {
    return new Date().toISOString().slice(0, 10);
  } catch {
    return 'YYYY-MM-DD';
  }
}

function LedgerEntryMetaStrip({
  anchor,
  demo = false,
  tags,
}: {
  anchor?: string | null;
  demo?: boolean;
  tags: readonly string[];
}) {
  const labels = demo
    ? ['Demo sample', 'Representative content']
    : ['Approved outcome', 'Consensus reached'];
  const anchorLabel = demo ? 'Sample anchor' : 'Anchor';
  return (
    <div
      className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2 font-sans text-[0.72rem] leading-snug text-ink-faint"
      aria-label="Entry metadata"
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded border border-[#2d3f55]/70 bg-[#0b0f14]/80 px-2 py-0.5 font-mono text-[0.64rem] text-ink-muted"
        >
          {tag}
        </span>
      ))}
      {labels.map((label) => (
        <span key={label} className="text-ink-faint">
          {label}
        </span>
      ))}
      {anchor ? (
        <span
          className="font-mono text-[0.68rem] text-ink-faint"
          title={`${anchorLabel}: ${anchor}`}
        >
          <span className="text-ink-subtle">{anchorLabel}</span>{' '}
          <span className="text-ink-secondary">{anchor}</span>
        </span>
      ) : null}
    </div>
  );
}

/**
 * Reduce a `ledger:root=0x7f3a…c91d · session_ref=…` reference to just the
 * truncated root hash for the index strip. Defensive against unexpected shapes.
 */
function shortLedgerAnchor(ref: string | null | undefined): string | null {
  if (!ref) return null;
  const m = /root\s*=\s*([^\s·,]+)/i.exec(ref);
  return m?.[1] ?? null;
}

function LedgerDemoRowDesktop({
  date,
  topic,
  summary,
  tags,
  href,
  demo,
  ledgerRef,
}: {
  date: string;
  topic: string;
  summary: string;
  tags: readonly string[];
  href: string | null;
  demo: boolean;
  ledgerRef?: string | null;
}) {
  const anchor = shortLedgerAnchor(ledgerRef);
  return (
    <tr className="border-b border-white/10 align-top transition-colors hover:bg-white/[0.025]">
      <td className="whitespace-nowrap px-4 py-5 align-top font-mono text-xs text-ink-muted">
        {date}
      </td>
      <td className="min-w-0 px-4 py-5 align-top">
        <p className="m-0 max-w-[34rem] break-words font-heading text-[0.98rem] font-semibold leading-snug text-ink">
          {topic}
        </p>
        <p className="mt-2 max-w-[42rem] break-words font-sans text-[0.86rem] leading-relaxed text-ink-secondary">
          {summary}
        </p>
        <LedgerEntryMetaStrip anchor={anchor} demo={demo} tags={tags} />
      </td>
      <td className="px-4 py-5 align-top text-right">
        {href ? (
          <Link
            to={href}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.03] px-3.5 py-2 font-sans text-[0.82rem] font-medium text-teal-light no-underline transition-colors hover:border-teal/35 hover:bg-teal/[0.08] hover:text-teal-light"
          >
            Open record
          </Link>
        ) : (
          <span className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/[0.08] px-3.5 py-2 font-sans text-[0.82rem] font-medium text-ink-subtle">
            Preview only
          </span>
        )}
      </td>
    </tr>
  );
}

function LedgerDemoCard({
  date,
  topic,
  summary,
  tags,
  href,
  demo,
  ledgerRef,
}: {
  date: string;
  topic: string;
  summary: string;
  tags: readonly string[];
  href: string | null;
  demo: boolean;
  ledgerRef?: string | null;
}) {
  const anchor = shortLedgerAnchor(ledgerRef);
  return (
    <article className="min-w-0 px-4 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <time className="font-mono text-xs text-ink-muted">{date}</time>
      </div>
      <h3 className="mt-2 break-words font-heading text-[1.08rem] font-bold leading-snug text-ink">
        {topic}
      </h3>
      <p className="mt-3 break-words font-sans text-sm leading-relaxed text-ink-secondary">
        {summary}
      </p>
      <LedgerEntryMetaStrip anchor={anchor} demo={demo} tags={tags} />
      <div className="mt-5">
        {href ? (
          <Link
            to={href}
            className="inline-flex min-h-[44px] max-w-full items-center rounded-md border border-white/[0.12] bg-white/[0.03] px-3.5 py-2 font-sans text-[0.84rem] font-medium text-teal-light no-underline transition-colors hover:border-teal/35 hover:bg-teal/[0.08]"
          >
            Open record
          </Link>
        ) : (
          <span className="inline-flex min-h-[44px] items-center rounded-md border border-white/[0.08] px-3.5 py-2 font-sans text-[0.82rem] font-medium text-ink-subtle">
            Preview only
          </span>
        )}
      </div>
    </article>
  );
}
