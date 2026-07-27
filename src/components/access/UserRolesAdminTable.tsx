// ============================================================
// UserRolesAdminTable — admin console for out-of-band role management
//
// Reads: `list_users_with_roles` RPC
// Writes: `grant_role_to_user` / `revoke_role_from_user` RPCs
//         (see supabase/migrations/20260703_001_role_management_rpcs.sql)
//
// Design notes:
// - `super_admin` grants/revokes are still blocked at the RPC level to
//   non-super_admin actors; we surface those failures in the row error
//   rather than pre-filtering in the UI.
// - Scope selectors (workspace / institution) are omitted from this v1 UI
//   because the invite-only auth model rarely uses scoped grants; add
//   inputs when a workflow needs them.
// - Server-side RLS on `user_roles` denies direct client writes; these
//   RPCs are the only path.
// ============================================================
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  grantRoleToUser,
  listUsersWithRoles,
  revokeRoleFromUser,
  type UserWithRoles,
} from '../../lib/roles';
import type { RoleKey } from '../../types/roles';
import { ROLE_LABELS, ROLE_PRIORITY } from '../../types/roles';

const GRANTABLE_ROLES: RoleKey[] = ROLE_PRIORITY;

export function UserRolesAdminTable() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowMessages, setRowMessages] = useState<Record<string, string>>({});
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [grantRoleByUser, setGrantRoleByUser] = useState<Record<string, RoleKey>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const rows = await listUsersWithRoles();
    setUsers(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedRoleFor = useCallback(
    (userId: string): RoleKey => grantRoleByUser[userId] ?? 'observer',
    [grantRoleByUser],
  );

  async function handleGrant(userId: string) {
    const role = selectedRoleFor(userId);
    const key = `${userId}:grant:${role}`;
    setPendingKey(key);
    setRowMessages((m) => ({ ...m, [userId]: '' }));
    const result = await grantRoleToUser(userId, role);
    setPendingKey(null);
    if (!result.success) {
      setRowMessages((m) => ({ ...m, [userId]: result.error ?? 'Grant failed.' }));
      return;
    }
    setRowMessages((m) => ({ ...m, [userId]: `Granted ${ROLE_LABELS[role]}.` }));
    void load();
  }

  async function handleRevoke(userId: string, roleKey: RoleKey) {
    const key = `${userId}:revoke:${roleKey}`;
    setPendingKey(key);
    setRowMessages((m) => ({ ...m, [userId]: '' }));
    const result = await revokeRoleFromUser(userId, roleKey);
    setPendingKey(null);
    if (!result.success) {
      const label =
        result.error ?? (result.reason === 'not_found' ? 'Role not found.' : 'Revoke failed.');
      setRowMessages((m) => ({ ...m, [userId]: label }));
      return;
    }
    setRowMessages((m) => ({ ...m, [userId]: `Revoked ${ROLE_LABELS[roleKey]}.` }));
    void load();
  }

  const summary = useMemo(() => {
    if (users.length === 0) return null;
    return `${users.length} user${users.length === 1 ? '' : 's'}`;
  }, [users]);

  if (loading) {
    return (
      <p className="text-sm text-sq-muted" role="status">
        Loading users…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-sq-text">User roles</h2>
        {summary ? <span className="text-xs text-sq-muted">{summary}</span> : null}
      </div>

      {error ? (
        <p className="text-sm text-sq-error" role="alert">
          {error}
        </p>
      ) : null}

      {users.length === 0 ? (
        <p className="text-sm text-sq-muted py-4">
          No users visible. This view is admin-scoped — verify your role if you expected to see
          rows.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sq-border text-left text-sq-muted">
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Current roles</th>
                <th className="py-2">Grant / revoke</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const message = rowMessages[u.user_id];
                const grantKey = `${u.user_id}:grant:${selectedRoleFor(u.user_id)}`;
                return (
                  <tr key={u.user_id} className="border-b border-sq-border align-top">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-sq-text">
                        {u.display_name ?? u.email ?? u.user_id}
                      </div>
                      {u.display_name && u.email ? (
                        <div className="text-xs text-sq-muted">{u.email}</div>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 capitalize text-sq-muted">{u.status}</td>
                    <td className="py-3 pr-4">
                      {u.roles.length === 0 ? (
                        <span className="text-xs text-sq-muted">none</span>
                      ) : (
                        <ul className="flex flex-col gap-1">
                          {u.roles.map((r) => (
                            <li
                              key={`${r.role_key}:${r.workspace_id ?? ''}:${r.institution_id ?? ''}`}
                              className="flex items-center gap-2"
                            >
                              <span className="rounded bg-sq-border px-2 py-0.5 text-xs">
                                {ROLE_LABELS[r.role_key as RoleKey] ?? r.role_key}
                              </span>
                              <button
                                type="button"
                                className="text-xs text-sq-error hover:underline disabled:opacity-50"
                                disabled={pendingKey === `${u.user_id}:revoke:${r.role_key}`}
                                onClick={() => void handleRevoke(u.user_id, r.role_key as RoleKey)}
                              >
                                Revoke
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <label htmlFor={`grant-${u.user_id}`} className="sr-only">
                          Role to grant to {u.email ?? u.user_id}
                        </label>
                        <select
                          id={`grant-${u.user_id}`}
                          className="input-field"
                          value={selectedRoleFor(u.user_id)}
                          onChange={(e) =>
                            setGrantRoleByUser((prev) => ({
                              ...prev,
                              [u.user_id]: e.target.value as RoleKey,
                            }))
                          }
                        >
                          {GRANTABLE_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn-primary text-xs px-3 py-1 disabled:opacity-50"
                          disabled={pendingKey === grantKey}
                          onClick={() => void handleGrant(u.user_id)}
                        >
                          {pendingKey === grantKey ? 'Granting…' : 'Grant'}
                        </button>
                      </div>
                      {message ? (
                        <p
                          className={
                            'mt-1 text-xs ' +
                            (message.startsWith('Granted') || message.startsWith('Revoked')
                              ? 'text-sq-success'
                              : 'text-sq-error')
                          }
                          role="status"
                        >
                          {message}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
