import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ClipboardPen, Copy, List, Shield } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { LedgerPageSkeletonCards, LedgerPageSkeletonRows, PrimaryCTA } from '../components';
import { SensitiveField } from '../components/shared/SensitiveField';
import { TrustLabel } from '../components/shared/TrustLabel';
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

/** Narrow reading measure for ledger prose — reads as a controlled artifact, not marketing width. */
const ledgerReadCol = 'max-w-[min(100%,34rem)]';

function ledgerLifecycleLabel(status: LedgerProposalStatus): string {
  switch (status) {
    case 'draft':
      return 'DRAFT';
    case 'published':
      return 'PUBLISHED';
    case 'archived':
      return 'SUPERSEDED';
    default:
      return 'PUBLISHED';
  }
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
    <header className="border-b border-white/[0.08] pb-8">
      <div className="mb-3">
        <TrustLabel variant="ledger" />
      </div>
      <p className="mb-5 font-mono text-[0.62rem] font-normal uppercase tracking-[0.12em] text-ink-muted">
        <span className="text-ink-secondary">Public outcome record</span>
        <span className="mx-2 text-ink-subtle" aria-hidden>
          ·
        </span>
        <span className="font-semibold text-teal-light/95">{statusLabel}</span>
        <span className="mx-2 text-ink-subtle" aria-hidden>
          ·
        </span>
        <SensitiveField
          value={slug}
          className="break-all text-[0.62rem] font-normal tracking-normal text-ink-secondary"
        />
      </p>
      <h1
        className="font-heading text-ink"
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
}: {
  slug: string;
  publishedLabel: string;
  ledgerRef: string;
}) {
  return (
    <section
      className="mt-8 overflow-hidden border border-white/[0.1] bg-[#060910]/90"
      aria-label="Verification identifiers for this record"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] bg-[#080d14] px-4 py-2">
        <h2 className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          Verification
        </h2>
        <TrustLabel variant="ledger" />
      </div>
      <div className="grid divide-y divide-white/[0.08] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-3.5">
          <p className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Public slug
          </p>
          <div className="mt-1.5">
            <SensitiveField
              value={slug}
              className="break-all text-[0.72rem] leading-snug text-ink-secondary"
            />
          </div>
        </div>
        <div className="px-4 py-3.5">
          <p className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Published
          </p>
          <p className="mt-1.5 font-mono text-[0.72rem] text-ink-secondary">{publishedLabel}</p>
        </div>
        <div className="px-4 py-3.5">
          <p className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Ledger reference
          </p>
          <div className="mt-1.5">
            <SensitiveField
              value={ledgerRef}
              className="break-all text-[0.72rem] leading-snug text-ink-secondary"
            />
          </div>
        </div>
      </div>
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
          <div key={k} className="border border-white/[0.07] bg-[#060910]/70 px-3 py-2.5">
            <dt className="font-heading text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              {label}
            </dt>
            <dd className="mt-1.5 min-w-0 font-sans text-[0.78rem] leading-relaxed text-ink-secondary">
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
}): string {
  return `SquadRidge public outcome record ${args.slug}, ${args.title}, published ${args.publishedDate}.`;
}

