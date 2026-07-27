// ============================================================
// AcceptInviteForm — passwordless invite acceptance
// Saves pending invite, sends magic link, completes on callback.
// ============================================================
import { useState } from 'react';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { FormPanel } from '../ui/FormPanel';
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
      <FormPanel
        eyebrow="Invite"
        title="Check your inbox"
        description={
          <>
            Sign-in link sent to <strong className="text-ink">{lockedEmail}</strong>. After you open
            it, we&apos;ll activate your {roleLabel ? `${roleLabel} ` : ''}access and route you to
            your dashboard.
          </>
        }
      >
        <p className="text-sm text-ink-secondary" role="status">
          The link expires in about an hour.
        </p>
      </FormPanel>
    );
  }

  return (
    <FormPanel
      eyebrow="Invite"
      title="Accept invitation"
      description={
        roleLabel ? (
          <>
            Role: <span className="text-ink">{roleLabel}</span>
          </>
        ) : undefined
      }
      footer="SquadRidge uses passwordless sign-in. No password is stored on our side."
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4" noValidate>
        <FormField id="invite-email" label="Invited email" instrument>
          <Input
            id="invite-email"
            type="email"
            value={lockedEmail}
            readOnly
            aria-readonly="true"
            className="opacity-80"
          />
        </FormField>

        <FormField id="invite-display-name" label="Display name" instrument>
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
            className="rounded-[var(--sr-radius-md)] border border-sem-danger/40 bg-sem-danger-soft px-3 py-2 text-sm text-ink"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Email me a sign-in link
        </Button>
      </form>
    </FormPanel>
  );
}
