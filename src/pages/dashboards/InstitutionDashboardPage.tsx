import { RoleDashboardShell } from './RoleDashboardShell';

export function InstitutionDashboardPage() {
  return (
    <RoleDashboardShell
      eyebrow="Institution"
      title="Org, invites, policy"
      subtitle="Workspace for institution admins: invite cohorts, policy defaults, and audit exports — not live room facilitation."
      quickLinks={[
        { label: 'Request access (public)', href: '/request-access' },
        { label: 'Settings', href: '/settings' },
      ]}
    />
  );
}
