import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormField } from '../components/ui/FormField';
import { FormPanel } from '../components/ui/FormPanel';
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

function AuthStateBanner({ reason }: { reason: string }) {
  if (reason === 'expired') {
    return (
      <div
        className="mb-8 overflow-hidden rounded-[var(--sr-radius-lg)] border border-line bg-surface-elevated"
        role="status"
      >
        <div className="border-b border-line bg-surface-sunken/50 px-5 py-4 md:px-6">
          <p className="m-0 font-mono text-[length:var(--text-label)] uppercase tracking-[var(--tracking-caps)] text-ink-faint">
            Session ended
          </p>
          <h2 className="mt-2 mb-0 font-heading text-h3 font-semibold text-ink">
            Sign in again to continue
          </h2>
        </div>
        <div className="space-y-3 px-5 py-5 text-sm leading-relaxed text-ink-secondary md:px-6">
          <p className="m-0">
            Your session ended for safety after a period of inactivity or an expired credential.
            Request a fresh magic link below.
          </p>
          <ul className="m-0 list-none space-y-2 border-t border-line pt-4 p-0">
            <li className="flex gap-2.5">
              <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-brand" />
              <span>Private room content was not exposed by this timeout.</span>
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-brand" />
              <span>Nothing was auto-published to the ledger.</span>
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-brand" />
              <span>Release still requires facilitator approval.</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (reason === 'signed-out') {
    return (
      <p
        className="mb-6 rounded-[var(--sr-radius-md)] border border-line bg-surface-sunken px-4 py-3 text-sm text-ink-secondary"
        role="status"
      >
        You signed out successfully. Sign in again when you are ready.
      </p>
    );
  }

  if (reason === 'link') {
    return (
      <p
        className="mb-6 rounded-[var(--sr-radius-md)] border border-line bg-surface-sunken px-4 py-3 text-sm text-ink-secondary"
        role="status"
      >
        No password to reset — request a fresh magic link below.
      </p>
    );
  }

  return null;
}

/**
 * Minimal controlled-entry sign-in — verified / invite-linked access.
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
  const isExpired = reason === 'expired';

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

  /* Expired / signed-out: never show a bare Loading skeleton — designed state + form affordance. */
  if ((!initialized || loading) && isExpired) {
    return (
      <GovernedEntryLayout title="Session ended">
        <div className="mx-auto max-w-lg">
          <AuthStateBanner reason="expired" />
          <FormPanel
            eyebrow="Entry"
            title="Sign in with magic link"
            description="Preparing a secure form…"
            footer="Private room content was not exposed. Nothing auto-published. Release still needs facilitator approval."
          >
            <div className="space-y-4" aria-busy="true" aria-live="polite">
              <p className="m-0 text-sm text-ink-secondary" role="status">
                Checking session…
              </p>
              <div className="space-y-2">
                <div className="h-3 w-24 rounded-sm bg-surface-sunken" aria-hidden />
                <div
                  className="h-10 w-full rounded-[var(--sr-radius-md)] border border-line bg-surface-sunken/60"
                  aria-hidden
                />
              </div>
              <button
                type="button"
                className="btn-institutional btn-institutional--primary w-full"
                disabled
              >
                Send a fresh sign-in link
              </button>
            </div>
          </FormPanel>
        </div>
      </GovernedEntryLayout>
    );
  }

  if (!initialized || loading) {
    return (
      <GovernedEntryLayout title="Verified access">
        <div className="mx-auto max-w-lg">
          <RouteSkeleton label="Checking session" />
        </div>
      </GovernedEntryLayout>
    );
  }

  if (session) {
    return (
      <GovernedEntryLayout title="Verified access">
        <div className="mx-auto max-w-lg">
          <RouteSkeleton label="Signing you in" />
        </div>
      </GovernedEntryLayout>
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
    <GovernedEntryLayout title="Verified access only">
      <div className="mx-auto grid max-w-lg gap-8">
        {reason === 'expired' || reason === 'link' || reason === 'signed-out' ? (
          <AuthStateBanner reason={reason} />
        ) : null}

        <div>
          <h1 className="font-heading text-display font-semibold tracking-tight text-ink">
            {isExpired ? 'Sign in again' : 'Sign in'}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            Invite-linked accounts for pilot rooms and verified parties — not open signup.
          </p>
          <div className="mt-5">
            <InviteOnlyNotice />
          </div>
        </div>

        <FormPanel
          eyebrow="Entry"
          title={isSignup ? 'Create your account' : 'Magic-link sign-in'}
          description="We email a one-time link to an invitation-linked work address."
          footer="Need access? Request a confidential pilot intake — do not expect instant self-serve."
        >
          {sent ? (
            <p className="text-sm text-ink" role="status">
              Check your inbox for the sign-in link. It expires in about an hour.
            </p>
          ) : (
            <form
              ref={formRef}
              className="space-y-4"
              onSubmit={(e) => void handleSubmit(e)}
              noValidate
            >
              {error ? (
                <p
                  className="rounded-[var(--sr-radius-md)] border border-sem-danger/40 bg-sem-danger-soft px-3 py-2 text-sm"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}
              <FormField
                id="signin-email"
                label="Work email"
                hint="Must match an invited or approved pilot address."
                instrument
              >
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organization.org"
                />
              </FormField>
              <button
                type="submit"
                className="btn-institutional btn-institutional--primary w-full"
                disabled={busy}
              >
                {busy ? 'Sending…' : isExpired ? 'Send a fresh sign-in link' : 'Send sign-in link'}
              </button>
            </form>
          )}
        </FormPanel>

        <nav className="flex flex-col gap-2 text-sm" aria-label="Other entry paths">
          <Link to="/enter/credential" className="text-brand">
            Enter invitation credential
          </Link>
          <Link to="/request-access" className="text-brand">
            Request pilot access
          </Link>
          {isDemoLoginEnabled() ? (
            <button
              type="button"
              disabled={demoBusy}
              onClick={() => void handleDemo()}
              className="w-fit text-left text-ink-secondary underline-offset-4 hover:underline disabled:opacity-50"
            >
              {demoBusy ? 'Starting demo…' : 'Open demo walkthrough'}
            </button>
          ) : null}
        </nav>
      </div>
    </GovernedEntryLayout>
  );
}
