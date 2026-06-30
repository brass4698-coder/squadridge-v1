// ============================================================
// AccessRequestAdminTable — admin review of access requests
// ============================================================
import React, { useEffect, useState } from 'react';
import { listAccessRequests, approveAccessRequest } from '../../lib/accessRequests';
import type { AccessRequest } from '../../types/invites';

export function AccessRequestAdminTable() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await listAccessRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  async function handleApprove(req: AccessRequest) {
    const roleKey = req.role_requested ?? 'participant';
    const result = await approveAccessRequest(req.id, roleKey);
    if (!result.success) {
      setError(result.error ?? 'Approval failed.');
      return;
    }
    void load();
  }

  if (loading) return <p className="text-sq-muted text-sm">Loading requests…</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-sq-text">Access Requests</h2>
      {error && <p className="text-sq-error text-sm">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sq-border text-sq-muted text-left">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Org</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-sq-border">
                <td className="py-2 pr-4">{req.full_name}</td>
                <td className="py-2 pr-4">{req.email}</td>
                <td className="py-2 pr-4">{req.organization ?? '\u2014'}</td>
                <td className="py-2 pr-4">{req.role_requested ?? '\u2014'}</td>
                <td className="py-2 pr-4 capitalize">{req.status}</td>
                <td className="py-2">
                  {req.status === 'submitted' && (
                    <button
                      onClick={() => handleApprove(req)}
                      className="btn-primary text-xs px-3 py-1"
                    >
                      Approve &amp; Invite
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="text-sq-muted text-sm py-4">No access requests.</p>
        )}
      </div>
    </div>
  );
}
