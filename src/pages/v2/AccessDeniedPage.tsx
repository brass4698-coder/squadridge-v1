import { ShieldOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { appRoutes } from '../../lib/appRoutes';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';

/** Left-aligned institutional 403 — not a centered marketing splash. */
export function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col justify-center bg-surface px-0 py-16">
      <div className={publicShellInnerClass}>
        <div className="max-w-measure text-left">
          <ShieldOff className="mb-6 h-10 w-10 text-ink-faint" aria-hidden="true" strokeWidth={2} />
          <p className="mb-3 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint">
            403
          </p>
          <h1 className="mb-3 font-display text-h1 font-medium text-ink">
            You don&apos;t have access to this page
          </h1>
          <p className="mb-8 max-w-prose text-base leading-relaxed text-ink-secondary">
            Your invitation may have expired, access may have been revoked, or you may be signed in
            with the wrong account.
          </p>
          <div className="flex flex-wrap items-center gap-3">
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
      </div>
    </div>
  );
}
