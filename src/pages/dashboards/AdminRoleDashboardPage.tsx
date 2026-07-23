import { RoleDashboardShell } from './RoleDashboardShell';

export function AdminRoleDashboardPage() {
  return (
    <RoleDashboardShell
      eyebrow="Super admin"
      title="Platform administration"
      subtitle="Orgs, invites, policy, and demo surfaces. Ops moderation stays under /admin — clearly labeled operations."
      quickLinks={[
        {
          label: 'Ops rooms',
          href: '/admin/rooms',
          description: 'Moderator operations (separate from RoleKey dashboards)',
        },
        { label: 'Health probes', href: '/admin/health' },
        {
          label: 'Demo catalog',
          href: '/app/demo/catalog',
          description: 'Illustrative — not production claims',
        },
        { label: 'Facilitator workspace', href: '/app/facilitator' },
      ]}
    />
  );
}