function LedgerCitationBlock({
  title,
  slug,
  publishedDate,
}: {
  title: string;
  slug: string;
  publishedDate: string;
}) {
  const [copied, setCopied] = useState(false);
  const line = buildLedgerRecordCitationLine({ title, slug, publishedDate });
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
        Cite this record
      </h2>
      <div className="mt-3 border border-white/[0.1] bg-[#060910] p-4">
        <pre className="m-0 max-w-full overflow-x-auto whitespace-pre-wrap break-words font-mono text-[0.7rem] leading-relaxed text-ink-secondary">
          {line}
        </pre>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-[40px] items-center gap-2 rounded border border-white/[0.12] bg-[#0d141f] px-3 py-2 font-sans text-[0.8rem] text-ink-secondary transition-colors hover:border-white/[0.2] hover:text-ink"
          >
            {copied ? (
              <Check className="size-4 text-teal-light" aria-hidden strokeWidth={2.5} />
            ) : (
              <Copy className="size-4 text-ink-muted" aria-hidden strokeWidth={2} />
            )}
            {copied ? 'Copied' : 'Copy citation'}
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
      <Link to="/security" className={cell}>
        <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-teal-light/90">
          Verify
        </span>
        <span className="flex items-center gap-2 font-sans text-sm font-medium leading-snug text-ink">
          <Shield className="size-4 shrink-0 text-teal-light/90" aria-hidden strokeWidth={2} />
          Security model
        </span>
      </Link>
      <Link to="/ledger" className={cell}>
        <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
          Browse
        </span>
        <span className="flex items-center gap-2 font-sans text-sm font-medium leading-snug text-ink-secondary">
          <List className="size-4 shrink-0 text-ink-muted" aria-hidden strokeWidth={2} />
          Ledger index
        </span>
      </Link>
      <a href="/#waitlist" className={cell}>
        <span className="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
          Apply
        </span>
        <span className="flex items-center gap-2 font-sans text-sm font-medium leading-snug text-ink-secondary">
          <ClipboardPen className="size-4 shrink-0 text-ink-muted" aria-hidden strokeWidth={2} />
          Request pilot access
        </span>
      </a>
    </nav>
  );
}

/**
 * Public SquadRidge Ledger — index lists published proposals from Postgres when configured; detail by slug.
 */
export function LedgerPage() {
  const { proposalId } = useParams<{ proposalId?: string }>();
  const configured = isSupabaseConfigured();

  if (proposalId) {
    return <LedgerProposalDetailRoute proposalId={proposalId} configured={configured} />;
  }

  return <LedgerIndex />;
}

function LedgerProposalDetailRoute({
  proposalId,
  configured,
}: {
  proposalId: string;
  configured: boolean;
}) {
  const q = useLedgerProposalBySlug(proposalId);

  if (!configured) {
    if (proposalId === DEMO_PROPOSAL_ID) return <LedgerDemoProposalDetail />;
    return <LedgerIndex unknownProposalId={proposalId} />;
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

  if (proposalId === DEMO_PROPOSAL_ID) {
    return <LedgerDemoProposalDetail />;
  }

  return <LedgerIndex unknownProposalId={proposalId} />;
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
  const machine: MachineFields = {
    publicReleaseScope:
      'Published fields only: title, summary, consensus directives, timestamps, and ledger anchor — not room contents.',
    decisionClass: 'Operational consensus directives (domain labels appear under Classification).',
    sessionType:
      'Facilitator-led squad session (private); publication follows squad release policy.',
    downstreamApplicability:
      'Partners may cite released directives; verify anchor and publication date before reliance.',
  };

  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-3xl px-gutter py-10">
        <LedgerPublicRecordHeader
          title={row.title}
          statusLabel={ledgerLifecycleLabel(row.status)}
          slug={row.slug}
        />

        <LedgerMissionPublicationBlock missionLine={row.summary} />

        <LedgerVerificationStrip
          slug={row.slug}
          publishedLabel={dateStr}
          ledgerRef={ledgerRefLine}
        />

        <LedgerReleasedOrderCards items={bullets} />

        <LedgerOutcomeRecordSections outcome={outcome} />

        <LedgerClassificationRow segments={row.tags} />

        <LedgerMachineReadablePanel fields={machine} />

        <LedgerPrivacyConstraintsList />

        <LedgerCitationBlock title={row.title} slug={row.slug} publishedDate={dateStr} />

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
      'Consensus directives and public labels only; no transcript, attachments, or participant identifiers.',
    decisionClass: 'Operational corridor controls · civilian routing',
    sessionType: 'Facilitator-led squad session (private)',
    downstreamApplicability:
      'Movement coordinators, corridor stewards, humanitarian observers, and adjacent authorities citing public directives.',
  };

  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-3xl px-gutter py-10">
        <LedgerPublicRecordHeader
          title={demoTitle}
          statusLabel="PUBLISHED"
          slug={DEMO_PROPOSAL_ID}
        />

        <LedgerMissionPublicationBlock missionLine={missionLine} />

        <LedgerVerificationStrip
          slug={DEMO_PROPOSAL_ID}
          publishedLabel={DEMO_LEDGER_PUBLISHED}
          ledgerRef={`ledger:root=${DEMO_LEDGER_ROOT_SHORT}`}
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
        />

        <LedgerDetailFooterNav />
      </div>
    </div>
  );
}

