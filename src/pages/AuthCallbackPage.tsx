import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AccountPageShell, AccountPanel } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib';
import { appRoutes } from '../lib/appRoutes';

function safeNextPath(raw: string | null): string {
  if (!raw) return appRoutes.dashboard;
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith('/') && !decoded.startsWith('//')) return decoded;
  } catch {
    /* ignore */
  }
  return appRoutes.dashboard;
}

function signInHref(nextPath: string): string {
  const next = nextPath !== '/' ? `next=${encodeURIComponent(nextPath)}&` : '';
  return `/sign-in?${next}reason=link`;
}

/**
 * OAuth / magic-link return handler. Supabase parses tokens from the URL (`detectSessionInUrl` on the client).
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));

  const { supabase, session, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigated = useRef(false);

  const attemptNavigation = useCallback(() => {
    if (navigated.current) return;
    navigated.current = true;
    navigate(nextPath, { replace: true });
  }, [navigate, nextPath]);

  useEffect(() => {
    if (!authLoading && session) {
      attemptNavigation();
    }
  }, [authLoading, session, attemptNavigation]);

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
            'We could not finish signing you in. The magic link may have expired or already been used—request a new link from Sign in.',
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
          <AccountPanel className="border border-amber/25 bg-amber/[0.04]">
            <p className="mb-0 font-sans text-[0.9rem] leading-relaxed text-[#fcd9a8]" role="alert">
              {error}
            </p>
          </AccountPanel>
          <p className="mb-0 font-sans text-[0.85rem] text-ink-muted">
            Passwordless accounts only—we&apos;ll email you a new one-time link.
          </p>
          <Link
            to={signInHref(nextPath)}
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
