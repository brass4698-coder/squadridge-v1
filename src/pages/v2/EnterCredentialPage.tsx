import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GovernedEntryNav } from '../../components/auth/GovernedEntryNav';
import { GovernedEntryLayout } from '../../components/shell/GovernedEntryLayout';
import { FormField } from '../../components/ui/FormField';
import { FormPanel } from '../../components/ui/FormPanel';
import { Input } from '../../components/ui/Input';
import { copyForInviteReason } from '../../lib/inviteInvalidCopy';
import { isDemoLoginEnabled } from '../../lib/demoLogin';
import {
  DEMO_CREDENTIALS,
  validateGovernedCredential,
  type CredentialValidation,
} from '../../lib/validateGovernedCredential';

export function EnterCredentialPage() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [result, setResult] = useState<CredentialValidation | null>(null);
  const [busy, setBusy] = useState(false);
  const [pasteHint, setPasteHint] = useState<string | null>(null);

  const errorCopy = useMemo(() => {
    if (!result || result.ok) return null;
    if (result.reason === 'demo_required') {
      return {
        title: 'Demo credential',
        body: result.message,
      };
    }
    return copyForInviteReason(
      result.reason === 'wrong_role'
        ? 'not_found'
        : result.reason === 'room_archived'
          ? 'revoked'
          : result.reason === 'facilitator_pending'
            ? 'expired'
            : result.reason,
    );
  }, [result]);

  async function onValidate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    setPasteHint(null);
    const next = await validateGovernedCredential(value.trim());
    setResult(next);
    setBusy(false);
  }

  async function pasteFromClipboard() {
    setPasteHint(null);
    if (!navigator.clipboard?.readText) {
      setPasteHint(
        'Clipboard paste is not available in this browser. Paste manually into the field.',
      );
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      const trimmed = text.trim();
      if (!trimmed) {
        setPasteHint('Clipboard was empty. Copy your invitation token, then try again.');
        return;
      }
      setValue(trimmed);
      setPasteHint('Pasted from clipboard.');
    } catch {
      setPasteHint(
        'Could not read the clipboard. Allow paste permission, or paste the token manually.',
      );
    }
  }

  const showDemoCredentials = isDemoLoginEnabled();

  return (
    <GovernedEntryLayout title="Invitation credential">
      <div className="mx-auto max-w-xl">
        <h1 className="font-heading text-h2 font-semibold text-ink">Enter invitation credential</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Invitation credentials are issued for specific rooms, roles, and pilot scopes — not for
          open signup.
        </p>

        <FormPanel
          className="mt-8"
          eyebrow="Credential"
          title="Validate access"
          description="Paste the invitation hash or token issued for your room."
          footer={
            <>
              Prefer camera handoff?{' '}
              <Link to="/enter/qr" className="text-brand underline-offset-2 hover:underline">
                Scan invitation QR
              </Link>
            </>
          }
        >
          <form className="space-y-4" onSubmit={(e) => void onValidate(e)}>
            <FormField id="credential" label="Credential or invitation token" instrument>
              <Input
                id="credential"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setPasteHint(null);
                }}
                placeholder="Paste invitation hash or token"
                autoComplete="off"
                required
                className="font-mono text-sm"
              />
            </FormField>
            {pasteHint ? (
              <p className="m-0 text-sm text-ink-secondary" role="status">
                {pasteHint}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-institutional btn-institutional--primary"
                disabled={busy}
              >
                {busy ? 'Validating…' : 'Validate credential'}
              </button>
              <button
                type="button"
                className="btn-institutional btn-institutional--ghost"
                onClick={() => void pasteFromClipboard()}
              >
                Paste from clipboard
              </button>
            </div>
          </form>
        </FormPanel>

        {result?.ok ? (
          <div className="sr-mode-gate mt-8 rounded-[var(--sr-radius-xl)] border p-5" role="status">
            <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
              Access confirmed
            </p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-faint">Access type</dt>
                <dd className="m-0 font-medium text-ink">{result.summary.accessType}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Room / matter</dt>
                <dd className="m-0 font-medium text-ink">{result.summary.matterLabel}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Role</dt>
                <dd className="m-0 font-medium text-ink">{result.summary.role}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Issued by</dt>
                <dd className="m-0 font-medium text-ink">{result.summary.issuedBy}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Expiry</dt>
                <dd className="m-0 font-medium text-ink">{result.summary.expiry}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Status</dt>
                <dd className="m-0 font-medium text-ink">{result.summary.status}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="btn-institutional btn-institutional--primary mt-6"
              onClick={() => navigate(result.continueHref)}
            >
              Continue to role entry
            </button>
          </div>
        ) : null}

        {result && !result.ok && errorCopy ? (
          <div
            className="mt-8 rounded-[var(--sr-radius-xl)] border border-sem-danger/40 bg-sem-danger-soft p-5"
            role="alert"
          >
            <p className="m-0 font-medium text-ink">{errorCopy.title}</p>
            <p className="mt-2 mb-0 text-sm text-ink-secondary">{errorCopy.body}</p>
            {result.reason === 'expired' ? (
              <p className="mt-3 mb-0 text-sm text-ink-secondary">
                Request a fresh invitation from your facilitator, or sign in if you already have an
                account.
              </p>
            ) : null}
            {'primaryAction' in errorCopy && errorCopy.primaryAction ? (
              <Link
                to={errorCopy.primaryAction.href}
                className="mt-4 inline-block text-sm text-brand"
              >
                {errorCopy.primaryAction.label}
              </Link>
            ) : null}
          </div>
        ) : null}

        {showDemoCredentials ? (
          <details className="mt-10 text-sm text-ink-faint">
            <summary className="cursor-pointer text-ink-secondary">Demo credentials</summary>
            <p className="mt-2 mb-0 text-xs leading-relaxed">
              Local / staging shortcuts only. They validate in-browser and route to demo sign-in —
              not production invitations.
            </p>
            <ul className="mt-2 list-disc pl-5">
              {DEMO_CREDENTIALS.map((c) => (
                <li key={c.token}>
                  <button
                    type="button"
                    className="font-mono text-brand underline-offset-2 hover:underline"
                    onClick={() => {
                      setValue(c.token);
                      setResult(null);
                      setPasteHint(null);
                    }}
                  >
                    {c.token}
                  </button>{' '}
                  — {c.label}
                </li>
              ))}
            </ul>
            <p className="mt-2 mb-0 text-xs">
              Try invalid/expired specimens:{' '}
              <button
                type="button"
                className="font-mono text-brand underline-offset-2 hover:underline"
                onClick={() => setValue('err-expired')}
              >
                err-expired
              </button>
              ,{' '}
              <button
                type="button"
                className="font-mono text-brand underline-offset-2 hover:underline"
                onClick={() => setValue('err-redeemed')}
              >
                err-redeemed
              </button>
            </p>
          </details>
        ) : null}

        <div className="mt-10">
          <GovernedEntryNav current="credential" />
        </div>
      </div>
    </GovernedEntryLayout>
  );
}
