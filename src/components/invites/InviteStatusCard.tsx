// ============================================================
// InviteStatusCard — shows invalid invite state
// ============================================================
import { Link } from 'react-router-dom';
import type { InviteValidationResult } from '../../types/invites';

export function InviteStatusCard({ result }: { result: InviteValidationResult }) {
  const messages: Record<string, { title: string; body: string }> = {
    expired: {
      title: 'Invite Expired',
      body: 'This invite link has expired. Ask your administrator to send a new one.',
    },
    revoked: {
      title: 'Invite Revoked',
      body: 'This invite has been revoked. Please contact your administrator.',
    },
    already_used: {
      title: 'Invite Already Used',
      body: 'This invite has already been accepted. Try signing in instead.',
    },
    not_found: {
      title: 'Invalid Invite',
      body: 'This invite link is not valid. Check the link or contact your administrator.',
    },
  };

  const msg = messages[result.reason ?? 'not_found'] ?? messages['not_found'];

  return (
    <div className="rounded-lg border border-sq-border bg-sq-surface p-6 text-center max-w-md mx-auto space-y-4">
      <div className="text-3xl" aria-hidden>
        &#9888;&#65039;
      </div>
      <h2 className="text-lg font-semibold text-sq-text">{msg.title}</h2>
      <p className="text-sq-muted text-sm">{msg.body}</p>
      <div className="flex gap-3 justify-center">
        <Link to="/sign-in" className="btn-secondary">
          Sign in
        </Link>
        <Link to="/request-access" className="btn-primary">
          Request access
        </Link>
      </div>
    </div>
  );
}
