// ============================================================
// InviteOnlyNotice — shown on sign-in page
// ============================================================
import { Link } from 'react-router-dom';

export function InviteOnlyNotice() {
  return (
    <div className="sr-form-notice">
      <p className="m-0">
        SquadRidge is invite-only during the private pilot for mediators and facilitation teams.{' '}
        <Link
          to="/request-access"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Request pilot access
        </Link>{' '}
        if you do not have an invitation yet.
      </p>
    </div>
  );
}
