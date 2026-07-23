import { Link } from 'react-router-dom';
import { RoleDashboardShell } from './RoleDashboardShell';

export function FacilitatorRoleDashboardPage() {
  return (
    <RoleDashboardShell
      eyebrow="Facilitator"
      title="Live rooms & interventions"
      subtitle="Enrich the control surface: admit participants, apply Slow down (distinct from session pause), and move drafts through the release gate."
      quickLinks={[
        {
          label: 'Full facilitator dashboard',
          href: '/dashboard',
          description: 'Stats, approvals, recent sessions',
        },
        { label: 'New session', href: '/sessions/new', description: 'Set up a governed room' },
        {
          label: 'Session control (example)',
          href: '/sessions/sess-001/control',
          description: 'Intervention rail + room pause',
        },
      ]}
    >
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Live rooms', value: '3' },
          { label: 'Active cooldowns', value: '1' },
          { label: 'Release queue', value: '2' },
        ].map((s) => (
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
        Pilot fit tip: suggest Slow down before room-wide pause. Metadata audit stays on the control
        panel.
      </p>
      <Link
        to="/sessions/sess-001/control"
        className="mt-3 inline-block text-sm font-medium underline-offset-2 hover:underline"
        style={{ color: 'var(--color-accent)' }}
      >
        Open intervention rail
      </Link>
    </RoleDashboardShell>
  );
}
