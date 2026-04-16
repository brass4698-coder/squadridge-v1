import { Navigate, useParams } from 'react-router-dom';
import { isDemoSquadShortcutsEnabled } from '../../lib/env';
import { RequireAuth } from '../auth/RequireAuth';
import { SessionHubPage } from '../../pages/SessionHubPage';
import { SessionPage } from '../../pages/SessionPage';

/**
 * `/session` hub stays public; active squad rooms (`/session/:id`) require sign-in and a complete profile.
 * `/session/demo-session-001` is handled by `DemoSessionPage` when demo shortcuts are enabled.
 */
export function SessionAccess() {
  const { squadId: squadIdParam } = useParams<{ squadId?: string }>();
  const squadId =
    squadIdParam !== undefined && squadIdParam !== null && String(squadIdParam).trim().length > 0
      ? String(squadIdParam).trim()
      : undefined;

  if (squadId === 'demo-session-001' && !isDemoSquadShortcutsEnabled()) {
    return <Navigate to="/session" replace />;
  }

  if (!squadId) {
    return <SessionHubPage />;
  }

  return (
    <RequireAuth requireCompleteProfile>
      <SessionPage squadId={squadId} />
    </RequireAuth>
  );
}
