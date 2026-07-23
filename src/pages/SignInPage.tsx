import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { InviteOnlyNotice } from '../components/auth/InviteOnlyNotice';
import { GovernedEntryLayout } from '../components/shell/GovernedEntryLayout';
import { RouteSkeleton } from '../components/system/RouteSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { appRoutes } from '../lib/appRoutes';
import { isSupabaseConfigured } from '../lib';
import { useDashboardRoute } from '../hooks/useDashboardRoute';
import { signInWithDemo, isDemoLoginEnabled } from '../lib/demoLogin';
import { classifyClientError } from '../lib/appErrors';
import { resolvePostAuthPath, safeNextPath } from '../lib/postAuthRouting';
import { useDemoWalkthrough } from '../demo/DemoWalkthroughContext';

const ROLE_CARDS = [
  {
    title: 'Participant access',
    body: 'Enter via invitation credential or magic link for a specific room.',
    href: '/enter/credential',
  },
  {
    title: 'Facilitator console',
    body: 'Role-scoped workspace for rooms, pacing, and release gate.',
    href: '/sign-in?next=%2Fapp%2Ffacilitator',
    scrollToForm: true,
  },
  {
    title: 'Institutional reviewer',
    body: 'Inspect documented limits and public records — or sign in when credentialed.',
    href: '/security#reviewers',
  },
  {
    title: 'Demo workspace',
    body: 'Read-only guided walkthrough with sample matters. Explicitly separate from pilot access.',
    href: '/sign-in?demo=1',
    demo: true,
  },
] as const;

/**
 * Governed entry hub — role routing before operational dashboards.
 */
export function SignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { startWalkthrough } = useDemoWalkthrough();
  const nextRaw = searchParams.get('next');
  const reason = searchParams.get('reason');
  const intent = searchParams.get('intent');
  const wantDemo = searchParams.get('demo') === '1';
  const roleDashboard = useDashboardRoute();
  const nextPath = safeNextPath(nextRaw ? decodeURIComponent(nextRaw) : null, roleDashboard);

  const { signIn, session, loading, initialized, profile, roles } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const configured = isSupabaseConfigured();
  const isSignup = intent === 'signup';

  const redirected = useRef(false);
  const autoDemoStarted = useRef(false);
  const pendingGuidedTour = useRef(false);

  useEffect(() => {
    if (!initialized || loading || !session || redirected.current) return;

    if (pendingGuidedTour.current) {
      redirected.current = true;
      pendingGuidedTour.current = false;
      startWalkthrough();
      return;
    }

    const destination = resolvePostAuthPath({
      session,
      profile,
      roles,
      explicitNext: nextRaw,
    });
    if (destination === '/sign-in') return;
    redirected.current = true;
    navigate(destination, { replace: true });
  }, [initialized, loading, session, profile, roles, nextRaw, navigate, startWalkthrough]);

  // Explicit demo only — never silent DEV auto-demo.
  useEffect(() => {
    if (!wantDemo || !isDemoLoginEnabled() || !configured) return;
    if (!initialized || loading || session || autoDemoStarted.current) return;
    autoDemoStarted.current = true;
    void handleDemo();
  }, [wantDemo, configured, initialized, loading, session]);

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
      setError(classifyClientError(err).userMessage);
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
      setError(classifyClientError(new Error(result.error)).userMessage);
      return;
    }
    pendingGuidedTour.current = true;
  }

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

  if (!configured) {
    return (
      <GovernedEntryLayout>
        <p className="text-sm text-ink-secondary">Supabase is not configured for sign-in.</p>
        <Link to="/" className="mt-4 inline-block text-brand">
          Back to home
        </Link>
      </GovernedEntryLayout>
    );
  }

  return (
    <GovernedEntryLayout title="Governed entry">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div>
          <h1 className="font-display text-display font-medium tracking-tight text-ink">
            Enter a governed room
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
            Role-linked access for pilot rooms and verified parties — not open signup. Choose your
            path, then continue with a magic link or invitation credential.
          </p>

          <div className="mt-6">
            <InviteOnlyNotice />
          </div>

          <ul className="mt-10 m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {ROLE_CARDS.map((card) => (
              <li key={card.title}>
                {'demo' in card && card.demo ? (
                  <button
                    type="button"
                    disabled={!isDemoLoginEnabled() || demoBusy}
                    onClick={() => void handleDemo()}
                    className="flex h-full w-full flex-col rounded-lg border border-line bg-surface-elevated p-4 text-left transition-colors hover:border-brand/40"
                  >
                    <span className="font-medium text-ink">{card.title}</span>
                    <span className="mt-2 text-sm text-ink-secondary">{card.body}</span>
                  </button>
                ) : 'scrollToForm' in card && card.scrollToForm ? (
                  <button
                    type="button"
                    onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex h-full w-full flex-col rounded-lg border border-line bg-surface-elevated p-4 text-left transition-colors hover:border-brand/40"
                  >
                    <span className="font-medium text-ink">{card.title}</span>
                    <span className="mt-2 text-sm text-ink-secondary">{card.body}</span>
                  </button>
                ) : (
                  <Link
                    to={card.href}
                    className="flex h-full flex-col rounded-lg border border-line bg-surface-elevated p-4 no-underline transition-colors hover:border-brand/40"
                  >
                    <span className="font-medium text-ink">{card.title}</span>
                    <span className="mt-2 text-sm text-ink-secondary">{card.body}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <nav className="mt-8 flex flex-wrap gap-4 text-sm" aria-label="Secondary entry">
            <Link to="/enter/credential" className="text-brand">
              Enter invitation credential
            </Link>
            <Link to="/enter/qr" className="text-brand">
              Scan invitation QR
            </Link>
            <Link to="/request-access" className="text-brand">
              Request pilot access
            </Link>
          </nav>
        </div>

        <div className="rounded-lg border border-line bg-surface-elevated p-6 md:p-8">
          <h2 className="m-0 font-display text-lg font-medium text-ink">
            {isSignup ? 'Create your account' : 'Magic-link sign-in'}
          </h2>
          <p className="mt-2 text-sm text-ink-secondary">
            Invitation-linked accounts only. We email a one-time link — no password stored here.
          </p>

          {reason === 'link' || reason === 'expired' || reason === 'signed-out' ? (
            <p
              className="mt-4 rounded-md border border-line bg-surface-sunken px-3 py-2 text-sm text-ink-secondary"
              role="status"
            >
              {reason === 'signed-out'
                ? 'You signed out successfully.'
                : reason === 'expired'
                  ? 'Your session ended for safety. Request a fresh link below.'
                  : 'No password to reset — request a fresh magic link below.'}
            </p>
          ) : null}

          {sent ? (
            <p className="mt-6 text-sm text-ink" role="status">
              Check your inbox for the sign-in link. It expires in about an hour.
            </p>
          ) : (
            <form
              ref={formRef}
              className="mt-6 space-y-4"
              onSubmit={(e) => void handleSubmit(e)}
              noValidate
            >
              {error ? (
                <p
                  className="rounded-md border border-sem-danger/40 bg-sem-danger-soft px-3 py-2 text-sm"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <FormField id="signin-email" label="Work email">
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.org"
                  className="h-11"
                />
              </FormField>
              <button
                type="submit"
                className="btn-institutional btn-institutional--primary w-full"
                disabled={busy}
              >
                {busy ? 'Sending…' : 'Send sign-in link'}
              </button>
              <p className="text-xs text-ink-faint">
                Pilot access · Demo mode · Reviewer walkthrough are separate paths above.
              </p>
            </form>
          )}
        </div>
      </div>
    </GovernedEntryLayout>
  );
}
