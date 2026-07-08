import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AcceptInviteForm } from '../components/invites/AcceptInviteForm';
import { TokenShell } from '../components/layout/TokenShell';
import { validateInviteToken } from '../lib/invites';
import { copyForInviteReason } from '../lib/inviteInvalidCopy';
import type { InviteValidationResult } from '../types/invites';

type Status =
  | { kind: 'loading' }
  | { kind: 'valid'; invite: InviteValidationResult }
  | { kind: 'invalid'; copy: ReturnType<typeof copyForInviteReason> };

/**
 * Staff / platform invite acceptance — validates `invites` table token,
 * collects display name, sends magic link, completes via `accept_invite` RPC
 * on `/invite/complete` (InviteCompletePage).
 */
export function StaffInviteAcceptPage() {
  const { token: rawToken } = useParams<{ token: string }>();
  const token = rawToken?.trim() ?? '';
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setStatus({ kind: 'invalid', copy: copyForInviteReason('not_found') });
      return;
    }

    void (async () => {
      const result = await validateInviteToken(token);
      if (cancelled) return;
      if (!result.valid) {
        setStatus({ kind: 'invalid', copy: copyForInviteReason(result.reason) });
        return;
      }
      setStatus({ kind: 'valid', invite: result });
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <TokenShell>
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <p style={{ color: 'var(--sr-ink-secondary)' }}>Invitation link is missing a token.</p>
          <Link
            to="/sign-in"
            className="mt-4 inline-block text-sm"
            style={{ color: 'var(--sr-primary)' }}
          >
            Go to sign in
          </Link>
        </div>
      </TokenShell>
    );
  }

  if (status.kind === 'loading') {
    return (
      <TokenShell>
        <div className="mx-auto flex max-w-md flex-col px-6 py-16" role="status" aria-live="polite">
          <p style={{ color: 'var(--sr-ink-secondary)' }}>Verifying invitation…</p>
        </div>
      </TokenShell>
    );
  }

  if (status.kind === 'invalid') {
    const { copy } = status;
    return (
      <TokenShell>
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <h1 className="text-h3" style={{ color: 'var(--sr-ink)' }}>
            {copy.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--sr-ink-secondary)' }}>
            {copy.body}
          </p>
          <Link
            to={copy.primaryAction.href}
            className="btn-pill btn-pill--primary mt-8 inline-flex text-sm"
          >
            {copy.primaryAction.label}
          </Link>
        </div>
      </TokenShell>
    );
  }

  return (
    <TokenShell>
      <div className="mx-auto w-full max-w-md px-6 py-12">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--sr-primary)' }}
        >
          Invitation
        </p>
        <h1 className="mt-2 text-h2" style={{ color: 'var(--sr-ink)' }}>
          Accept your invite
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--sr-ink-secondary)' }}>
          Confirm your display name and we&apos;ll email you a one-time link to activate access.
        </p>
        <div className="mt-8">
          <AcceptInviteForm token={token} validation={status.invite} />
        </div>
      </div>
    </TokenShell>
  );
}