const EMPTY_LEDGER_ROWS: LedgerProposalListRow[] = [];

function LedgerIndex({ unknownProposalId }: { unknownProposalId?: string } = {}) {
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
            <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
              Ledger
            </p>
            <h1
              className="mb-0 mt-2 flex flex-wrap items-end gap-x-3 gap-y-2 font-heading text-ink"
              style={{
                fontSize: 'clamp(1.85rem, 3.2vw, 2.65rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
              }}
            >
              <span className="min-w-0">SquadRidge</span>
              <span className="min-w-0">Ledger</span>
            </h1>
            <p className="mt-3 max-w-2xl font-sans text-body-lg font-normal leading-relaxed text-ink-secondary">
              A public archive of cross-border squad consensus proposals — citable, timestamped, and
              verified without exposing who sat in the room.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLedgerModalOpen(true)}
            className="shrink-0 self-start text-left font-sans text-sm font-medium text-teal-light underline-offset-4 hover:underline md:self-auto"
          >
            What is the SquadRidge Ledger?
          </button>
        </div>

        <p className="mt-6 max-w-[52rem] font-sans text-body-lg font-normal leading-relaxed text-ink-secondary">
          The ledger is a public archive of consensus proposals published from facilitator-led
          squads. It preserves the outcome of a session — not the private discussion — so others can
          cite, review, and build on what was agreed.
        </p>

        {unknownProposalId ? (
          <p className="mt-6 rounded-lg border border-amber/25 bg-amber/5 px-4 py-3 font-sans text-sm text-ink-secondary">
            No public entry for{' '}
            <span className="font-mono text-ink-muted">{unknownProposalId}</span> yet. Browse the
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
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem] transition-colors ${
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
                  className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem] transition-colors ${
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
                className="text-teal-light underline-offset-4 hover:underline"
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
                <table className="w-full min-w-[52rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Date
                      </th>
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Topic
                      </th>
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Summary
                      </th>
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        Tags
                      </th>
                      <th className="px-4 py-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                        <span className="sr-only">Action</span>
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
              <ul className="mt-4 list-none space-y-4 font-sans text-[0.875rem] leading-relaxed text-ink-secondary">
                <li>
                  <span className="font-medium text-ink-muted">Publishing.</span> When a squad
                  closes a session with consensus, the platform derives a compact proposal — not a
                  transcript — and anchors it to the ledger with a public timestamp.
                </li>
                <li>
                  <span className="font-medium text-ink-muted">Anonymous, verifiable.</span>{' '}
                  Identities stay off the record; cryptographic commitments and privacy-preserving
                  verification are designed to let readers trust the outcome without learning who
                  was in the room.
                </li>
                <li>
                  <span className="font-medium text-ink-muted">Time &amp; immutability.</span> Each
                  entry is anchored in time, so the version you cite is the version that was
                  attested, not silently edited later.
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
                Use this citation format for reports, footnotes, or policy annexes. The retrieval
                date should reflect when you accessed the ledger.
              </p>
              <div
                className="mt-4 rounded-xl border border-white/[0.12] bg-[#070b10]/80 p-4 shadow-inner"
                role="region"
                aria-labelledby="ledger-citation-label"
              >
                <p
                  id="ledger-citation-label"
                  className="mb-2 font-heading text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-subtle"
                >
                  Sample citation
                </p>
                <div id="ledger-citation-text" className="min-w-0 overflow-x-auto">
                  <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[0.7rem] leading-relaxed tracking-tight text-ink-muted">
                    {citation}
                  </pre>
                </div>
              </div>
              <div
                className="mt-6 flex flex-col gap-3 border-t border-white/[0.1] pt-6"
                role="group"
                aria-label="Copy citation to clipboard"
              >
                <button
                  type="button"
                  onClick={copyCitation}
                  aria-describedby="ledger-citation-text"
                  className="inline-flex min-h-[44px] w-full max-w-xs shrink-0 items-center justify-center rounded-xl border-2 border-white/[0.14] bg-[#0f1623] px-6 py-2.5 font-heading text-[0.85rem] font-semibold text-teal-light shadow-[0_2px_12px_rgba(0,0,0,0.35)] transition-[border-color,background-color] hover:border-teal/35 hover:bg-white/[0.04] sm:w-auto"
                >
                  {citeCopied ? 'Copied' : 'Copy citation'}
                </button>
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
                label="Request pilot access"
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

/** Uses {@link getSiteUrl} — set `VITE_SITE_URL` in production so citations show your public domain instead of localhost. */
function buildLedgerCitationLine(): string {
  const origin =
    getSiteUrl().replace(/\/$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    'https://squadridge.example';
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

function LedgerDemoRowDesktop({
  date,
  topic,
  summary,
  tags,
  href,
  demo,
}: {
  date: string;
  topic: string;
  summary: string;
  tags: readonly string[];
  href: string | null;
  demo: boolean;
}) {
  return (
    <tr className="border-b border-white/10 align-top">
      <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-ink-muted">{date}</td>
      <td className="min-w-[8rem] px-4 py-4 align-top font-medium break-words text-ink">{topic}</td>
      <td className="min-w-[12rem] px-4 py-4 align-top break-words text-ink-secondary">
        {summary}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded border border-[#2d3f55]/80 bg-[#0b0f14] px-2 py-0.5 text-[0.65rem] text-ink-muted"
            >
              {t}
            </span>
          ))}
        </div>
      </td>
      <td className="min-w-[12rem] px-4 py-4 align-top">
        <ul className="m-0 flex list-none flex-col gap-5 p-0" role="presentation">
          {demo ? (
            <li className="m-0 block p-0">
              <span className="inline-flex w-fit max-w-[11rem] rounded-md border border-amber/40 bg-amber/[0.12] px-2.5 py-1.5 font-sans text-[0.78rem] font-semibold leading-snug text-amber/95">
                Example entry
              </span>
            </li>
          ) : null}
          <li className="m-0 block p-0">
            {href ? (
              <Link
                to={href}
                className="inline-flex font-medium text-teal-light underline-offset-4 hover:underline"
              >
                Open proposal
              </Link>
            ) : (
              <span className="font-sans text-[0.82rem] font-medium text-ink-subtle">
                Preview only
              </span>
            )}
          </li>
        </ul>
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
}: {
  date: string;
  topic: string;
  summary: string;
  tags: readonly string[];
  href: string | null;
  demo: boolean;
}) {
  return (
    <article className="min-w-0 px-4 py-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <time className="font-mono text-xs text-ink-muted">{date}</time>
      </div>
      <h3 className="mt-2 break-words font-heading text-[1.05rem] font-bold text-ink">{topic}</h3>
      <p className="mt-2 break-words font-sans text-sm leading-relaxed text-ink-secondary">
        {summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded border border-[#2d3f55]/80 bg-[#0b0f14] px-2 py-0.5 text-[0.65rem] text-ink-muted"
          >
            {t}
          </span>
        ))}
      </div>
      <ul className="m-0 mt-4 flex list-none flex-col gap-5 pb-1 pl-0" role="presentation">
        {demo ? (
          <li className="m-0 block p-0">
            <span className="inline-flex w-fit max-w-full rounded-md border border-amber/40 bg-amber/[0.12] px-2.5 py-1.5 font-sans text-[0.78rem] font-semibold leading-snug text-amber/95">
              Example entry
            </span>
          </li>
        ) : null}
        <li className="m-0 block p-0">
          {href ? (
            <Link
              to={href}
              className="inline-block max-w-full break-words font-medium text-teal-light underline-offset-4 hover:underline"
            >
              Open proposal
            </Link>
          ) : (
            <span className="font-sans text-[0.82rem] font-medium text-ink-subtle">
              Preview only
            </span>
          )}
        </li>
      </ul>
    </article>
  );
}
