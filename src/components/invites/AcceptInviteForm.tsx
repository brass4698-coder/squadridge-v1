// ============================================================
// AcceptInviteForm — passwordless invite acceptance
// Saves pending invite, sends magic link, completes on callback.
// ============================================================
import { useState } from 'react';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { useAuthContext } from '../../contexts/AuthContext';
import { INVITE_COMPLETE_PATH } from '../../lib/completePendingInvite';
import { savePendingInvite } from '../../lib/pendingInvite';
import type { InviteValidationResult } from '../../types/invites';
import { ROLE_LABELS } from '../../types/roles';
import type { RoleKey } from '../../types/roles';

interface Props {
  token: string;
  validation: InviteValidationResult;
}

function isKnownRoleKey(key: string | undefined): key is RoleKey {
  return key !== undefined && key in ROLE_LABELS;
}

export function AcceptInviteForm({ token, validation }: Props) {
  const { signIn } = useAuthContext();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const lockedEmail = validation.email ?? '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }
    if (!lockedEmail) {
      setError('Invitation email is missing.');
      return;
    }

    setLoading(true);
    savePendingInvite({ token, displayName: displayName.trim(), email: lockedEmail });

    const { error: signInError } = await signIn(lockedEmail, { nextPath: INVITE_COMPLETE_PATH });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSent(true);
  }

  const roleLabel = isKnownRoleKey(validation.role_key)
    ? ROLE_LABELS[validation.role_key]
    : validation.role_key;

  if (sent) {
    return (
      <div
        className="rounded-lg border p-5"
        style={{ borderColor: 'var(--sr-line)', background: 'var(--sr-bg-secondary)' }}
        role="status"
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--sr-ink-secondary)' }}>
          Check your inbox for a sign-in link sent to{' '}
          <strong style={{ color: 'var(--sr-ink)' }}>{lockedEmail}</strong>. After you open it,
          we&apos;ll activate your {roleLabel ? `${roleLabel} ` : ''}access and route you to your
          dashboard.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
      <FormField id="invite-email" label="Invited email">
        <Input
          id="invite-email"
          type="email"
          value={lockedEmail}
          readOnly
          aria-readonly="true"
          className="opacity-80"
        />
      </FormField>

      {roleLabel ? (
        <p className="text-sm" style={{ color: 'var(--sr-ink-secondary)' }}>
          Role: <span style={{ color: 'var(--sr-ink)' }}>{roleLabel}</span>
        </p>
      ) : null}

      <FormField id="invite-display-name" label="Display name">
        <Input
          id="invite-display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          autoComplete="name"
          placeholder="How you appear in sessions"
        />
      </FormField>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border px-3 py-2 text-sm"
          style={{
            borderColor: 'color-mix(in oklch, var(--sr-danger) 30%, transparent)',
            background: 'var(--sr-danger-soft)',
            color: 'var(--sr-ink)',
          }}
        >
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Email me a sign-in link
      </Button>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--sr-ink-faint)' }}>
        SquadRidge uses passwordless sign-in. No password is stored on our side.
      </p>
    </form>
  );
}
