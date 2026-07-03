import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';

type SessionListStatus = 'live' | 'paused' | 'pending' | 'draft' | 'released' | 'archived';

const allSessions: Array<{
  id: string;
  title: string;
  status: SessionListStatus;
  participants: number;
  date: string;
  org: string;
}> = [
  {
    id: 'sess-001',
    title: 'Northern Watershed Consultation',
    status: 'live',
    participants: 12,
    date: 'Jun 18, 2024',
    org: 'Regional Mediation Centre',
  },
  {
    id: 'sess-002',
    title: 'Urban Housing Policy Working Group',
    status: 'pending',
    participants: 8,
    date: 'Jun 18, 2024',
    org: 'City Planning Consortium',
  },
  {
    id: 'sess-003',
    title: 'Regional Trade Framework — Round 2',
    status: 'draft',
    participants: 6,
    date: 'Jun 19, 2024',
    org: 'Trade Facilitation Office',
  },
  {
    id: 'sess-004',
    title: 'Community Land Use — Joint Statement',
    status: 'released',
    participants: 12,
    date: 'Mar 14, 2024',
    org: 'Regional Mediation Centre',
  },
  {
    id: 'sess-005',
    title: 'Coastal Zone Management Dialogue',
    status: 'archived',
    participants: 9,
    date: 'Feb 2, 2024',
    org: 'Coastal Authority',
  },
];

export function SessionsListPage() {
  return (
    <div className="px-6 py-8 md:px-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Sessions
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            All sessions you have created or facilitated.
          </p>
        </div>
        <Link
          to="/sessions/new"
          className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          + New Session
        </Link>
      </div>

      <div
        className="overflow-hidden rounded-lg border"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
              {['Session', 'Organisation', 'Status', 'Participants', 'Date', ''].map((h) => (
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
            {allSessions.map((s) => (
              <tr
                key={s.id}
                className="border-b last:border-0 transition-colors hover:bg-slate-50"
                style={{ borderColor: 'var(--color-border)' }}
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
                <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>
                  {s.org}
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
                  {s.date}
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    to={
                      s.status === 'live' || s.status === 'paused'
                        ? `/sessions/${s.id}/room`
                        : s.status === 'pending'
                          ? `/sessions/${s.id}/invite`
                          : s.status === 'draft'
                            ? `/outcomes/new?sessionId=${s.id}`
                            : `/ledger/${s.id}`
                    }
                    className="text-xs font-medium underline transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {s.status === 'live'
                      ? 'Enter Room'
                      : s.status === 'pending'
                        ? 'Manage Invites'
                        : s.status === 'draft'
                          ? 'Draft Outcome'
                          : s.status === 'released'
                            ? 'View Record'
                            : 'View'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
