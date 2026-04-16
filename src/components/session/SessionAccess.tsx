import { useParams } from 'react-router-dom';
import { RequireAuth } from '../auth/RequireAuth';
import { SessionPage } from '../../pages/SessionPage';

/**
 * `/session` landing stays public; active squad rooms (`/session/:id`) require sign-in and a complete profile.
 * `/session/demo-session-001` is handled by a separate route (`DemoSessionPage`).
 */
export function SessionAccess() {
  const { squadId: squadIdParam } = useParams<{ squadId?: string }>();
  const squadId =
    squadIdParam !== undefined && squadIdParam !== null && String(squadIdParam).trim().length > 0
      ? String(squadIdParam).trim()
      : undefined;

  return !squadId ? (
    <SessionPage />
  ) : (
    <RequireAuth requireCompleteProfile>
      <SessionPage />
    </RequireAuth>
  );
}
