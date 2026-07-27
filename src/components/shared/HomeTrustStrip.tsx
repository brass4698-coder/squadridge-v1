import { Link } from 'react-router-dom';
import { HOME_TRUST_STRIP } from '../../data/implementationStatus';
import { ImplementationStatusBadge } from './ImplementationStatusBadge';
import { ImplementationStatusLegend } from './ImplementationStatusLegend';

/**
 * Above-the-fold trust strip for evaluators — labels from registry-backed LIVE claims.
 * Ledger badge means the release pipeline is live, not that public entries exist yet.
 */
export function HomeTrustStrip() {
  return (
    <div className="mt-9 border-t border-line pt-7">
      <p className="m-0 mb-3 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.1em] text-ink-faint">
        Trust model · live claims
      </p>
      <ul
        className="m-0 grid list-none gap-px overflow-hidden rounded-[var(--sr-radius-md)] border border-line bg-line p-0 sm:grid-cols-2"
        aria-label="Trust model at a glance"
        data-demo="landing-trust-strip"
      >
        {HOME_TRUST_STRIP.map((item) => (
          <li key={item.label} className="bg-surface-elevated">
            <Link
              to={item.href}
              title={
                item.claimId === 'approved_outcomes_ledger'
                  ? 'Release pipeline is live. Public entries appear only after a real release — specimens are illustrative.'
                  : item.claimId === 'room_app_layer_encryption'
                    ? 'Message bodies are encrypted at rest. Operators with database access can still decrypt — not Signal-grade E2E.'
                    : undefined
              }
              className="sr-trust-cell flex min-h-[3rem] items-center gap-2.5 px-3.5 py-3 no-underline"
            >
              <ImplementationStatusBadge status="live" size="sm" />
              <span className="text-xs font-medium text-ink">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      <ImplementationStatusLegend variant="liveFocus" className="mt-3" />
    </div>
  );
}
