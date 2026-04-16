import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/env';

function safeNextPath(raw: string | null): string {
  if (!raw) return '/';
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith('/') && !decoded.startsWith('//')) return decoded;
  } catch {
    /* ignore */
  }
  return '/';
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
          setError('Sign-in did not complete. The link may have expired—request a new one from Sign in.');
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
      <div className="mx-auto max-w-copy px-md py-14 font-sans text-[0.95rem] text-[#8892a4]">
        Supabase is not configured.
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[440px] px-md py-14">
      <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
        Account
      </p>
      <h1
        className="mt-2 font-heading font-extrabold text-[#f1f5f9]"
        style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)', letterSpacing: '-0.03em', lineHeight: 1.15 }}
      >
        Finishing sign-in…
      </h1>
      {error ? (
        <div className="mt-8 space-y-4">
          <p className="font-sans text-[0.9rem] text-amber" role="alert">
            {error}
          </p>
          <Link
            to={`/sign-in?next=${encodeURIComponent(nextPath)}`}
            className="inline-flex font-sans text-[0.9rem] font-medium text-teal-light underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <p className="mt-6 font-sans text-[0.95rem] leading-relaxed text-[#8892a4]">
          Securing your session…
        </p>
      )}
    </div>
  );
}
