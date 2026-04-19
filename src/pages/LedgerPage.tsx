import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Home, List, MessageSquare, RotateCcw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { LedgerPageSkeletonCards, LedgerPageSkeletonRows } from '../components';
import {
  useLedgerProposalBySlug,
  useLedgerPublishedList,
  type LedgerProposalListRow,
} from '../hooks';
import { cn, DEMO_PROPOSAL_ID, DEMO_SESSION_ID, isSupabaseConfigured, type Json } from '../lib';

function parseConsensusItems(raw: Json): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string');
}

const DEMO_LEDGER_ROOT_SHORT = '0x7f3a…c91d';

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
  return (
    <aside
      className="vault-frost-subtle min-w-0 space-y-4 rounded-xl p-4 lg:sticky lg:top-24"
      aria-label="Ledger record metadata"
    >
      <h3 className="border-b border-white/10 pb-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Record
      </h3>
      <dl className="space-y-4 text-[0.75rem] leading-snug">
        <div>
          <dt className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-subtle">
            ledger:root
          </dt>
          <dd className="mt-1.5 break-all font-mono text-ink-secondary">
            {DEMO_LEDGER_ROOT_SHORT}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-subtle">
            session_ref
          </dt>
          <dd className="mt-1.5 break-all font-mono text-ink-secondary">{DEMO_SESSION_ID}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-subtle">
            anon_set
          </dt>
          <dd className="mt-1.5 break-all font-mono text-ink-secondary">Semaphore:v3-demo</dd>
        </div>
      </dl>
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
  return (
    <aside
      className="vault-frost-subtle min-w-0 space-y-4 rounded-xl p-4 lg:sticky lg:top-24"
      aria-label="Ledger record metadata"
    >
      <h3 className="border-b border-white/10 pb-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        Record
      </h3>
      <dl className="space-y-4 text-[0.75rem] leading-snug">
        <div>
          <dt className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-subtle">
            slug
          </dt>
          <dd className="mt-1.5 break-all font-mono text-ink-secondary">{slug}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-subtle">
            published
          </dt>
          <dd className="mt-1.5 font-mono text-ink-secondary">
            <time dateTime={dateStr !== '—' ? dateStr : undefined}>{dateStr}</time>
          </dd>
        </div>
        {ledgerRef ? (
          <div>
            <dt className="font-mono text-[0.62rem] uppercase tracking-wider text-ink-subtle">
              ledger_ref
            </dt>
            <dd className="mt-1.5 break-all font-mono text-[0.72rem] text-ink-secondary">
              {ledgerRef}
            </dd>
          </div>
        ) : null}
      </dl>
    </aside>
  );
}

