import { Link } from 'react-router-dom';
import { TokenShell } from '../../../components/layout/TokenShell';

export function InviteInvalidPage() {
  return (
    <TokenShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand">
          Invitation
        </p>
        <h1 className="mb-3 text-xl font-semibold tracking-tight text-ink">
          This invitation is not valid
        </h1>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-ink-secondary">
          The link may have expired, already been used, or been revoked. Contact your facilitator
          for a new invitation.
        </p>
        <Link
          to="/"
          className="text-sm font-medium text-brand underline transition-opacity hover:opacity-70"
        >
          Back to SquadRidge
        </Link>
      </div>
    </TokenShell>
  );
}
