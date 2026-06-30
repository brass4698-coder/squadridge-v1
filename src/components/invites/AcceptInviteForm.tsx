// ============================================================
// AcceptInviteForm — account setup on valid invite
// ============================================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { acceptInvite } from '../../lib/invites';
import type { InviteValidationResult } from '../../types/invites';

interface Props {
  token: string;
  validation: InviteValidationResult;
}

export function AcceptInviteForm({ token, validation }: Props) {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lockedEmail = validation.email ?? '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    setLoading(true);

    // Create account via Supabase auth
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: lockedEmail,
        password,
        options: { data: { display_name: displayName } },
      });

    if (signUpError || !signUpData.user) {
      setError(signUpError?.message ?? 'Sign up failed. Please try again.');
      setLoading(false);
      return;
    }

    const result = await acceptInvite(token, signUpData.user.id, displayName);

    if (!result.success) {
      setError(result.error ?? 'Failed to accept invite.');
      setLoading(false);
      return;
    }

    navigate(result.dashboard ?? '/app', { replace: true });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-sq-text mb-1">
          Email
        </label>
        <input
          type="email"
          value={lockedEmail}
          readOnly
          className="input-field bg-sq-surface-offset cursor-not-allowed w-full"
          aria-label="Email address (locked to invite)"
        />
      </div>

      <div>
        <label htmlFor="display-name" className="block text-sm font-medium text-sq-text mb-1">
          Display Name
        </label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          autoComplete="name"
          className="input-field w-full"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-sq-text mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="input-field w-full"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-sq-text mb-1">
          Confirm Password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="input-field w-full"
        />
      </div>

      {error && (
        <p role="alert" className="text-sq-error text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? 'Setting up…' : 'Create account & continue'}
      </button>
    </form>
  );
}
