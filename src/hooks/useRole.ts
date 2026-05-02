import { useAuth } from '../contexts/AuthContext';
import { useIsModerator } from './useIsModerator';

/**
 * useRole — typed role enum for the application.
 *
 * Phase 1/2: a minimal heuristic on top of the existing `useIsModerator`
 * Supabase check. We can already distinguish:
 *   - visitor   — no session
 *   - participant — signed-in user, not a moderator
 *   - moderator — row in `moderators` table
 *
 * Phase 3 promotes this hook to a richer query against a `user_roles` table
 * so we can also distinguish facilitator / partner / admin without losing
 * the gate semantics admin pages already use.
 */

export type Role = 'visitor' | 'participant' | 'facilitator' | 'moderator' | 'partner' | 'admin';

export type UseRoleResult = {
  role: Role;
  /** Convenience predicates so call-sites stay terse. */
  isVisitor: boolean;
  isAuthed: boolean;
  isModerator: boolean;
  isStaff: boolean;
  /** Underlying queries are still resolving. */
  loading: boolean;
};

export function useRole(): UseRoleResult {
  const { session, loading: authLoading } = useAuth();
  const { data: isModerator, isPending: modPending } = useIsModerator();

  const loading = authLoading || (Boolean(session) && modPending);
  const authed = Boolean(session);

  const role: Role = !authed ? 'visitor' : isModerator ? 'moderator' : 'participant';
  /* Phase 3 widens this to facilitator / partner / admin via a `user_roles`
   * read; until then `isStaff` and `isModerator` are equivalent here. */
  const staff = role === 'moderator';

  return {
    role,
    isVisitor: role === 'visitor',
    isAuthed: authed,
    isModerator: staff,
    isStaff: staff,
    loading,
  };
}