function LedgerDetailFooterNav({ showDemoSessionLink }: { showDemoSessionLink?: boolean }) {
  const primary =
    'inline-flex items-center gap-2 font-sans text-sm text-teal-light underline-offset-4 transition-colors hover:underline';
  const muted =
    'inline-flex items-center gap-2 font-sans text-sm text-ink-muted underline-offset-4 transition-colors hover:text-ink-secondary hover:underline';
  return (
    <nav
      className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-8"
      aria-label="Ledger proposal navigation"
    >
      <Link to="/match" className={primary}>
        <RotateCcw className="size-4 shrink-0 text-teal-light/90" aria-hidden />
        Replay match flow
      </Link>
      {showDemoSessionLink ? (
        <Link to={`/session/${DEMO_SESSION_ID}`} className={primary}>
          <MessageSquare className="size-4 shrink-0 text-teal-light/90" aria-hidden />
          Back to squad session
        </Link>
      ) : null}
      <Link to="/ledger" className={muted}>
        <List className="size-4 shrink-0 text-ink-muted" aria-hidden />
        All ledger entries
      </Link>
      <Link to="/" className={muted}>
        <Home className="size-4 shrink-0 text-ink-muted" aria-hidden />
        Home
      </Link>
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
        <div className="relative z-[1] mx-auto w-full max-w-copy px-md py-16">
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
        <div className="relative z-[1] mx-auto w-full max-w-copy px-md py-10">
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
    tags: string[];
    published_at: string | null;
    ledger_ref: string | null;
  };
}) {
  const bullets = parseConsensusItems(row.consensus_items);
  const dateStr = row.published_at ? new Date(row.published_at).toISOString().slice(0, 10) : '—';

  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-md py-10">
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

            <h2 className="mt-8 break-words font-heading text-section-title font-bold text-ink">
              Consensus output
            </h2>
            <p className="mt-2 font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-ink-muted">
              Agreed protocols — verified for ledger
            </p>
            <ConsensusOrdersList items={bullets} />

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

function LedgerDemoProposalDetail() {
  return (
    <div className="relative min-h-dvh bg-navy pb-20 pt-4 md:pt-5">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-md py-10">
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

            <h2 className="mt-8 break-words font-heading text-section-title font-bold text-ink">
              Consensus output
            </h2>
            <p className="mt-2 font-mono text-[0.65rem] font-medium uppercase tracking-[0.12em] text-ink-muted">
              Agreed protocols — verified for ledger
            </p>
            <ConsensusOrdersList items={[...DEMO_CONSENSUS_LINES]} />

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

        <LedgerDetailFooterNav showDemoSessionLink />
      </div>
    </div>
  );
}

const FILTER_LABELS = ['Region', 'Topic', 'Status'] as const;

const EMPTY_LEDGER_ROWS: LedgerProposalListRow[] = [];

type LedgerDisplayRow = {
  key: string;
  date: string;
  topic: string;
  summary: string;
  tags: readonly string[];
  href: string | null;
  demo: boolean;
};

function getLedgerDisplayRows(
  configured: boolean,
  isPending: boolean,
  isError: boolean,
  dbRows: LedgerProposalListRow[],
): LedgerDisplayRow[] {
  const showDb = configured && !isError && dbRows.length > 0;
  if (configured && isPending) return [];
  if (showDb) {
    return [
      ...dbRows.map((row) => ({
        key: row.id,
        date: row.published_at ? new Date(row.published_at).toISOString().slice(0, 10) : '—',
        topic: row.title,
        summary: row.summary,
        tags: row.tags,
        href: `/ledger/${row.slug}`,
        demo: row.slug === DEMO_PROPOSAL_ID,
      })),
      {
        key: 'preview-watershed',
        date: '2026-02-02',
        topic: 'Watershed governance',
        summary:
          'Illustrative entry: shared monitoring commitments across a transboundary basin (preview).',
        tags: ['Water', 'Governance'],
        href: null,
        demo: true,
      },
    ];
  }
  return [
    {
      key: 'demo-climate',
      date: '2026-03-18',
      topic: 'Climate & corridors',
      summary:
        'Example proposal from a cross-border climate squad: coordinated civilian movement and de-escalation markers.',
      tags: ['Climate', 'Displacement'],
      href: `/ledger/${DEMO_PROPOSAL_ID}`,
      demo: true,
    },
    {
      key: 'preview-watershed-offline',
      date: '2026-02-02',
      topic: 'Watershed governance',
      summary:
        'Illustrative entry: shared monitoring commitments across a transboundary basin (preview).',
      tags: ['Water', 'Governance'],
      href: null,
      demo: true,
    },
  ];
}

function LedgerGraphEntries({ rows }: { rows: LedgerDisplayRow[] }) {
  return (
    <ul className="space-y-0 px-1 py-2">
      {rows.map((row, i) => (
        <li key={row.key} className="relative flex gap-4">
          <div className="flex w-8 shrink-0 flex-col items-center pt-1">
            <span
              className="size-3 rounded-full border-2 border-teal/45 bg-teal/15 shadow-[0_0_12px_rgba(45,212,191,0.25)]"
              aria-hidden
            />
            {i < rows.length - 1 ? (
              <span
                className="mt-1 min-h-[3rem] w-px flex-1 bg-gradient-to-b from-teal/35 via-teal/15 to-transparent"
                aria-hidden
              />
            ) : null}
          </div>
          <article className="vault-frost-subtle mb-4 min-w-0 flex-1 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <time className="font-mono text-[0.7rem] tracking-tight text-ink-muted">
                {row.date}
              </time>
              {row.demo ? (
                <span className="rounded border border-amber/30 bg-amber/10 px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-wider text-amber/95">
                  Demo
                </span>
              ) : null}
            </div>
            <h3 className="mt-2 break-words font-heading text-[1.05rem] font-bold text-ink">
              {row.topic}
            </h3>
            <p className="mt-2 break-words font-sans text-sm leading-relaxed text-ink-secondary">
              {row.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {row.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[0.62rem] tracking-tight text-ink-muted"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4">
              {row.href ? (
                <Link
                  to={row.href}
                  className="font-medium text-teal-light underline-offset-4 hover:underline"
                >
                  View proposal →
                </Link>
              ) : (
                <span className="font-sans text-[0.8rem] text-ink-subtle">Preview only</span>
              )}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

function LedgerIndex({ unknownProposalId }: { unknownProposalId?: string } = {}) {
  const listQuery = useLedgerPublishedList();
  const [ledgerView, setLedgerView] = useState<'list' | 'graph'>('list');
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [citeCopied, setCiteCopied] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const modalTitleId = useId();
  const modalDescId = useId();

  const citation = useLedgerCitation();
  const configured = isSupabaseConfigured();
  const dbRows = listQuery.data ?? EMPTY_LEDGER_ROWS;
  const showDb = configured && !listQuery.isError && dbRows.length > 0;
  const displayRows = useMemo(
    () => getLedgerDisplayRows(configured, listQuery.isPending, listQuery.isError, dbRows),
    [configured, listQuery.isPending, listQuery.isError, dbRows],
  );

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
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-md py-8 md:py-10">
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
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
          role="toolbar"
          aria-label="Ledger tools"
        >
          <div
            className="flex flex-wrap items-center gap-2"
            aria-label="Ledger filters (coming soon)"
          >
            {FILTER_LABELS.map((label) => (
              <button
                key={label}
                type="button"
                disabled
                title="Coming soon"
                aria-disabled="true"
                className="cursor-not-allowed rounded-full border border-[#2d3f55]/90 bg-[#0d121c]/80 px-3 py-1.5 font-heading text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-ink-subtle opacity-80"
              >
                {label}
              </button>
            ))}
            <span className="font-sans text-xs text-ink-subtle">
              Filters ship with search in a later release.
            </span>
          </div>
          <div
            className="vault-frost-subtle flex items-center gap-0.5 rounded-xl p-1"
            role="group"
            aria-label="Ledger view mode"
          >
            <button
              type="button"
              onClick={() => setLedgerView('list')}
              aria-pressed={ledgerView === 'list'}
              className={cn(
                'rounded-lg px-3 py-1.5 font-mono text-[0.68rem] font-medium uppercase tracking-wider transition-colors',
                ledgerView === 'list'
                  ? 'bg-teal/20 text-teal-light'
                  : 'text-ink-muted hover:text-ink-secondary',
              )}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setLedgerView('graph')}
              aria-pressed={ledgerView === 'graph'}
              className={cn(
                'rounded-lg px-3 py-1.5 font-mono text-[0.68rem] font-medium uppercase tracking-wider transition-colors',
                ledgerView === 'graph'
                  ? 'bg-teal/20 text-teal-light'
                  : 'text-ink-muted hover:text-ink-secondary',
              )}
            >
              Graph
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_min(22rem,100%)] lg:items-start lg:gap-12">
          <div className="min-w-0">
            <h2 className="font-heading text-section-title font-bold text-ink">Entries</h2>
            <p className="mt-1 font-sans text-sm text-ink-muted">
              Published proposals appear here as squads finalize consensus.
            </p>

            <div className="vault-frost mt-6 overflow-hidden">
              {ledgerView === 'graph' ? (
                <>
                  {configured && listQuery.isPending ? (
                    <div className="p-4">
                      <LedgerPageSkeletonCards count={3} />
                    </div>
                  ) : (
                    <LedgerGraphEntries rows={displayRows} />
                  )}
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Link
                to="/intent"
                className="btn-primary inline-flex min-h-[44px] w-full max-w-none items-center justify-center !rounded-[1.75rem] px-6 py-2.5 text-center font-heading text-[0.95rem] font-semibold sm:w-fit sm:max-w-max"
              >
                Form a squad to publish your own proposal
              </Link>
              <Link
                to="/"
                className="font-sans text-sm text-ink-muted underline-offset-4 hover:text-ink-secondary hover:underline"
              >
                Back to home
              </Link>
            </div>
          </div>

          <aside className="min-w-0 space-y-8 lg:sticky lg:top-24">
            <section className="vault-frost p-5">
              <h2 className="font-heading text-[0.95rem] font-bold text-ink">How entries work</h2>
              <ul className="mt-4 list-none space-y-4 font-sans text-[0.875rem] leading-relaxed text-ink-secondary">
                <li>
                  <span className="font-medium text-ink-muted">Publishing.</span> When a squad
                  closes a session with consensus, the platform derives a compact proposal — not a
                  transcript — and commits it to the ledger with a public timestamp.
                </li>
                <li>
                  <span className="font-medium text-ink-muted">Anonymous, verifiable.</span>{' '}
                  Identities stay off the record; zero-knowledge proofs and cryptographic
                  commitments let readers trust the outcome without learning who was in the room.
                </li>
                <li>
                  <span className="font-medium text-ink-muted">Time &amp; immutability.</span> Each
                  entry is anchored in time; the content you cite is the content that was attested —
                  not silently edited later.
                </li>
              </ul>
            </section>

            <section className="vault-frost p-5">
              <h2 className="font-heading text-[0.95rem] font-bold text-ink">How to cite this</h2>
              <p className="mt-2 font-sans text-[0.8125rem] leading-relaxed text-ink-muted">
                Use this format for reports, footnotes, or policy annexes. Date reflects when you
                retrieved the page.
              </p>
              <pre className="vault-frost-subtle mt-3 overflow-x-auto rounded-lg p-3 font-mono text-[0.7rem] leading-relaxed tracking-tight text-ink-muted">
                {citation}
              </pre>
              <button
                type="button"
                onClick={copyCitation}
                className="mt-3 inline-flex min-h-[40px] items-center rounded-lg border border-[#2d3f55] bg-transparent px-4 py-2 font-heading text-[0.8rem] font-medium text-teal-light transition-colors hover:border-teal/40 hover:bg-white/[0.02]"
              >
                {citeCopied ? 'Copied' : 'Copy citation'}
              </button>
            </section>
          </aside>
        </div>
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
                The Ledger is the public record of private dialogue: a place where squads leave a
                durable, citable summary of what they agreed—without exposing who was there or every
                word that was said.
              </p>
              <p className="mb-0">
                It exists so journalists, donors, and institutions can point to outcomes that matter
                across borders while participants stay protected. Each line is tied to verification
                and time, not to dossiers.
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

function useLedgerCitation(): string {
  const [line, setLine] = useState(
    () =>
      `SquadRidge Ledger. “Civilian protection protocols — displacement corridor” (example entry). Retrieved ${todayIso()}, from ${typeof window !== 'undefined' ? window.location.origin : 'https://squadridge.example'}/ledger.`,
  );
  useEffect(() => {
    setLine(
      `SquadRidge Ledger. “Civilian protection protocols — displacement corridor” (example entry). Retrieved ${todayIso()}, from ${window.location.origin}/ledger.`,
    );
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
      <td className="min-w-[9.5rem] whitespace-nowrap px-4 py-4 align-top">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {demo ? (
            <span className="shrink-0 rounded border border-amber/30 bg-amber/10 px-1.5 py-0.5 font-heading text-[0.6rem] font-semibold uppercase tracking-wider text-amber/95">
              Demo data
            </span>
          ) : null}
          {href ? (
            <Link
              to={href}
              className="shrink-0 font-medium text-teal-light underline-offset-4 hover:underline"
            >
              View proposal
            </Link>
          ) : (
            <button
              type="button"
              disabled
              title="Coming soon"
              className="cursor-not-allowed shrink-0 font-medium text-ink-subtle opacity-60"
            >
              View proposal
            </button>
          )}
        </div>
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
        {demo ? (
          <span className="rounded border border-amber/30 bg-amber/10 px-1.5 py-0.5 font-heading text-[0.6rem] font-semibold uppercase tracking-wider text-amber/95">
            Demo data
          </span>
        ) : null}
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
      <div className="mt-4 min-w-0 pb-1">
        {href ? (
          <Link
            to={href}
            className="inline-block max-w-full break-words font-medium text-teal-light underline-offset-4 hover:underline"
          >
            View proposal →
          </Link>
        ) : (
          <button
            type="button"
            disabled
            title="Coming soon"
            className="cursor-not-allowed text-ink-subtle opacity-60"
          >
            View proposal
          </button>
        )}
      </div>
    </article>
  );
}
