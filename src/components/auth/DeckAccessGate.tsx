import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { checkDeckAccess, redeemDeckInvite } from '../../lib/deckAccess';
import { canAccessRoute } from '../../lib/guards';

/**
 * Auth + grant gate for pitch materials.
 * super_admin always passes; others need a redeemed deck_access_grants row.
 */
export function DeckAccessGate({ children }: { children: ReactNode }) {
  const { user, roles, initialized } = useAuthContext();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      setAllowed(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      if (canAccessRoute(roles, ['super_admin'])) {
        if (!cancelled) setAllowed(true);
        return;
      }

      if (inviteToken) {
        const redeemed = await redeemDeckInvite(inviteToken);
        if (!redeemed.ok) {
          if (!cancelled) {
            setRedeemError(redeemed.error ?? 'Invite could not be redeemed');
            setAllowed(false);
          }
          return;
        }
      }

      const ok = await checkDeckAccess();
      if (!cancelled) setAllowed(ok);
    })();

    return () => {
      cancelled = true;
    };
  }, [initialized, user, roles, inviteToken]);

  if (!initialized || allowed === null) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center bg-surface text-sm text-ink-secondary"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        Checking briefing access…
      </div>
    );
  }

  if (!user) {
    const next = inviteToken ? `/decks?invite=${encodeURIComponent(inviteToken)}` : '/decks';
    return <Navigate to={`/sign-in?next=${encodeURIComponent(next)}`} replace />;
  }

  if (!allowed) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16 text-center">
        <p className="sr-meta-label">Briefings</p>
        <h1 className="mt-3 font-heading text-h2 text-ink">Invite required</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
          {redeemError
            ? 'That briefing invite could not be used with this account. Sign in with the invited email, or request access.'
            : 'Pitch materials are shared by invitation only. Request a briefing if you have a serious evaluation underway.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/briefings" className="btn-institutional btn-institutional--ghost">
            Briefing overview
          </Link>
          <Link to="/request-access" className="btn-institutional btn-institutional--primary">
            Request access
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
