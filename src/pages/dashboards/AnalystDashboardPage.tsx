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
    label: 'Public ledger',
    href: '/ledger',
    description: 'Published outcome records with verification anchors — not raw room content.',
  },
  {
    label: 'Sessions (metadata)',
    href: '/app/sessions',
    description:
      'Session metadata only. Room contents remain private to facilitators and participants.',
  },
];

export function AnalystDashboardPage() {
  return (
    <RoleDashboardShell
      role="analyst"
      headline="Analytics workspace"
      intro="Read-only, metrics-first. You will not see raw message bodies; aggregate signals only."
      quickLinks={QUICK_LINKS}
      aboutYourRole="Analysts see aggregate sentiment, participation, and outcome throughput. Row-level session privacy is preserved by RLS — the client-side gate on this dashboard is UX only."
    />
  );
}
