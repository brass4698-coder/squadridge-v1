import { Link } from 'react-router-dom';
import { PublicShell } from '../../components/layout/PublicShell';

/**
 * Landing surface for authenticated users whose invite has not been accepted
 * (no `profiles` row yet) or whose profile is in `status='pending'`. Referenced
 * by `useDashboardRoute` when `profile?.status === 'pending'`; previously that
 * returned a URL to a route that didn't exist and left the user on a 404.
 */
export function AccessPendingPage() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Account status
        </p>
        <h1
          className="mt-2 text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Your access is pending review
        </h1>
        <p
          className="mt-4 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          You are signed in, but your account is either awaiting invitation acceptance or under
          review by an administrator. You will receive an email when access is granted; there is no
          action required from you right now.
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/request-access"
            className="inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Update access request
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-line px-5 py-2.5 text-sm font-medium text-ink-secondary transition-opacity hover:opacity-70"
          >
            Back to SquadRidge
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
