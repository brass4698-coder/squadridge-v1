import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ActivityQueue } from '../../components/dashboard/ActivityQueue';
import { FunnelChartPanel } from '../../components/dashboard/FunnelChartPanel';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { OperationalPageHeader, StatusRail, useShellContext } from '../../components/shell';
import { appRoutes } from '../../lib/appRoutes';
import { useDemoGovernance } from '../../demo/DemoGovernanceContext';
import { formatUpdated } from '../../data/governanceDashboard';

/**
 * Release gate queue — threshold surface for approvals.
 */
export function ReleaseGatePage() {
  const { setContext } = useShellContext();
  const { matters, scopeLabel } = useDemoGovernance();
  const queue = matters.filter(
    (m) => m.stage === 'approvals' || m.draft_status === 'in_review' || m.draft_status === 'draft',
  );

  useEffect(() => {
    setContext({
      title: 'Release Gate',
      roleLabel: 'Facilitator',
      matterLabel: scopeLabel,
      stateLabel: 'Awaiting final approvals',
      nextAction:
        queue.length > 0
          ? 'Review comments and approve release drafts'
          : 'No drafts currently in gate',
      trustNote:
        'Only approved outcome text may leave the room. No auto-publish. Session transcripts never become public.',
      lastUpdated: formatUpdated(),
      surface: 'gate',
      primaryAction: { label: 'Back to overview', href: appRoutes.facilitator },
    });
  }, [setContext, scopeLabel, queue.length]);

  return (
    <div data-surface="gate">
      <OperationalPageHeader
        title="Release Gate"
        summary="Facilitator-governed release: approve outcome drafts before anything becomes a public or internal record."
        scope={scopeLabel}
        nextAction={
          queue.length > 0
            ? `Review ${queue.length} draft${queue.length === 1 ? '' : 's'} in the gate.`
            : 'No drafts currently awaiting release.'
        }
        trustNote="Only approved outcome text may leave the room. No auto-publish. Session transcripts never become public."
        roleLabel="Facilitator"
        stateLabel="Gate"
        lastUpdated={formatUpdated()}
      />
      <StatusRail
        items={[
          'Facilitator-governed release',
          'Approved outcomes only',
          'No auto-publish',
          'No transcript published',
        ]}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <KpiCard label="In gate" value={queue.length} />
        <KpiCard
          label="Approvals incomplete"
          value={queue.filter((m) => m.approvals_complete < m.approvals_required).length}
        />
        <KpiCard
          label="Public release intended"
          value={queue.filter((m) => m.release_mode === 'public').length}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActivityQueue
          title="Drafts awaiting approval"
          items={queue.map((m) => ({
            id: m.matter_id,
            title: m.label,
            meta: `${m.approvals_complete}/${m.approvals_required} approvals · ${m.release_mode} · ${m.sensitivity_level} sensitivity`,
            href: appRoutes.sessions,
          }))}
        />
        <FunnelChartPanel
          title="Gate progression"
          description="Draft → in review → approvals complete → released"
          steps={[
            { label: 'Draft', value: matters.filter((m) => m.draft_status === 'draft').length },
            {
              label: 'In review',
              value: matters.filter((m) => m.draft_status === 'in_review').length,
            },
            {
              label: 'Approved',
              value: matters.filter((m) => m.draft_status === 'approved').length,
            },
            {
              label: 'Released',
              value: matters.filter((m) => m.stage === 'released').length,
            },
          ]}
        />
      </div>

      <p className="mt-6 text-sm text-ink-faint">
        Open a session outcome workspace to edit drafts.{' '}
        <Link to={appRoutes.sessions} className="text-brand">
          Rooms / sessions
        </Link>
      </p>
    </div>
  );
}
