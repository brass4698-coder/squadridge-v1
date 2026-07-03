import { Link } from 'react-router-dom';
import { appRoutes } from '../../lib/appRoutes';

/** Workspace-level participants hub until Phase 4 adds a cross-session roster. */
export function ParticipantsIndexPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <h1 className="text-xl font-semibold tracking-tight text-ink">Participants</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
        Participant approvals and verification are managed per session. Open a session to review
        invites, approve identities, and track attendance.
      </p>
      <Link
        to={appRoutes.sessions}
        className="mt-6 inline-flex min-h-[40px] items-center rounded-lg bg-brand px-4 text-sm font-medium text-brand-on"
      >
        View sessions
      </Link>
    </div>
  );
}
