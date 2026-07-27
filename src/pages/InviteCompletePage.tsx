import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TokenShell } from '../components/layout/TokenShell';
import { RouteSkeleton } from '../components/system/RouteSkeleton';
import { useAuthContext } from '../contexts/AuthContext';
import { completePendingInvite } from '../lib/completePendingInvite';
import { isSupabaseConfigured } from '../lib/env';
import { resolvePostAuthPath } from '../lib/postAuthRouting';

/**
 * Finishes invite acceptance after magic-link sign-in when
 * `savePendingInvite` was used on `/invite/accept/:token`.
 */
export function InviteCompletePage() {
  const navigate = useNavigate();
  const { session, profile, roles, loading, initialized, refreshProfile, refreshRoles } =
    useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!initialized || loading || started.current) return;
    if (!session) {
      navigate('/sign-in?reason=link', { replace: true });
      return;
    }

    started.current = true;

    void (async () => {
      const result = await completePendingInvite(session);
      if (result.ok) {
        await Promise.all([refreshProfile(), refreshRoles()]);
        navigate(result.dashboard, { replace: true });
        return;
      }

      if (result.reason === 'email_mismatch') {
        setError(result.error);
        return;
      }

      // Pending invite missing — user may have already completed; route normally.
      if (result.error.includes('No pending invite')) {
        const path = resolvePostAuthPath({ session, profile, roles });
        navigate(path, { replace: true });
        return;
      }

      setError(result.error);
    })();
  }, [initialized, loading, session, profile, roles, navigate, refreshProfile, refreshRoles]);

  if (!isSupabaseConfigured()) {
    return (
      <TokenShell>
        <p className="px-6 py-16 text-sm" style={{ color: 'var(--sr-ink-secondary)' }}>
          Supabase is not configured.
        </p>
      </TokenShell>
    );
  }

  if (error) {
    return (
      <TokenShell>
        <div className="mx-auto max-w-md px-6 py-16 text-center">
          <p role="alert" className="text-sm" style={{ color: 'var(--sr-ink)' }}>
            {error}
          </p>
          <Link
            to="/sign-in"
            className="mt-6 inline-block text-sm"
            style={{ color: 'var(--sr-primary)' }}
          >
            Back to sign in
          </Link>
        </div>
      </TokenShell>
    );
  }

  return (
    <TokenShell>
      <RouteSkeleton label="Activating your invitation" />
    </TokenShell>
  );
}
