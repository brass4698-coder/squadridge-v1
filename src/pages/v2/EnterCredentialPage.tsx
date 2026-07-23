import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GovernedEntryLayout } from '../../components/shell/GovernedEntryLayout';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { copyForInviteReason } from '../../lib/inviteInvalidCopy';
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
    const next = await validateGovernedCredential(value.trim());
    setResult(next);
    setBusy(false);
  }

  return (
    <GovernedEntryLayout title="Invitation credential">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-h2 font-medium text-ink">Enter invitation credential</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
          Invitation credentials are issued for specific rooms, roles, and pilot scopes — not for
          open signup.
        </p>

        <form className="mt-8 space-y-4" onSubmit={(e) => void onValidate(e)}>
          <FormField id="credential" label="Credential or invitation token">
            <Input
              id="credential"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Paste invitation hash or token"
              autoComplete="off"
              required
              className="h-11 font-mono text-sm"
            />
          </FormField>
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
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setValue(text.trim());
                } catch {
                  /* paste permission denied */
                }
              }}
            >
              Paste from clipboard
            </button>
          </div>
        </form>

        <p className="mt-4 text-sm text-ink-faint">
          Prefer camera handoff?{' '}
          <Link to="/enter/qr" className="text-brand">
            Scan invitation QR
          </Link>
        </p>

        {result?.ok ? (
          <div className="mt-8 rounded-lg border border-line bg-surface-elevated p-5" role="status">
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
            className="mt-8 rounded-lg border border-sem-danger/40 bg-sem-danger-soft p-5"
            role="alert"
          >
            <p className="m-0 font-medium text-ink">{errorCopy.title}</p>
            <p className="mt-2 mb-0 text-sm text-ink-secondary">{errorCopy.body}</p>
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

        <details className="mt-10 text-sm text-ink-faint">
          <summary className="cursor-pointer text-ink-secondary">Demo credentials</summary>
          <ul className="mt-2 list-disc pl-5">
            {DEMO_CREDENTIALS.map((c) => (
              <li key={c.token}>
                <button
                  type="button"
                  className="font-mono text-brand underline-offset-2 hover:underline"
                  onClick={() => setValue(c.token)}
                >
                  {c.token}
                </button>{' '}
                — {c.label}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </GovernedEntryLayout>
  );
}
