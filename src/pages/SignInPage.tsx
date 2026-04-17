import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib';

export function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextRaw = searchParams.get('next');
  const nextPath =
    nextRaw && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
      ? decodeURIComponent(nextRaw)
      : '/';

  const { signIn, session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!loading && session) {
      navigate(nextPath, { replace: true });
    }
  }, [loading, session, navigate, nextPath]);

  if (!loading && session) {
    return (
      <div className="relative mx-auto w-full max-w-[440px] px-md py-14 font-sans text-[0.95rem] text-[#8892a4]">
        Continuing…
      </div>
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
        <p className="font-sans text-body-lg text-[#8892a4]">
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
    <div className="relative mx-auto w-full max-w-[440px] px-md py-14">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(38vh,24rem)] bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(0,194,178,0.06)_0%,transparent_58%)]"
        aria-hidden
      />
      <div className="relative z-[1]">
        <p className="mb-0 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-teal/80">
          Account
        </p>
        <h1
          className="mt-2 font-heading font-extrabold text-[#f1f5f9]"
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Sign in
        </h1>
        <p className="mt-4 font-sans text-[0.95rem] leading-relaxed text-[#8892a4]">
          We&apos;ll email you a one-time link. No password stored on our side.
        </p>

        {sent ? (
          <div className="mt-10 rounded-lg border border-[#1e2a3a] bg-[#0f1623] px-5 py-6">
            <p className="mb-0 font-sans text-[0.95rem] text-[#c4cdd9]">
              Check your inbox for the sign-in link. After you open it, you&apos;ll return here and
              we&apos;ll route you
              {nextPath !== '/' ? ' to your squad room.' : '.'}
            </p>
          </div>
        ) : (
          <form className="mt-10 space-y-5" onSubmit={(e) => void handleSubmit(e)} noValidate>
            {error ? (
              <p className="font-sans text-[0.875rem] text-amber" role="alert">
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <label
                htmlFor="signin-email"
                className="block font-sans text-[0.8rem] font-medium text-[#a8b2c1]"
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
                className="w-full rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(0,194,178,0.12)]"
                placeholder="you@organization.org"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-[44px] w-full items-center justify-center border-0 bg-teal px-6 py-3 font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity hover:opacity-[0.92] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderRadius: 8 }}
            >
              {busy ? 'Sending link…' : 'Email me a link'}
            </button>
          </form>
        )}

        <p className="mt-10 font-sans text-[0.85rem] text-[#4b5563]">
          <Link
            to="/"
            className="text-[#8892a4] underline-offset-4 hover:text-[#c4cdd9] hover:underline"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
