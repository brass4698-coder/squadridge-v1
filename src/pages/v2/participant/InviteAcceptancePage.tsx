import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { TokenShell } from '../../../components/layout/TokenShell';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { DEV_PARTICIPANT_DEMO_TOKEN, participantRoute } from '../../../lib/participantRoutes';
import { validateInviteToken } from '../../../lib/invites';
import type { InviteValidationResult } from '../../../types/invites';
import { copyForInviteReason, type InviteInvalidCopy } from '../../../lib/inviteInvalidCopy';
import { ROLE_LABELS } from '../../../types/roles';
import type { RoleKey } from '../../../types/roles';

type Status =
  | { kind: 'loading' }
  | { kind: 'valid'; invite: InviteValidationResult }
  | { kind: 'invalid'; copy: InviteInvalidCopy };

function isKnownRoleKey(key: string | undefined): key is RoleKey {
  return key !== undefined && key in ROLE_LABELS;
}

export function InviteAcceptancePage() {
  const token = useParticipantToken();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token) return;

    // Local demo token: skip the network call and render the fixture UI
    // so that `/p/invite/demo-token` still walks correctly without Supabase.
    if (token === DEV_PARTICIPANT_DEMO_TOKEN) {
      setStatus({
        kind: 'valid',
        invite: { valid: true, email: undefined, role_key: 'participant' },
      });
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

  function accept() {
    if (!token || status.kind !== 'valid') return;
    setAccepting(true);
    // The actual auth handshake happens on the verify step; this navigation
    // matches the existing participant flow and is exercised by
    // e2e/phase0-routing.spec.ts.
    setTimeout(() => navigate(participantRoute('verify', token)), 500);
  }

  if (!token) return null;

  if (status.kind === 'loading') {
    return (
      <TokenShell>
        <div
          className="flex flex-1 flex-col items-center justify-center px-6 py-16"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="sr-glass-strong w-full max-w-md rounded-xl p-10 text-center">
            <p className="text-app-body text-ink-secondary">
              <span className="sr-only">Loading invitation.</span>
              <span aria-hidden="true">Verifying invitation…</span>
            </p>
          </div>
        </div>
      </TokenShell>
    );
  }

  if (status.kind === 'invalid') {
    const { copy } = status;
    return (
      <TokenShell>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16" role="alert">
          <div className="sr-glass-strong w-full max-w-md rounded-xl p-10 text-center">
            <p className="mb-3 text-app-meta font-semibold uppercase tracking-widest text-brand">
              Invitation
            </p>
            <h1 className="mb-3 text-page-title text-ink">{copy.title}</h1>
            <p className="mb-8 text-app-body leading-relaxed text-ink-secondary">{copy.body}</p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Link
                to={copy.primaryAction.href}
                className="inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {copy.primaryAction.label}
              </Link>
              {copy.secondaryAction ? (
                <Link
                  to={copy.secondaryAction.href}
                  className="inline-flex items-center justify-center rounded-md border border-line px-5 py-2.5 text-sm font-medium text-ink-secondary transition-opacity hover:opacity-70"
                >
                  {copy.secondaryAction.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </TokenShell>
    );
  }

  const invite = status.invite;
  const roleLabel = isKnownRoleKey(invite.role_key) ? ROLE_LABELS[invite.role_key] : 'Participant';

  return (
    <TokenShell>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="sr-glass-strong w-full max-w-md rounded-xl p-10">
          <p className="mb-4 text-app-meta font-semibold uppercase tracking-widest text-brand">
            Secure invitation
          </p>

          <h1 className="mb-3 text-page-title text-ink">You have been invited to participate</h1>

          <p className="mb-6 text-app-body leading-relaxed text-ink-secondary">
            A facilitator has extended a formal invitation for you to join a protected dialogue
            session on SquadRidge. Before you can enter, you will complete a short verification
            process.
          </p>

          <div className="mb-8 rounded-lg border border-line bg-surface-secondary p-5">
            <p className="mb-1 text-app-meta font-semibold uppercase tracking-wider text-ink-secondary">
              Invitation
            </p>
            <p className="text-app-body font-medium text-ink">
              {invite.email ?? 'Northern Watershed Consultation'}
            </p>
            <p className="mt-1 text-app-meta text-ink-secondary">Role: {roleLabel}</p>
          </div>

          <ul className="mb-8 space-y-2">
            {[
              'Your participation is confidential.',
              'Only the approved outcome document may become public.',
              'Your identity is protected within the session room.',
              'You may leave at any time.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-app-body text-ink-secondary">
                <span className="mt-0.5 text-base leading-none text-sem-success">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <Button className="w-full" size="lg" onClick={accept} loading={accepting}>
            Accept invitation &amp; continue
          </Button>

          <p className="mt-4 text-center text-app-meta text-ink-secondary">
            This invitation link is single-use and expires after verification is complete.
          </p>
        </div>
      </div>
    </TokenShell>
  );
}
