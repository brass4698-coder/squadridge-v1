// ============================================================
// InviteOnlyNotice — shown on sign-in page
// ============================================================
import { Link } from 'react-router-dom';

export function InviteOnlyNotice() {
  return (
    <div
      className="rounded-lg border px-4 py-3 text-sm"
      style={{
        borderColor: 'var(--sr-line)',
        background: 'var(--sr-bg-secondary)',
        color: 'var(--sr-ink-secondary)',
      }}
    >
      <p>
        SquadRidge is invite-only for pilot access.{' '}
        <Link
          to="/request-access"
          className="underline-offset-4 hover:underline"
          style={{ color: 'var(--sr-primary)' }}
        >
          Request access
        </Link>{' '}
        if you do not have an invitation yet.
      </p>
    </div>
  );
}
