import { Link } from 'react-router-dom';

/**
 * Landing surface for authenticated users whose invite has not been accepted
 * (no `profiles` row yet) or whose profile is in `status='pending'`.
 */
export function AccessPendingPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--sr-primary)' }}
      >
        Account status
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: 'var(--sr-ink)' }}>
        Your access is pending review
      </h1>
      <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--sr-ink-secondary)' }}>
        You are signed in, but your account is either awaiting invitation acceptance or under review
        by an administrator. Open the invitation link sent to your email, or contact your
        institution admin if you believe this is an error.
      </p>
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/request-access"
          className="btn-pill btn-pill--primary inline-flex items-center justify-center text-sm"
        >
          Request pilot access
        </Link>
        <Link
          to="/"
          className="btn-pill btn-pill--ghost inline-flex items-center justify-center text-sm"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
