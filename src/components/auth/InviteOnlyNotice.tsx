// ============================================================
// InviteOnlyNotice — shown on sign-in page
// ============================================================
import { Link } from 'react-router-dom';

export function InviteOnlyNotice() {
  return (
    <div className="rounded-md border border-sq-border bg-sq-surface px-4 py-3 text-sm text-sq-muted">
      <p>
        SquadRidge is an invite-only platform.{' '}
        <Link to="/request-access" className="text-sq-primary underline hover:no-underline">
          Request access
        </Link>{' '}
        if you’d like to join.
      </p>
    </div>
  );
}
