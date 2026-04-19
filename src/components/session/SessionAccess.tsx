import { useParams } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import { SessionHubPage } from '../../pages/SessionHubPage';
import { SessionPage } from '../../pages/SessionPage';

/**
 * `/session` hub stays public; active squad rooms (`/session/:id`) require sign-in and a complete profile.
 * `/session/demo-session-001` is served by `DemoSessionPage` in `App.tsx` (declared before this route).
 */
export function SessionAccess() {
  const { squadId: squadIdParam } = useParams<{ squadId?: string }>();
  const squadId =
    squadIdParam !== undefined && squadIdParam !== null && String(squadIdParam).trim().length > 0
      ? String(squadIdParam).trim()
      : undefined;

  if (!squadId) {
    return <SessionHubPage />;
  }

  return (
    <RequireAuth requireCompleteProfile>
      <SessionPage squadId={squadId} />
    </RequireAuth>
  );
}
