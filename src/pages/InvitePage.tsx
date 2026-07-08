import { Navigate, useSearchParams } from 'react-router-dom';
import { staffInviteAcceptPath } from '../lib/pendingInvite';

/**
 * Legacy invite entry — redirects platform invite tokens to the accept flow.
 */
export function InvitePage() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') ?? searchParams.get('code') ?? '').trim();

  if (token.length >= 32) {
    return <Navigate to={staffInviteAcceptPath(token)} replace />;
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <h1 className="text-h2" style={{ color: 'var(--sr-ink)' }}>
        Invitation link required
      </h1>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--sr-ink-secondary)' }}>
        Open the full invitation link sent by your administrator, or{' '}
        <a
          href="/request-access"
          className="underline-offset-4 hover:underline"
          style={{ color: 'var(--sr-primary)' }}
        >
          request pilot access
        </a>{' '}
        if you do not have one yet.
      </p>
    </div>
  );
}
