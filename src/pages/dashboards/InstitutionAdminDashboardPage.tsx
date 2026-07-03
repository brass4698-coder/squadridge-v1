import {
  RoleDashboardShell,
  type DashboardQuickLink,
} from '../../components/dashboard/RoleDashboardShell';

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    label: 'Invites & access requests',
    href: '/app/admin/invites',
    description:
      'Issue invitations, review pending access requests, manage roles inside your institution.',
  },
  {
    label: 'Institution sessions',
    href: '/app/sessions',
    description: 'Sessions run by facilitators in your institution.',
  },
  {
    label: 'Insights',
    href: '/app/insights',
    description:
      'Sentiment trends, participation metrics, and outcome throughput for your cohorts.',
  },
];

export function InstitutionAdminDashboardPage() {
  return (
    <RoleDashboardShell
      role="institution_admin"
      headline="Institution overview"
      intro="You administer users, workspaces, and cohorts inside your institution. Access outside your institution is denied by RLS at the server."
      quickLinks={QUICK_LINKS}
      aboutYourRole="Institution admins can grant and revoke facilitator, mediator, analyst, participant, and observer roles inside their institution. Only super_admin can grant super_admin. All grants and revocations are logged in audit_events."
    />
  );
}
