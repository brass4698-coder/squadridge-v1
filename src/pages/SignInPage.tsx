import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { appRoutes } from '../lib/appRoutes';
import { isSupabaseConfigured } from '../lib';

export function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextRaw = searchParams.get('next');
  const reason = searchParams.get('reason');
  const intent = searchParams.get('intent');
  const nextPath =
    nextRaw && nextRaw.startsWith('/') && !nextRaw.startsWith('//')
      ? decodeURIComponent(nextRaw)
      : appRoutes.dashboard;

  const { signIn, session, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const configured = isSupabaseConfigured();
  const isSignup = intent === 'signup';
  const showLinkHelpBanner = reason === 'link';
  const showExpiredBanner = reason === 'expired';
  const showSignedOutBanner = reason === 'signed-out';

  useEffect(() => {
    if (!loading && session) {
      navigate(nextPath, { replace: true });
    }
  }, [loading, session, navigate, nextPath]);

  if (!loading && session) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: err } = await signIn(email, {
      nextPath: nextPath !== appRoutes.dashboard ? nextPath : undefined,
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
      <div className="relative mx-auto w-full max-w-copy px-gutter py-12">
        <p className="font-sans text-body-lg text-ink-muted">
          Supabase is not configured. Add{' '}
          <code className="text-teal-light/90">VITE_SUPABASE_URL</code> and a publishable or anon
          key to use sign-in.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-sm font-medium text-brand underline-offset-4 hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <AuthLayout>
      <p className="text-app-meta font-semibold uppercase tracking-wider text-brand">Account</p>
      <h1 className="mt-2 text-page-title text-ink">
        {isSignup ? 'Create your account' : 'Sign in'}
      </h1>
      <p className="mt-3 text-app-body text-ink-secondary">
        {isSignup
          ? 'Enter your work email. We send a one-time link—no password stored on our side.'
          : 'Enter your email and we send a one-time sign-in link. First visit creates your account automatically.'}
      </p>

      {showLinkHelpBanner ? (
        <div
          className="mt-6 rounded-lg border border-sem-warning/30 bg-sem-warning-soft px-4 py-3 text-app-meta text-ink"
          role="status"
        >
          No password to reset—enter your email below and we&apos;ll send a fresh magic link.
        </div>
      ) : null}

      {showExpiredBanner ? (
        <div
          className="mt-6 rounded-lg border border-sem-warning/30 bg-sem-warning-soft px-4 py-3 text-app-meta text-ink"
          role="status"
        >
          This sign-in link has expired. Request a new link below.
        </div>
      ) : null}

      {showSignedOutBanner ? (
        <div
          className="mt-6 rounded-lg border border-line bg-surface-secondary px-4 py-3 text-app-meta text-ink-secondary"
          role="status"
        >
          You signed out successfully.
        </div>
      ) : null}

      {sent ? (
        <div className="mt-8 rounded-lg border border-line bg-surface-secondary p-5">
          <p className="text-app-body text-ink-secondary">
            Check your inbox for the sign-in link. After you open it, we&apos;ll route you
            {nextPath !== appRoutes.dashboard
              ? ' to your session workspace.'
              : ' to your dashboard.'}
          </p>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={(e) => void handleSubmit(e)} noValidate>
          {error ? (
            <p className="text-app-meta text-sem-danger" role="alert">
              {error}
            </p>
          ) : null}
          <FormField id="signin-email" label="Email">
            <Input
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@organization.org"
            />
          </FormField>
          <Button type="submit" className="w-full" size="lg" loading={busy}>
            Email me a link
          </Button>
        </form>
      )}

      {!sent ? (
        <p className="mt-6 text-app-meta text-ink-faint">
          Link expired? Enter your email again—we&apos;ll send a fresh link. There is no separate
          password to recover.
        </p>
      ) : null}

      <nav
        className="mt-10 flex flex-col gap-3 border-t border-line pt-8 text-app-meta text-ink-secondary"
        aria-label="Account help"
      >
        <Link
          to="/security"
          className="inline-flex items-center gap-2 underline-offset-4 hover:text-ink hover:underline"
        >
          <Shield className="size-3 shrink-0 opacity-50" aria-hidden />
          Security &amp; privacy
        </Link>
        <Link to="/" className="w-fit underline-offset-4 hover:text-ink hover:underline">
          Back to home
        </Link>
      </nav>
    </AuthLayout>
  );
}
