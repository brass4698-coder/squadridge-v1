import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AcceptInviteForm } from '../components/invites/AcceptInviteForm';
import { FormPanel } from '../components/ui/FormPanel';
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
        <div className="sr-form-atmosphere mx-auto flex min-h-[50vh] max-w-md items-center px-6 py-16">
          <FormPanel
            className="w-full text-center"
            eyebrow="Invitation"
            title="Missing token"
            description="Invitation link is missing a token."
          >
            <Link to="/sign-in" className="text-sm text-brand">
              Go to sign in
            </Link>
          </FormPanel>
        </div>
      </TokenShell>
    );
  }

  if (status.kind === 'loading') {
    return (
      <TokenShell>
        <div
          className="sr-form-atmosphere mx-auto flex max-w-md flex-col px-6 py-16"
          role="status"
          aria-live="polite"
        >
          <p className="text-ink-secondary">Verifying invitation…</p>
        </div>
      </TokenShell>
    );
  }

  if (status.kind === 'invalid') {
    const { copy } = status;
    return (
      <TokenShell>
        <div className="sr-form-atmosphere mx-auto flex min-h-[50vh] max-w-md items-center px-6 py-16">
          <FormPanel
            className="w-full text-center"
            eyebrow="Invitation"
            title={copy.title}
            description={copy.body}
          >
            <Link
              to={copy.primaryAction.href}
              className="btn-institutional btn-institutional--primary mt-2 inline-flex text-sm no-underline"
            >
              {copy.primaryAction.label}
            </Link>
          </FormPanel>
        </div>
      </TokenShell>
    );
  }

  return (
    <TokenShell>
      <div className="sr-form-atmosphere mx-auto w-full max-w-md px-6 py-12">
        <p className="font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-brand">
          Invitation
        </p>
        <h1 className="mt-2 font-display text-h2 font-medium text-ink">Accept your invite</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          Confirm your display name and we&apos;ll email you a one-time link to activate access.
        </p>
        <div className="mt-8">
          <AcceptInviteForm token={token} validation={status.invite} />
        </div>
      </div>
    </TokenShell>
  );
}
