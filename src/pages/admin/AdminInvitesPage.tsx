// ============================================================
// AdminInvitesPage — admin console for invite-only auth
//
// Route: /app/admin/invites  (guarded by RoleProtectedRoute in App.v2.tsx)
//
// Composes two existing panels:
//   - InviteAdminPanel        → create + revoke role-scoped invites
//   - AccessRequestAdminTable → review pending access requests
//
// Role granting in the invite-only model is done by issuing a role-scoped
// invite: `accept_invite` writes the target role into `user_roles`. This page
// therefore doubles as the "role management" surface for now. A future
// dedicated role-management view (list users → grant/revoke arbitrary roles
// out-of-band from invite acceptance) will need new RPCs — see follow-up.
// ============================================================
import { AccessRequestAdminTable } from '../../components/access/AccessRequestAdminTable';
import { InviteAdminPanel } from '../../components/invites/InviteAdminPanel';

export function AdminInvitesPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <header>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Invite management
        </h1>
        <p
          className="mt-2 max-w-[70ch] text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Issue role-scoped invites, revoke unused ones, and review pending access requests.
          Accepting an invite grants the target role via the
          <code
            className="mx-1 rounded px-1 font-mono text-xs"
            style={{
              backgroundColor: 'var(--color-border)',
              color: 'var(--color-text-secondary)',
            }}
          >
            accept_invite
          </code>
          RPC — server-side RLS is the authoritative gate.
        </p>
      </header>

      <section
        aria-labelledby="admin-invites-heading"
        className="rounded-lg border p-6"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <h2 id="admin-invites-heading" className="sr-only">
          Invite management
        </h2>
        <InviteAdminPanel />
      </section>

      <section
        aria-labelledby="admin-access-requests-heading"
        className="rounded-lg border p-6"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <h2 id="admin-access-requests-heading" className="sr-only">
          Access requests
        </h2>
        <AccessRequestAdminTable />
      </section>
    </div>
  );
}
