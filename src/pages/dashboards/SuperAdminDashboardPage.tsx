import {
  RoleDashboardShell,
  type DashboardQuickLink,
} from '../../components/dashboard/RoleDashboardShell';

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    label: 'Invites & user roles',
    href: '/app/admin/invites',
    description: 'Issue role-scoped invites, review access requests, grant or revoke user roles.',
  },
  {
    label: 'All sessions',
    href: '/app/sessions',
    description: 'Every session across the platform, regardless of institution.',
  },
  {
    label: 'Insights',
    href: '/app/insights',
    description: 'Aggregate outcomes, sentiment trends, and platform-level metrics.',
  },
  {
    label: 'Ledger',
    href: '/ledger',
    description: 'Published outcome records, chain-of-custody verifiable.',
  },
];

export function SuperAdminDashboardPage() {
  return (
    <RoleDashboardShell
      role="super_admin"
      headline="System overview"
      intro="You have platform-wide access. Everything below is scoped to the entire deployment, not a single institution."
      quickLinks={QUICK_LINKS}
      aboutYourRole="Super admin is the highest-privilege role. You can grant any role including super_admin, revoke arbitrary user roles (except the last remaining super_admin), and see every session and audit record. Prefer institution admins for org-scoped operations when possible."
    />
  );
}
