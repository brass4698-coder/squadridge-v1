import { Link } from 'react-router-dom';
import { publicShellInnerClass } from '../../components/layout/publicShellTokens';
import { getPublicContactEmail } from '../../lib/env';

/**
 * Ops kill-switch page when `VITE_MAINTENANCE_MODE=true`.
 * Calm institutional copy — no alarmist language.
 */
export function MaintenancePage() {
  const contact = getPublicContactEmail();

  return (
    <div className="flex min-h-screen flex-col justify-center bg-surface px-0 py-16">
      <div className={publicShellInnerClass}>
        <div className="max-w-measure text-left">
          <p className="mb-3 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Maintenance
          </p>
          <h1 className="mb-3 font-heading text-h1 font-semibold text-ink">
            SquadRidge is briefly unavailable
          </h1>
          <p className="mb-8 max-w-prose text-base leading-relaxed text-ink-secondary">
            We are performing planned maintenance. Facilitated sessions and the public ledger will
            return shortly. If you are mid-pilot, contact your facilitator off-platform.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="btn-institutional btn-institutional--ghost">
              Return to home
            </Link>
            {contact ? (
              <a
                href={`mailto:${contact}`}
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-brand underline-offset-4 hover:underline"
              >
                Contact support
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
