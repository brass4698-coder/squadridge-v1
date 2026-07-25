import { Link } from 'react-router-dom';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

/**
 * Landing surface for authenticated users whose invite has not been accepted
 * (no `profiles` row yet) or whose profile is in `status='pending'`.
 * Left-aligned — status pages still follow the institutional alignment system.
 */
export function AccessPendingPage() {
  return (
    <div className="py-16">
      <div className={publicShellInnerClass}>
        <div className="max-w-measure text-left">
          <p className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Account status
          </p>
          <h1 className="mt-3 font-heading text-h1 font-semibold tracking-tight text-ink">
            Your access is pending review
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
            You are signed in, but your account is either awaiting invitation acceptance or under
            review by an administrator. Open the invitation link sent to your email, or contact your
            institution admin if you believe this is an error.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-start">
            <Link to="/request-access" className="btn-institutional btn-institutional--primary">
              Request pilot access
            </Link>
            <Link to="/" className="btn-institutional btn-institutional--ghost">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
