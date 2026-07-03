import {
  RoleDashboardShell,
  type DashboardQuickLink,
} from '../../components/dashboard/RoleDashboardShell';

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    label: 'Insights',
    href: '/app/insights',
    description: 'Aggregate metrics across sessions you have permission to read.',
  },
  {
    label: 'Ledger',
    href: '/ledger',
    description: 'Published outcome records. Signed by the facilitator and approvers.',
  },
  {
    label: 'Sessions (read-only)',
    href: '/app/sessions',
    description: 'Session metadata only. Room contents are private.',
  },
];

export function AnalystDashboardPage() {
  return (
    <RoleDashboardShell
      role="analyst"
      headline="Analytics workspace"
      intro="Read-only across the institutions and workspaces you are scoped to. You will never see raw message contents; aggregate signals only."
      quickLinks={QUICK_LINKS}
      aboutYourRole="Analysts see aggregate sentiment, participation, and outcome throughput. Row-level session privacy is preserved by RLS — the client-side gate on this dashboard is UX only."
    />
  );
}
