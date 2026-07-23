import { RoleDashboardShell } from './RoleDashboardShell';

export function AnalystDashboardPage() {
  return (
    <RoleDashboardShell
      eyebrow="Analyst"
      title="Aggregates for diligence"
      subtitle="CSI-style metrics and exportable metadata — never message bodies or individual mood scores."
      quickLinks={[
        {
          label: 'Ops CSI (moderators)',
          href: '/admin/csi',
          description: 'Requires ops moderator access',
        },
        { label: 'Ledger', href: '/ledger', description: 'Released records for context' },
      ]}
    >
      <ul className="mt-8 space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        <li>Sessions with intentional Slow down (facilitator-reported): illustrative 42%</li>
        <li>Retryable room errors (7d): illustrative ↓</li>
        <li>Pacing telemetry privacy incidents: 0 required</li>
      </ul>
    </RoleDashboardShell>
  );
}
