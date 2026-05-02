import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { CardEyebrow, CTAGroup, PageHero, SectionBand, SurfaceCard } from '../components';
import { StatusDot } from '../components/ui/StatusDot';
import { areInvestorFixturesEnabled } from '../lib';

/**
 * DialoguesPage — unified hub for live, upcoming, and archived sealed rooms.
 *
 * Phase 1 ships a public-safe representative directory with fixture-backed
 * rows. Public visitors see only room state, category, count bands, and
 * sealed-room constraints. Room titles, facilitators, exact activity times,
 * and participant-mode breakdowns stay out of the public surface.
 *
 * Phase 3 replaces the fixtures with `useSquad` / `useLedgerProposals`
 * reads (RLS-respecting) and a new `useDialogues()` aggregator.
 */

type DialogueStatus = 'live' | 'upcoming' | 'archived';

type DialogueRow = {
  id: string;
  status: DialogueStatus;
  category: string;
  participantCount: number;
  releaseState: string;
  /** Cross-border? Used as a small badge. */
  crossBorder: boolean;
};

const SAMPLE_DIALOGUES: ReadonlyArray<DialogueRow> = [
  {
    id: 'reconciliation-cohort-04',
    status: 'live',
    category: 'Reconciliation cohort',
    participantCount: 8,
    releaseState: 'No public record yet',
    crossBorder: true,
  },
  {
    id: 'workplace-harm-q2',
    status: 'live',
    category: 'Workplace mediation cohort',
    participantCount: 9,
    releaseState: 'No public record yet',
    crossBorder: false,
  },
  {
    id: 'veterans-circle-may',
    status: 'upcoming',
    category: 'Veterans dialogue intake',
    participantCount: 0,
    releaseState: 'Intake not opened',
    crossBorder: true,
  },
  {
    id: 'funder-evaluation-2025-04',
    status: 'archived',
    category: 'Funder evaluation cohort',
    participantCount: 8,
    releaseState: 'Closed; public record optional',
    crossBorder: false,
  },
  {
    id: 'cross-border-mediators-2025-03',
    status: 'archived',
    category: 'Cross-border mediation cohort',
    participantCount: 8,
    releaseState: 'Closed; public record optional',
    crossBorder: true,
  },
];

const TABS: ReadonlyArray<{ key: DialogueStatus; label: string }> = [
  { key: 'live', label: 'Live' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'archived', label: 'Archived' },
];

const STATUS_LABEL: Record<DialogueStatus, string> = {
  live: 'Sample live state',
  upcoming: 'Sample upcoming state',
  archived: 'Sample archived state',
};

const STATUS_DOT_STATE: Record<DialogueStatus, 'live' | 'stale' | 'empty'> = {
  live: 'live',
  upcoming: 'stale',
  archived: 'empty',
};

function PublicSafeRow({ row }: { row: DialogueRow }) {
  return (
    <SurfaceCard as="li" className="list-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <StatusDot state={STATUS_DOT_STATE[row.status]} label={STATUS_LABEL[row.status]} />
          {row.crossBorder ? (
            <span className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
              Cross-border
            </span>
          ) : null}
        </div>
        <Lock aria-hidden className="size-3.5 text-ink-faint" />
      </div>
      <p className="mt-4 font-sans text-[0.95rem] font-semibold text-ink">{row.category}</p>
      <p className="mt-1 font-sans text-[0.82rem] leading-relaxed text-ink-faint">
        {row.participantCount > 0
          ? `${row.participantCount} participants counted in this representative room state.`
          : 'Participant count is not public before intake opens.'}
      </p>
      <dl className="mt-4 grid gap-2 border-t border-line pt-3 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-ink-faint">
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt>Public detail</dt>
          <dd className="text-ink-secondary">State + count only</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <dt>Release</dt>
          <dd className="text-ink-secondary">{row.releaseState}</dd>
        </div>
      </dl>
    </SurfaceCard>
  );
}

function DialogueStatusSummary({ counts }: { counts: Record<DialogueStatus, number> }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {TABS.map((tab) => (
        <li
          key={tab.key}
          className="list-none rounded-md border border-line bg-surface-elevated px-4 py-3"
        >
          <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {tab.label}
          </p>
          <p className="mt-2 font-mono text-[1.45rem] font-semibold leading-none tabular-nums text-ink">
            {counts[tab.key]}
          </p>
          <p className="mt-1 font-sans text-[0.78rem] leading-relaxed text-ink-faint">
            Representative {tab.key} rooms
          </p>
        </li>
      ))}
    </ul>
  );
}

function PublicMetadataNotice() {
  return (
    <SurfaceCard as="aside" className="border-brand/35 bg-brand-soft">
      <CardEyebrow tone="brand">Public metadata policy</CardEyebrow>
      <p className="mt-2 font-sans text-[0.9rem] leading-relaxed text-ink-secondary">
        This public page shows representative room states and aggregate counts only. Room titles,
        facilitator names, exact activity timestamps, and participant-mode breakdowns remain sealed
        unless an approved public record is released.
      </p>
    </SurfaceCard>
  );
}

