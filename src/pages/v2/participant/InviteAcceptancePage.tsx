import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { FormPanel } from '../../../components/ui/FormPanel';
import { TokenShell } from '../../../components/layout/TokenShell';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { participantRoute } from '../../../lib/participantRoutes';
import { validateParticipantToken } from '../../../lib/participantToken';
import type { ParticipantTokenContext } from '../../../lib/participantToken';
import {
  copyForParticipantTokenError,
  type ParticipantInvalidCopy,
} from '../../../lib/participantInvalidCopy';

type Status =
  | { kind: 'loading' }
  | { kind: 'valid'; ctx: ParticipantTokenContext }
  | { kind: 'invalid'; copy: ParticipantInvalidCopy };

export function InviteAcceptancePage() {
  const token = useParticipantToken();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token) return;

    void (async () => {
      const result = await validateParticipantToken(token);
      if (cancelled) return;
      if (!result.valid) {
        setStatus({ kind: 'invalid', copy: copyForParticipantTokenError(result.error) });
        return;
      }
      setStatus({ kind: 'valid', ctx: result });
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  function accept() {
    if (!token || status.kind !== 'valid') return;
    setAccepting(true);
    navigate(participantRoute('verify', token));
  }

  if (!token) return null;

  if (status.kind === 'loading') {
    return (
      <TokenShell>
        <div
          className="sr-form-atmosphere flex flex-1 flex-col items-center justify-center px-6 py-16"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <FormPanel className="w-full max-w-md text-center">
            <p className="text-app-body text-ink-secondary">
              <span className="sr-only">Loading invitation.</span>
              <span aria-hidden="true">Verifying invitation…</span>
            </p>
          </FormPanel>
        </div>
      </TokenShell>
    );
  }

  if (status.kind === 'invalid') {
    const { copy } = status;
    return (
      <TokenShell>
        <div
          className="sr-form-atmosphere flex flex-1 flex-col items-center justify-center px-6 py-16"
          role="alert"
        >
          <FormPanel
            className="w-full max-w-md text-center"
            eyebrow="Invitation"
            title={copy.title}
            titleAs="h1"
            description={copy.body}
          >
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Link
                to={copy.primaryAction.href}
                className="btn-institutional btn-institutional--primary inline-flex items-center justify-center no-underline"
              >
                {copy.primaryAction.label}
              </Link>
              {copy.secondaryAction ? (
                <Link
                  to={copy.secondaryAction.href}
                  className="btn-institutional btn-institutional--ghost inline-flex items-center justify-center no-underline"
                >
                  {copy.secondaryAction.label}
                </Link>
              ) : null}
            </div>
          </FormPanel>
        </div>
      </TokenShell>
    );
  }

  const ctx = status.ctx;

  return (
    <TokenShell>
      <div className="sr-form-atmosphere flex flex-1 flex-col items-center justify-center px-6 py-16">
        <FormPanel
          className="w-full max-w-md"
          eyebrow="Session invitation"
          title="You have been invited to participate"
          titleAs="h1"
          description="A facilitator has invited you to a private written dialogue session. Before you can enter, you will complete a short verification step. Your facilitator confirms participation — this is not automated identity proof."
          footer="This invitation link is single-use and expires after verification is complete."
        >
          <div className="mb-8 rounded-[var(--sr-radius-lg)] border border-line bg-surface-secondary p-5">
            <p className="mb-1 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.12em] text-ink-faint">
              Session
            </p>
            <p className="text-app-body font-medium text-ink">
              {ctx.session_title ?? 'Protected dialogue session'}
            </p>
            {ctx.codename ? (
              <p className="mt-1 text-app-meta text-ink-secondary">Your codename: {ctx.codename}</p>
            ) : null}
          </div>

          <ul className="mb-8 space-y-2">
            {[
              'Your participation is confidential.',
              'Only the approved outcome document may become public.',
              'Your identity is protected within the session room.',
              'You may leave at any time.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-app-body text-ink-secondary">
                <span className="mt-0.5 text-base leading-none text-sem-success" aria-hidden>
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>

          <Button className="w-full" size="lg" onClick={accept} loading={accepting}>
            Accept invitation &amp; continue
          </Button>
        </FormPanel>
      </div>
    </TokenShell>
  );
}
