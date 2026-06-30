// ============================================================
// InviteAdminPanel — create + revoke invites (admin/facilitator)
// ============================================================
import React, { useEffect, useState } from 'react';
import { createInvite, revokeInvite, listInvites } from '../../lib/invites';
import type { Invite, InviteType } from '../../types/invites';
import type { RoleKey } from '../../types/roles';
import { ROLE_LABELS } from '../../types/roles';

const INVITE_TYPES: InviteType[] = [
  'participant','facilitator','mediator','analyst','institution_admin','observer','super_admin',
];

export function InviteAdminPanel() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [email, setEmail] = useState('');
  const [inviteType, setInviteType] = useState<InviteType>('participant');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInvites = async () => {
    const data = await listInvites();
    setInvites(data);
  };

  useEffect(() => { void loadInvites(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const result = await createInvite({
      email,
      invite_type: inviteType,
      role_key: inviteType as RoleKey,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Failed to create invite.');
      return;
    }
    setSuccess(`Invite created. Token: ${result.token}`);
    setEmail('');
    void loadInvites();
  }

  async function handleRevoke(id: string) {
    const result = await revokeInvite(id);
    if (!result.success) {
      setError(result.error ?? 'Failed to revoke.');
      return;
    }
    void loadInvites();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-sq-text">Invite Management</h2>

      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label htmlFor="invite-email" className="block text-sm font-medium text-sq-text mb-1">Email</label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field w-full"
          />
        </div>
        <div>
          <label htmlFor="invite-type" className="block text-sm font-medium text-sq-text mb-1">Role</label>
          <select
            id="invite-type"
            value={inviteType}
            onChange={(e) => setInviteType(e.target.value as InviteType)}
            className="input-field w-full"
          >
            {INVITE_TYPES.map((t) => (
              <option key={t} value={t}>{ROLE_LABELS[t as RoleKey] ?? t}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Sending…' : 'Send Invite'}
        </button>
      </form>

      {success && <p className="text-sq-success text-sm">{success}</p>}
      {error && <p className="text-sq-error text-sm">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sq-border text-sq-muted text-left">
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Expires</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((inv) => (
              <tr key={inv.id} className="border-b border-sq-border">
                <td className="py-2 pr-4">{inv.email}</td>
                <td className="py-2 pr-4">{inv.role_key}</td>
                <td className="py-2 pr-4">{new Date(inv.expires_at).toLocaleDateString()}</td>
                <td className="py-2 pr-4">
                  {inv.used_at ? '\u2713 Used' : inv.revoked_at ? 'Revoked' : 'Pending'}
                </td>
                <td className="py-2">
                  {!inv.used_at && !inv.revoked_at && (
                    <button
                      onClick={() => handleRevoke(inv.id)}
                      className="text-sq-error text-xs hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invites.length === 0 && (
          <p className="text-sq-muted text-sm py-4">No invites yet.</p>
        )}
      </div>
    </div>
  );
}
