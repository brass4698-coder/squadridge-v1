import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';

// ── Mock data (replace with real hooks) ──────────────────────────────────────
const stats = [
  { label: 'Active sessions', value: '3' },
  { label: 'Pending approvals', value: '7' },
  { label: 'Released records', value: '14' },
  { label: 'Verified participants', value: '62' },
];

const recentSessions = [
  {
    id: 'sess-001',
    title: 'Northern Watershed Consultation',
    status: 'live' as const,
    participants: 12,
    updated: 'Today, 6:14 PM',
  },
  {
    id: 'sess-002',
    title: 'Urban Housing Policy Working Group',
    status: 'pending' as const,
    participants: 8,
    updated: 'Today, 2:30 PM',
  },
  {
    id: 'sess-003',
    title: 'Regional Trade Framework — Round 2',
    status: 'draft' as const,
    participants: 6,
    updated: 'Yesterday',
  },
  {
    id: 'sess-004',
    title: 'Community Land Use — Joint Statement',
    status: 'released' as const,
    participants: 12,
    updated: 'Jun 14',
  },
];

const pendingApprovals = [
  {
    id: 'appr-001',
    title: 'Urban Housing Policy — Outcome Draft',
    requestedBy: 'M. Osei',
    due: 'Today',
  },
  {
    id: 'appr-002',
    title: 'Trade Framework — Amendment Clause B',
    requestedBy: 'K. Lindqvist',
    due: 'Tomorrow',
  },
];

export function FacilitatorDashboardPage() {
  return (
    <div className="px-6 py-8 md:px-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Your active sessions, pending approvals, and recent records.
          </p>
        </div>
        <Link
          to="/sessions/new"
          className="hidden shrink-0 rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:block"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          + New Session
        </Link>
      </div>

      {/* Stat cards */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border p-5"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p
              className="mb-1 text-3xl font-semibold tabular-nums"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {s.value}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent sessions */}
        <section className="lg:col-span-2" aria-labelledby="recent-sessions-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="recent-sessions-heading"
              className="text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Recent Sessions
            </h2>
            <Link
              to="/sessions"
              className="text-xs underline transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              View all
            </Link>
          </div>

          <div
            className="overflow-hidden rounded-lg border"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                  {['Session', 'Status', 'Participants', 'Updated'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s, _i) => (
                  <tr
                    key={s.id}
                    className="border-b transition-colors last:border-0 hover:bg-slate-50"
                    style={{
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/sessions/${s.id}`}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {s.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge variant={s.status}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </StatusBadge>
                    </td>
                    <td
                      className="px-5 py-3.5 tabular-nums"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {s.participants}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {s.updated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pending approvals */}
        <section aria-labelledby="pending-approvals-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2
              id="pending-approvals-heading"
              className="text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Needs Your Review
            </h2>
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {pendingApprovals.length}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {pendingApprovals.map((a) => (
              <Link
                key={a.id}
                to={`/outcomes/${a.id}`}
                className="block rounded-lg border p-4 transition-shadow hover:shadow-md"
                style={{
                  borderColor: 'var(--color-pending-strip)',
                  backgroundColor: 'var(--color-pending-strip)',
                }}
              >
                <p
                  className="mb-1 text-sm font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {a.title}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Requested by {a.requestedBy} &middot; Due {a.due}
                </p>
              </Link>
            ))}
            {pendingApprovals.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                No pending approvals.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
