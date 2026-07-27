import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AccountPageShell, AccountPanel } from '../components';
import { RouteSkeleton } from '../components/system/RouteSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib';
import { resolvePostAuthPath, safeNextPath } from '../lib/postAuthRouting';

function signInHref(nextPath: string, reason: 'link' | 'invalid' = 'link'): string {
  const next = nextPath !== '/' ? `next=${encodeURIComponent(nextPath)}&` : '';
  return `/sign-in?${next}reason=${reason}`;
}

/**
 * OAuth / magic-link return handler. Supabase parses tokens from the URL (`detectSessionInUrl` on the client).
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const explicitNext = searchParams.get('next');
  const authError = searchParams.get('error');
  const errorCode = searchParams.get('error_code');
  const { supabase, session, profile, roles, loading, initialized } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigated = useRef(false);

  const nextPath = useMemo(
    () =>
      resolvePostAuthPath({
        session,
        profile,
        roles,
        explicitNext: explicitNext ? safeNextPath(explicitNext, '') : null,
      }),
    [session, profile, roles, explicitNext],
  );

  useEffect(() => {
    if (!authError && !errorCode) return;
    navigate(signInHref(nextPath === '/sign-in' ? '/' : nextPath, 'invalid'), {
      replace: true,
    });
  }, [authError, errorCode, navigate, nextPath]);

  const attemptNavigation = useCallback(() => {
    if (navigated.current || !session || !initialized || loading) return;
    navigated.current = true;
    navigate(nextPath, { replace: true });
  }, [navigate, nextPath, session, initialized, loading]);

  useEffect(() => {
    attemptNavigation();
  }, [attemptNavigation]);

  useEffect(() => {
    if (!supabase) return;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) attemptNavigation();
    });

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) attemptNavigation();
    });

    const timer = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data: { session: s } }) => {
        if (!navigated.current && !s) {
          setError(
            'We could not finish signing you in. The magic link may have expired or already been used — request a new link from Sign in.',
          );
        }
      });
    }, 12_000);

    return () => {
      sub.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, [supabase, attemptNavigation]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-copy px-gutter py-14 font-sans text-[0.95rem] text-ink-muted">
        Supabase is not configured.
      </div>
    );
  }

  if (authError || errorCode) {
    return (
      <AccountPageShell>
        <RouteSkeleton label="Returning to sign-in" />
      </AccountPageShell>
    );
  }

  if (!initialized || loading || (session && !navigated.current && !error)) {
    return (
      <AccountPageShell>
        <RouteSkeleton label="Finishing sign-in" />
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell>
      <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
        Account
      </p>
      <h1
        className="mt-2 font-heading font-extrabold text-ink"
        style={{
          fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
        }}
      >
        Finishing sign-in…
      </h1>
      {error ? (
        <div className="mt-8 space-y-5">
          <AccountPanel className="border border-line bg-surface-sunken">
            <p
              className="mb-0 font-sans text-[0.9rem] leading-relaxed text-ink-secondary"
              role="alert"
            >
              {error}
            </p>
          </AccountPanel>
          <p className="mb-0 font-sans text-[0.85rem] text-ink-muted">
            Passwordless accounts only—we&apos;ll email you a new one-time link.
          </p>
          <Link
            to={signInHref(nextPath, 'invalid')}
            className="inline-flex font-sans text-[0.9rem] font-medium text-teal-light underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <p className="mt-6 font-sans text-[0.95rem] leading-relaxed text-ink-muted">
          Securing your session…
        </p>
      )}
    </AccountPageShell>
  );
}
