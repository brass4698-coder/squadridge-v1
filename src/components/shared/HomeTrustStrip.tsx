import { Link } from 'react-router-dom';
import { HOME_TRUST_STRIP } from '../../data/implementationStatus';
import { ImplementationStatusBadge } from './ImplementationStatusBadge';

/**
 * Above-the-fold trust strip for evaluators — labels from registry-backed LIVE claims.
 */
export function HomeTrustStrip() {
  return (
    <ul
      className="mt-8 m-0 flex list-none flex-wrap gap-2 border-t border-line pt-6 p-0"
      aria-label="Trust model at a glance"
      data-demo="landing-trust-strip"
    >
      {HOME_TRUST_STRIP.map((item) => (
        <li key={item.label}>
          <Link
            to={item.href}
            className="inline-flex items-center gap-2 rounded-[var(--sr-radius-md)] border border-line bg-surface-elevated/90 px-3 py-2 no-underline shadow-sr-sm transition-colors hover:border-line-strong"
          >
            <ImplementationStatusBadge status="live" size="sm" />
            <span className="text-xs font-medium text-ink">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
