import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { appRoutes } from '../../lib/appRoutes';

export function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-16 text-center">
      <div
        className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-sem-danger-soft text-sem-danger"
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      </div>
      <p className="mb-3 text-app-meta font-semibold uppercase tracking-widest text-ink-secondary">
        Access denied
      </p>
      <h1 className="mb-3 text-page-title text-ink">You are not authorized to view this page</h1>
      <p className="mb-8 max-w-sm text-app-body leading-relaxed text-ink-secondary">
        Your invitation may have expired, access may have been revoked, or you may be signed in with
        the wrong account.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button asChild variant="secondary">
          <Link to={appRoutes.dashboard}>Go to dashboard</Link>
        </Button>
        <Button asChild>
          <Link to="/sign-in">Sign in</Link>
        </Button>
      </div>
    </div>
  );
}
