import { RoleDashboardShell } from './RoleDashboardShell';

const orgPulse = [
  { label: 'Active institutions', value: '4' },
  { label: 'Open invite cohorts', value: '2' },
  { label: 'Policy reviews due', value: '1' },
];

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
        {
          label: 'Cinematic simulation',
          href: '/demo/simulation',
          description: 'Full diligence walkthrough (demo flag)',
        },
        { label: 'Facilitator workspace', href: '/app/facilitator' },
      ]}
    >
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {orgPulse.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border px-4 py-3"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <p
              className="text-xs uppercase tracking-wider"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {s.label}
            </p>
            <p
              className="mt-1 text-xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Audit exports and invite issuance stay metadata-safe. Never bundle demo decoys into
        production artifacts.
      </p>
    </RoleDashboardShell>
  );
}