function MemberAccessCallout() {
  return (
    <SurfaceCard as="aside">
      <CardEyebrow>Member access</CardEyebrow>
      <p className="mt-2 font-sans text-[0.92rem] leading-relaxed text-ink-secondary">
        Verified participants and facilitators use authenticated room links for room-specific
        detail. The public directory does not expose private room metadata.
      </p>
      <CTAGroup className="mt-4">
        <Link
          to="/sign-in"
          className="focus-ring btn-primary inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 font-sans text-[0.9rem] font-semibold no-underline"
        >
          Sign in
        </Link>
        <Link
          to="/invite"
          className="focus-ring btn-secondary inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 font-sans text-[0.9rem] font-medium no-underline"
        >
          Have an invite?
          <ArrowRight aria-hidden className="ml-1.5 size-4" />
        </Link>
      </CTAGroup>
    </SurfaceCard>
  );
}

function ReleasedRecordCallout() {
  return (
    <SurfaceCard as="aside" className="border-l-[3px] border-l-brand">
      <CardEyebrow tone="brand">Public record boundary</CardEyebrow>
      <p className="mt-2 font-sans text-[0.92rem] leading-relaxed text-ink-secondary">
        Archived rooms are not transcripts. Only facilitator-approved anonymous outcomes can appear
        in the public ledger.
      </p>
      <Link
        to="/ledger"
        className="focus-ring mt-4 inline-flex min-h-[44px] items-center gap-1.5 py-1 font-sans text-[0.85rem] font-medium text-brand-hover underline-offset-4 transition-colors hover:text-ink hover:underline"
      >
        Browse released records
        <ArrowRight aria-hidden className="size-3.5" />
      </Link>
    </SurfaceCard>
  );
}

function FixtureNotice() {
  return (
    <SurfaceCard className="border-amber/30 bg-amber/[0.06]">
      <p className="font-sans text-[0.9rem] leading-relaxed text-amber-light">
        Dialogue rows are not visible in this build. Enable{' '}
        <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-amber">
          VITE_ENABLE_INVESTOR_FIXTURES
        </code>{' '}
        to view the representative public directory shape.
      </p>
    </SurfaceCard>
  );
}

function EmptyState({ tab }: { tab: DialogueStatus }) {
  return (
    <SurfaceCard className="p-6">
      <StatusDot state="empty">No {tab} sample rooms</StatusDot>
      <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-ink-secondary">
        There are no representative {tab} room states to show right now.
      </p>
    </SurfaceCard>
  );
}

export function DialoguesPage() {
  const showFixtures = areInvestorFixturesEnabled();
  const [tab, setTab] = useState<DialogueStatus>('live');

  const counts = useMemo(() => {
    const c: Record<DialogueStatus, number> = { live: 0, upcoming: 0, archived: 0 };
    for (const row of SAMPLE_DIALOGUES) c[row.status] += 1;
    return c;
  }, []);

  const visibleRows = useMemo(() => SAMPLE_DIALOGUES.filter((d) => d.status === tab), [tab]);

  return (
    <>
      <SectionBand tone="navy">
        <PageHero
          eyebrow="Dialogues"
          title="Live, upcoming, and archived sealed rooms."
          titleClassName="text-[clamp(1.6rem,2.4vw,2.1rem)]"
        >
          <p>
            Every dialogue is a sealed cohort with explicit boundaries and an approved release path.
            This public view is a representative directory: it shows counts and room states, not
            private room titles, facilitator names, exact timestamps, or participant identity modes.
          </p>
        </PageHero>
      </SectionBand>

      <SectionBand tone="black">
        <div className="flex min-w-0 flex-col gap-8">
          <PublicMetadataNotice />
          <DialogueStatusSummary counts={counts} />
          <div
            role="tablist"
            aria-label="Dialogue status"
            className="flex flex-wrap gap-1 border-b border-line"
          >
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  className={`-mb-px inline-flex min-h-[44px] items-center gap-2 border-b-2 px-3.5 py-2 font-sans text-[0.88rem] font-medium transition-colors ${
                    active
                      ? 'border-brand text-ink'
                      : 'border-transparent text-ink-faint hover:text-ink'
                  }`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  <span className="font-mono text-[0.7rem] tabular-nums text-ink-subtle">
                    {counts[t.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {!showFixtures ? (
            <FixtureNotice />
          ) : visibleRows.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {visibleRows.map((row) => (
                <PublicSafeRow key={row.id} row={row} />
              ))}
            </ul>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <MemberAccessCallout />
            <ReleasedRecordCallout />
          </div>
        </div>
      </SectionBand>
    </>
  );
}
