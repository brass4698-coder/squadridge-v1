import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Check, ClipboardPen, List, Shield } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { LedgerPageSkeletonCards, LedgerPageSkeletonRows, PrimaryCTA } from '../components';
import {
  useLedgerProposalBySlug,
  useLedgerPublishedList,
  type LedgerProposalListRow,
} from '../hooks';
import {
  DEMO_PROPOSAL_ID,
  DEMO_SESSION_ID,
  getSiteUrl,
  isSupabaseConfigured,
  type Json,
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

function WhyPublishOutcomeNote() {
  return (
    <p className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 font-sans text-[0.8rem] leading-relaxed text-ink-secondary">
      <span className="font-medium text-ink-muted">Why publish the outcome, not the room.</span> The
      session stays private; only the citable outcome agreed for public release appears here, so
      partners and downstream actors can rely on a durable decision without inheriting chat or
      attribution risk.
    </p>
  );
}

function TrustProvenanceGrid({ rows }: { rows: readonly { label: string; value: string }[] }) {
  return (
    <div
      className="divide-y divide-white/[0.1] rounded-lg border border-white/[0.12] bg-[#070b12]/60"
      role="list"
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-col gap-2 px-3 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
          role="listitem"
        >
          <span className="shrink-0 pt-0.5 font-sans text-[0.72rem] font-semibold tracking-wide text-ink-muted">
            {row.label}
          </span>
          <span className="min-w-0 break-all font-mono text-[0.72rem] leading-relaxed text-ink-secondary sm:max-w-[min(100%,24rem)] sm:text-right">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function ConsensusOrdersList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="not-prose mt-5 space-y-0">
      {items.map((line, i) => (
        <li
          key={i}
          className="flex gap-3.5 border-t border-white/[0.07] py-4 first:border-t-0 first:pt-0"
        >
          <div className="relative mt-0.5 flex size-7 shrink-0 items-center justify-center">
            <span className="ledger-consensus-verify-ring" aria-hidden />
            <Check
              className="relative z-[1] size-4 text-cajun-light drop-shadow-[0_0_10px_rgba(234,88,12,0.45)]"
              strokeWidth={2.5}
              aria-hidden
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
              Order {(i + 1).toString().padStart(2, '0')}
            </p>
            <p className="mt-1.5 font-sans text-body-lg font-normal leading-relaxed text-ink-secondary [word-break:break-word]">
              {line}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function LedgerMetadataSidebarDemo() {
  const rows = [
    { label: 'Public slug', value: DEMO_PROPOSAL_ID },
    { label: 'Published', value: DEMO_LEDGER_PUBLISHED },
    { label: 'Ledger reference', value: `ledger:root=${DEMO_LEDGER_ROOT_SHORT}` },
    { label: 'Session reference', value: DEMO_SESSION_ID },
    { label: 'Verification set', value: 'Semaphore:v3-demo' },
  ] as const;

  return (
    <aside
      className="vault-frost-subtle min-w-0 space-y-3 rounded-xl border border-white/[0.06] p-4 lg:sticky lg:top-24"
      aria-label="Trust and provenance for this ledger record"
    >
      <div>
        <h3 className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-teal/85">
          Trust &amp; provenance
        </h3>
        <p className="mt-2 font-sans text-[0.75rem] leading-relaxed text-ink-muted">
          What you can verify without exposing who was in the room. Demo values mirror how a live
          record is labeled.
        </p>
      </div>
      <TrustProvenanceGrid rows={rows} />
    </aside>
  );
}

function LedgerMetadataSidebarDb({
  slug,
  publishedAt,
  ledgerRef,
}: {
  slug: string;
  publishedAt: string | null;
  ledgerRef: string | null;
}) {
  const dateStr = publishedAt ? new Date(publishedAt).toISOString().slice(0, 10) : '—';
  const rows = [
    { label: 'Public slug', value: slug },
    {
      label: 'Published',
      value: dateStr,
    },
    {
      label: 'Ledger reference',
      value: ledgerRef ?? '—',
    },
  ] as const;

  return (
    <aside
      className="vault-frost-subtle min-w-0 space-y-3 rounded-xl border border-white/[0.06] p-4 lg:sticky lg:top-24"
      aria-label="Trust and provenance for this ledger record"
    >
      <div>
        <h3 className="font-heading text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-teal/85">
          Trust &amp; provenance
        </h3>
        <p className="mt-2 font-sans text-[0.75rem] leading-relaxed text-ink-muted">
          What you can verify without exposing who was in the room: identifiers, publication time,
          and how the entry connects to the ledger.
        </p>
      </div>
      <TrustProvenanceGrid rows={rows} />
    </aside>
  );
}

function LedgerDetailFooterNav() {
  const primary =
    'inline-flex items-center gap-2 font-sans text-sm text-teal-light underline-offset-4 transition-colors hover:underline';
  const secondary =
    'inline-flex items-center gap-2 font-sans text-sm text-ink-muted underline-offset-4 transition-colors hover:text-ink-secondary hover:underline';
  return (
    <nav
      className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-8"
      aria-label="Ledger proposal navigation"
    >
      <Link to="/security" className={primary}>
        <Shield className="size-4 shrink-0 text-teal-light/90" aria-hidden />
        Review security model
      </Link>
      <Link to="/ledger" className={secondary}>
        <List className="size-4 shrink-0 text-ink-muted" aria-hidden />
        All ledger entries
      </Link>
      <a href="/#waitlist" className={primary}>
        <ClipboardPen className="size-4 shrink-0 text-teal-light/90" aria-hidden />
        Request pilot access
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
  };
}) {
  const bullets = parseConsensusItems(row.consensus_items);
  const outcome = parseOutcomeExtras(row.outcome_extras);
  const dateStr = row.published_at ? new Date(row.published_at).toISOString().slice(0, 10) : '—';

  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-gutter py-10">
        <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
          Ledger
        </p>
        <p className="mt-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-amber/90">
          Published
        </p>
        <h1
          className="mb-0 mt-2 font-heading text-ink"
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          {row.title}
        </h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">
          Proposal ·{' '}
          <span className="font-mono text-[0.8rem] tracking-tight text-ink-secondary">
            {row.slug}
          </span>{' '}
          ·{' '}
          <time
            className="font-mono text-[0.8rem] tracking-tight text-ink-muted"
            dateTime={dateStr}
          >
            {dateStr}
          </time>
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,17.5rem)] lg:items-start">
          <div className="vault-frost min-w-0 overflow-x-auto p-6">
            <p className="font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
              {row.summary}
            </p>

            <WhyPublishOutcomeNote />

            <h2 className="mt-8 break-words font-heading text-section-title font-bold text-ink">
              Published protocol set
            </h2>
            <p className="mt-2 font-sans text-[0.8rem] font-medium leading-snug text-ink-muted">
              Measures approved for public release.
            </p>
            <ConsensusOrdersList items={bullets} />

            <LedgerOutcomeRecordSections outcome={outcome} />

            <div className="mt-8 flex flex-wrap gap-2">
              {row.tags.map((t) => (
                <span
                  key={t}
                  className="rounded border border-[#2d3f55]/80 bg-[#0b0f14] px-2 py-0.5 text-[0.65rem] text-ink-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <LedgerMetadataSidebarDb
            slug={row.slug}
            publishedAt={row.published_at}
            ledgerRef={row.ledger_ref}
          />
        </div>

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
      <p className="mt-6 font-sans text-[0.8rem] text-ink-muted">
        No private outcome addenda stored for this proposal — published protocol set only.
      </p>
    );
  }
  return (
    <div className="mt-8 space-y-6 border-t border-white/[0.08] pt-8">
      <h2 className="break-words font-heading text-section-title font-bold text-ink">
        Session outcome (structured)
      </h2>
      {outcome.unresolved && outcome.unresolved.length > 0 ? (
        <div>
          <h3 className="font-heading text-[0.8rem] font-semibold uppercase tracking-wide text-amber/90">
            Unresolved
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-sans text-[0.88rem] text-ink-secondary">
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
          <ul className="mt-2 list-disc space-y-1 pl-5 font-sans text-[0.88rem] text-ink-secondary">
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
      <p className="mt-2 font-sans text-[0.75rem] text-ink-subtle">
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded border border-white/[0.1] bg-[#0b0f14] px-3 py-1.5 text-ink-muted"
        >
          Export / share (coming soon)
        </button>
      </p>
    </div>
  );
}

function LedgerDemoProposalDetail() {
  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-gutter py-10">
        <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
          Ledger
        </p>
        <p className="mt-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-amber/90">
          Investor demo
        </p>
        <h1
          className="mb-0 mt-2 font-heading text-ink"
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Civilian protection protocols — displacement corridor
        </h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">
          Proposal ID ·{' '}
          <span className="font-mono text-[0.8rem] tracking-tight text-ink-secondary">
            {DEMO_PROPOSAL_ID}
          </span>
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,17.5rem)] lg:items-start">
          <div className="vault-frost min-w-0 overflow-x-auto p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded border border-teal-500/40 bg-teal-500/10 px-2 py-0.5 font-heading text-[0.65rem] font-semibold uppercase tracking-wider text-teal-light">
                Published
              </span>
              <span className="font-sans text-xs text-ink-muted">
                ZK-attested summary · demo fixture
              </span>
            </div>

            <div className="mt-4 min-w-0 space-y-2 font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
              <p className="mb-0 break-words">
                <span className="font-medium text-ink-muted">Objective.</span> Reduce civilian harm
                and miscoordination during corridor movements in a mixed-control zone.
              </p>
              <p className="mb-0 break-words">
                <span className="font-medium text-ink-muted">Scope.</span> Temporary displacement
                corridors where armed actors agree to time-boxed movement windows for civilians.
              </p>
            </div>

            <WhyPublishOutcomeNote />

            <h2 className="mt-8 break-words font-heading text-section-title font-bold text-ink">
              Published protocol set
            </h2>
            <p className="mt-2 font-sans text-[0.8rem] font-medium leading-snug text-ink-muted">
              Measures approved for public release.
            </p>
            <ConsensusOrdersList items={[...DEMO_CONSENSUS_LINES]} />

            <LedgerOutcomeRecordSections outcome={DEMO_OUTCOME} />

            <p className="vault-frost-subtle mt-8 rounded-lg border border-dashed border-white/10 p-4 font-sans text-[0.8rem] leading-relaxed text-ink-muted">
              <span className="block">
                <span className="font-medium text-ink-subtle">Impact note.</span> These rules are
                designed to lower the risk of cross-fire, corridor abuse, and last-minute rerouting
                that leaves families exposed in transit.
              </span>
            </p>
          </div>

          <LedgerMetadataSidebarDemo />
        </div>

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
  const dbRows = listQuery.data ?? EMPTY_LEDGER_ROWS;
  const showDb = configured && !listQuery.isError && dbRows.length > 0;

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

        <p
          className="mt-6 rounded-lg border border-white/[0.08] bg-white/[0.02] px-4 py-3 font-sans text-sm leading-relaxed text-ink-muted"
          role="status"
        >
          Search and filters are coming soon.
        </p>

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
