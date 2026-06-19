import { Link, useNavigate } from 'react-router-dom';

export function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div
        className="mb-6 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      </div>
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Access denied
      </p>
      <h1
        className="mb-3 text-2xl font-semibold tracking-tight"
        style={{ color: 'var(--color-text-primary)' }}
      >
        You are not authorised to view this page
      </h1>
      <p
        className="mb-8 max-w-sm text-sm leading-relaxed"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        This may be because your invitation has expired, your access has been revoked, or you are not signed in with the correct account.
      </p>
      <div className="flex gap-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm underline transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Go back
        </button>
        <Link
          to="/sign-in"
          className="text-sm font-medium underline transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-accent)' }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
