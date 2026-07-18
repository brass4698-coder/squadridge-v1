import { useEffect, useRef, useState } from 'react';
import { Play, Shield } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { InviteOnlyNotice } from '../components/auth/InviteOnlyNotice';
import { SquadRidgeLockup } from '../components/SquadRidgeWordmark';
import { RouteSkeleton } from '../components/system/RouteSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { appRoutes } from '../lib/appRoutes';
import { isSupabaseConfigured } from '../lib';
import { useDashboardRoute } from '../hooks/useDashboardRoute';
import { signInWithDemo, DEMO_EMAIL, isDemoLoginEnabled } from '../lib/demoLogin';
import { resolvePostAuthPath, safeNextPath } from '../lib/postAuthRouting';

/**
 * Sign in — Phase 5 redesign.
 *
 * Full-viewport centering, glowing teal border on the card, wordmark above
 * the form, cleaned-up label hierarchy (no shouty ACCOUNT eyebrow), and a
 * Demo Access button that goes straight to `signInWithPassword` against the
 * seeded demo user. Error visibility is gated on actual error state so the
 * "Failed to fetch" message no longer flashes on idle load.
 */
export function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextRaw = searchParams.get('next');
  const reason = searchParams.get('reason');
  const intent = searchParams.get('intent');
  const roleDashboard = useDashboardRoute();
  const nextPath = safeNextPath(nextRaw ? decodeURIComponent(nextRaw) : null, roleDashboard);

  const { signIn, session, loading, initialized, profile, roles } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const configured = isSupabaseConfigured();
  const isSignup = intent === 'signup';
  const showLinkHelpBanner = reason === 'link';
  const showExpiredBanner = reason === 'expired';
  const showSignedOutBanner = reason === 'signed-out';

  const redirected = useRef(false);

  useEffect(() => {
    if (!initialized || loading || !session || redirected.current) return;
    const destination = resolvePostAuthPath({
      session,
      profile,
      roles,
      explicitNext: nextRaw,
    });
    if (destination === '/sign-in') return;
    redirected.current = true;
    navigate(destination, { replace: true });
  }, [initialized, loading, session, profile, roles, nextRaw, navigate]);

  if (!initialized || loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full items-center justify-center px-6 py-12">
        <RouteSkeleton label="Checking session" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="mx-auto flex min-h-dvh w-full items-center justify-center px-6 py-12">
        <RouteSkeleton label="Signing you in" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const shouldForwardNext = Boolean(nextRaw) && nextPath !== appRoutes.dashboard;
    const { error: err } = await signIn(email, {
      nextPath: shouldForwardNext ? nextPath : undefined,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  }

  async function handleDemo() {
    setError(null);
    setDemoBusy(true);
    const result = await signInWithDemo();
    if (!result.ok) {
      setDemoBusy(false);
      setError(result.error);
      return;
    }
    // The useEffect above will handle navigation once session resolves.
  }

  if (!configured) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-sm text-ink-secondary">
          Supabase is not configured. Add{' '}
          <code
            className="rounded px-1 font-mono text-[0.8rem]"
            style={{ backgroundColor: 'var(--sr-line)', color: 'var(--sr-ink)' }}
          >
            VITE_SUPABASE_URL
          </code>{' '}
          and a publishable or anon key to use sign-in.
        </p>
        <Link to="/" className="mt-6 text-sm font-medium" style={{ color: 'var(--sr-primary)' }}>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full items-center justify-center px-6 py-12">
      <div
        className="animate-fade-in-up sr-glass-strong w-full max-w-[480px] rounded-[16px] p-8 md:p-10"
        style={{
          // Phase 6: blend teal (primary CTA colour) + electric blue (bg glow)
          // for a spectral border, layered over the deep-indigo canvas.
          borderColor: 'color-mix(in oklch, var(--sr-glow) 22%, var(--sr-line))',
          boxShadow:
            '0 0 0 1px color-mix(in oklch, var(--sr-primary) 18%, transparent), 0 20px 60px oklch(0 0 0 / 0.45), 0 0 90px color-mix(in oklch, var(--sr-glow) 10%, transparent), 0 0 140px color-mix(in oklch, var(--sr-accent-alt) 6%, transparent)',
        }}
      >
        {/* Wordmark — sits above the form as the visual anchor */}
        <div className="mb-8 text-ink">
          <SquadRidgeLockup size="lg" showTagline alt="SquadRidge — Facilitator Led Rooms" />
        </div>

        <h1 className="text-h2" style={{ color: 'var(--sr-ink)' }}>
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--sr-ink-secondary)' }}>
          {isSignup
            ? 'Enter your work email. We send a one-time link — no password stored on our side.'
            : 'Enter your email and we send a one-time sign-in link. First visit creates your account automatically.'}
        </p>

        <div className="mt-5">
          <InviteOnlyNotice />
        </div>

        {showLinkHelpBanner ? (
          <div
            className="mt-5 rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: 'color-mix(in oklch, var(--sr-warning) 30%, transparent)',
              background: 'var(--sr-warning-soft)',
              color: 'var(--sr-ink)',
            }}
            role="status"
          >
            No password to reset — enter your email below and we'll send a fresh magic link.
          </div>
        ) : null}

        {showExpiredBanner ? (
          <div
            className="mt-5 rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: 'color-mix(in oklch, var(--sr-warning) 30%, transparent)',
              background: 'var(--sr-warning-soft)',
              color: 'var(--sr-ink)',
            }}
            role="status"
          >
            This sign-in link has expired. Request a new link below.
          </div>
        ) : null}

        {showSignedOutBanner ? (
          <div
            className="mt-5 rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: 'var(--sr-line)',
              background: 'var(--sr-bg-secondary)',
              color: 'var(--sr-ink-secondary)',
            }}
            role="status"
          >
            You signed out successfully.
          </div>
        ) : null}

        {sent ? (
          <div
            className="mt-6 rounded-lg border p-5"
            style={{
              borderColor: 'var(--sr-line)',
              background: 'var(--sr-bg-secondary)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--sr-ink-secondary)' }}>
              Check your inbox for the sign-in link. After you open it, we'll route you
              {nextPath !== appRoutes.dashboard
                ? ' to your session workspace.'
                : ' to your dashboard.'}
            </p>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={(e) => void handleSubmit(e)} noValidate>
            {/* Only render when there IS an error — no idle flash. */}
            {error ? (
              <p
                className="rounded-lg border px-3 py-2 text-sm"
                role="alert"
                style={{
                  borderColor: 'color-mix(in oklch, var(--sr-danger) 30%, transparent)',
                  background: 'var(--sr-danger-soft)',
                  color: 'var(--sr-ink)',
                }}
              >
                {error}
              </p>
            ) : null}
            <FormField id="signin-email" label="Work email">
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
              Email me a magic link
            </Button>

            {isDemoLoginEnabled() ? (
              <>
                <div className="relative py-2">
                  <div
                    className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t"
                    style={{ borderColor: 'var(--sr-divider)' }}
                  />
                  <p
                    className="relative mx-auto w-fit px-3 text-[0.7rem] font-medium uppercase tracking-wider"
                    style={{
                      backgroundColor: 'var(--sr-bg-elevated)',
                      color: 'var(--sr-ink-faint)',
                    }}
                  >
                    or
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDemo()}
                  disabled={demoBusy}
                  className="btn-pill btn-pill--ghost w-full"
                  aria-label={`Try the SquadRidge demo (${DEMO_EMAIL})`}
                >
                  <Play className="size-4" aria-hidden />
                  {demoBusy ? 'Signing in…' : 'Try the Demo'}
                </button>
                <p className="text-center text-xs" style={{ color: 'var(--sr-ink-faint)' }}>
                  Instant read-only access to seeded example sessions. No email required.
                </p>
              </>
            ) : null}
          </form>
        )}

        <nav
          className="mt-8 flex items-center justify-between border-t pt-6 text-xs"
          style={{
            borderColor: 'var(--sr-divider)',
            color: 'var(--sr-ink-secondary)',
          }}
          aria-label="Account help"
        >
          <Link to="/security" className="inline-flex items-center gap-1.5 hover:opacity-70">
            <Shield className="size-3 shrink-0 opacity-60" aria-hidden />
            Security & privacy
          </Link>
          <Link to="/" className="hover:opacity-70">
            Back to home
          </Link>
        </nav>
      </div>
    </div>
  );
}
