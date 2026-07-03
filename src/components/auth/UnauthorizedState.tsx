// ============================================================
// UnauthorizedState — inline unauthorized message
// ============================================================
import { Link } from 'react-router-dom';

export function UnauthorizedState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="text-4xl" aria-hidden>
        &#128683;
      </div>
      <h1 className="text-xl font-semibold text-sq-text">Access Denied</h1>
      <p className="text-sq-muted max-w-sm">
        You don’t have permission to view this page. Contact your administrator if you believe this
        is an error.
      </p>
      <Link to="/app" className="btn-primary mt-2">
        Go to dashboard
      </Link>
    </div>
  );
}
