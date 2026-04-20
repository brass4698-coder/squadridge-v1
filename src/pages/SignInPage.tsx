import { useEffect, useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AccountPageShell, AccountPanel } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib';

export function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextRaw = searchParams.get('next');
  const reason = searchParams.get('reason');
  const nextPath = useMemo(
    () =>
      nextRaw && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
        ? decodeURIComponent(nextRaw)
        : '/',
    [nextRaw],
  );

  const { signIn, session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const configured = isSupabaseConfigured();
  const showLinkHelpBanner = reason === 'link';

  useEffect(() => {
    if (!loading && session) {
      navigate(nextPath, { replace: true });
    }
  }, [loading, session, navigate, nextPath]);

  if (!loading && session) {
    return (
      <AccountPageShell>
        <p className="font-sans text-[0.95rem] text-ink-muted">Continuing…</p>
      </AccountPageShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: err } = await signIn(email, {
      nextPath: nextPath !== '/' ? nextPath : undefined,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  if (!configured) {
    return (
      <div className="relative mx-auto w-full max-w-copy px-md py-12">
        <p className="font-sans text-body-lg text-ink-muted">
          Supabase is not configured. Add{' '}
          <code className="text-teal-light/90">VITE_SUPABASE_URL</code> and a publishable or anon
          key to use sign-in.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-sm font-medium text-teal-light underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
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
          fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        Sign in
      </h1>
      <p className="mt-4 font-sans text-[0.95rem] leading-relaxed text-ink-muted">
        New here? Use the same email—we send a one-time link. First time signs you in. No password
        stored on our side.
      </p>

      {showLinkHelpBanner ? (
        <div
          className="mt-6 rounded-lg border border-amber/30 bg-amber/[0.06] px-4 py-3 font-sans text-[0.85rem] leading-snug text-[#fcd9a8]"
          role="status"
        >
          No password to reset—enter your email below and we&apos;ll send a fresh magic link.
        </div>
      ) : null}

      {sent ? (
        <AccountPanel className="mt-10">
          <p className="mb-0 font-sans text-[0.95rem] text-ink-secondary">
            Check your inbox for the sign-in link. After you open it, you&apos;ll return here and
            we&apos;ll route you
            {nextPath !== '/' ? ' to your squad room.' : '.'}
          </p>
        </AccountPanel>
      ) : (
        <form className="mt-10" onSubmit={(e) => void handleSubmit(e)} noValidate>
          <AccountPanel className="space-y-5">
            {error ? (
              <p className="font-sans text-[0.875rem] text-amber" role="alert">
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <label
                htmlFor="signin-email"
                className="block font-sans text-[0.8rem] font-medium text-ink-secondary"
              >
                Email
              </label>
              <input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-ink-secondary placeholder:text-ink-subtle focus-visible:border-teal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/20"
                placeholder="you@organization.org"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-[44px] w-full items-center justify-center border-0 bg-teal px-6 py-3 font-heading text-[0.95rem] font-semibold text-navy transition-opacity hover:opacity-[0.92] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderRadius: 8 }}
            >
              {busy ? 'Sending link…' : 'Email me a link'}
            </button>
          </AccountPanel>
        </form>
      )}

      {!sent ? (
        <p className="mt-6 font-sans text-[0.8rem] leading-relaxed text-ink-subtle">
          Link expired? Enter your email again—we&apos;ll send a fresh link. There is no separate
          password to recover.
        </p>
      ) : null}

      <nav
        className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-8 font-sans text-[0.85rem] text-ink-subtle"
        aria-label="Account help"
      >
        <Link
          to="/security"
          className="inline-flex items-center gap-2 text-ink-muted underline-offset-4 transition-colors hover:text-ink-secondary hover:underline"
        >
          <Shield className="size-3 shrink-0 opacity-50" aria-hidden />
          Security &amp; privacy
        </Link>
        <Link
          to="/"
          className="w-fit text-ink-muted underline-offset-4 transition-colors hover:text-ink-secondary hover:underline"
        >
          Back to home
        </Link>
      </nav>
    </AccountPageShell>
  );
}
