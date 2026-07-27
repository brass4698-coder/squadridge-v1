import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ActivityQueue } from '../../components/dashboard/ActivityQueue';
import { BarChartPanel } from '../../components/dashboard/BarChartPanel';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { OperationalPageHeader, StatusRail, useShellContext } from '../../components/shell';
import { RecordCardCompact, specimenToRecordCardProps } from '../../components/shared';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';
import { formatUpdated } from '../../data/governanceDashboard';
import { ledgerSpecimens } from '../../data/ledgerSpecimens';
import { useLedger } from '../../hooks/useLedger';
import { ledgerEntryToCard } from '../../lib/ledgerDisplay';
import { isV2MockDataEnabled } from '../../lib/v2MockMode';
import { appRoutes } from '../../lib/appRoutes';

/**
 * In-shell Released Records dashboard — public outcomes only.
 * Specimens are labeled illustrative and never inflate live KPI counts unless mock mode is on.
 */
export function AppLedgerDashboardPage() {
  const { setContext } = useShellContext();
  const { scopeLabel } = useDemoGovernance();
  const showDemoPortfolio = isV2MockDataEnabled();
  const [query, setQuery] = useState('');
  const { entries, loading } = useLedger(query);
  const liveCards = useMemo(() => entries.map(ledgerEntryToCard), [entries]);
  const samples = useMemo(
    () => ledgerSpecimens.map((s) => specimenToRecordCardProps(s, `/ledger/${s.id}`)),
    [],
  );
  const cards = liveCards.length > 0 ? liveCards : showDemoPortfolio ? samples : [];
  const hasLive = liveCards.length > 0;

  useEffect(() => {
    setContext({
      title: 'Released Records',
      roleLabel: 'Record viewer',
      matterLabel: scopeLabel,
      stateLabel: 'Public record',
      nextAction: hasLive ? 'Browse latest released records' : 'No public releases yet',
      trustNote:
        'Published records contain approved outcomes only; session transcripts and participant identities are never public.',
      lastUpdated: formatUpdated(),
      surface: 'record',
      primaryAction: { label: 'Browse public ledger', href: '/ledger' },
    });
  }, [setContext, scopeLabel, hasLive]);

  const categories = Object.entries(
    cards.reduce<Record<string, number>>((acc, c) => {
      const key = c.org || 'Outcome';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([label, value]) => ({ label: label.slice(0, 16), value }));

  return (
    <div data-surface="record">
      <OperationalPageHeader
        title="Released Records"
        summary="Browse approved outcomes, inspect record metadata, and verify integrity through published anchors."
        scope={scopeLabel}
        nextAction={
          hasLive
            ? 'Browse latest released records and verify anchors.'
            : 'Public register is empty until a deliberate release + publish.'
        }
        trustNote="Published records contain approved outcomes only; session transcripts and participant identities are never public."
        roleLabel="Record viewer"
        stateLabel="Public ledger"
        lastUpdated={formatUpdated()}
        primaryAction={{ label: 'Open public ledger', href: '/ledger' }}
      />
      <StatusRail
        items={[
          'Approved outcomes only',
          'Verification anchors',
          'No transcript published',
          'No auto-publish',
        ]}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Live public releases" value={liveCards.length} />
        <KpiCard label="Verification anchors" value={liveCards.length} />
        <KpiCard label="Categories (live)" value={hasLive ? categories.length : 0} />
        <KpiCard
          label="Illustrative specimens"
          value={samples.length}
          hint="Format demos on /ledger — not live pilots"
        />
      </div>

      {hasLive ? (
        <div className="mb-8">
          <BarChartPanel title="Outcome category distribution" data={categories} />
        </div>
      ) : null}

      <label className="mb-4 block max-w-md">
        <span className="sr-only">Search records</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search released records"
          className="focus-ring w-full border border-line bg-surface-elevated px-3 py-2.5 text-sm text-ink"
        />
      </label>

      {loading ? (
        <p className="text-sm text-ink-faint">Loading records…</p>
      ) : cards.length > 0 ? (
        <ul className="m-0 mb-8 grid list-none gap-3 p-0 md:grid-cols-2">
          {cards.slice(0, 6).map((card) => (
            <li key={card.id}>
              <RecordCardCompact {...card} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mb-8 rounded-lg border border-line bg-surface-sunken/40 p-5 text-sm leading-relaxed text-ink-secondary">
          <p className="m-0 font-medium text-ink">No live public releases yet</p>
          <p className="mt-2 mb-0">
            The public register stays empty until a facilitator releases an approved outcome and the
            organisation opts into publication. Browse labeled specimens on the public ledger for
            format only.
          </p>
          <Link to="/ledger" className="mt-4 inline-block text-brand">
            Open public ledger specimens →
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityQueue
          title="Integrity verification"
          items={[
            {
              id: 'v1',
              title: 'Anchor checks confirm released payload integrity',
              meta: 'Outsiders verify without seeing the session room.',
              href: '/ledger',
            },
            {
              id: 'v2',
              title: 'What never becomes public',
              meta: 'Transcripts, identities, and unapproved drafts stay off the ledger.',
              href: '/security#reviewers',
            },
          ]}
        />
        <aside className="rounded-lg border border-line bg-surface-sunken/40 p-5 text-sm leading-relaxed text-ink-secondary">
          <p className="m-0 font-medium text-ink">Public note</p>
          <p className="mt-2 mb-0">
            Illustrative specimens show approved outcome structure only. We reduce exposure by
            design and do not claim full platform zero-knowledge or Signal-grade E2E today.
          </p>
          <Link to={appRoutes.facilitator} className="mt-4 inline-block text-brand">
            Return to workspace
          </Link>
        </aside>
      </div>
    </div>
  );
}
