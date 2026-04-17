import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SessionPageAuthSkeleton } from '../components';
import { useAuth } from '../contexts/AuthContext';
import {
  captureAppError,
  createDemoSquad,
  isDemoSquadShortcutsEnabled,
  isSupabaseConfigured,
} from '../lib';

const sessionLandingHeadingStyle: CSSProperties = {
  fontSize: 'clamp(2.2rem, 4vw, 3rem)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  color: '#f1f5f9',
};

/**
 * Public `/session` hub — no squad room hooks (realtime, translation worker, crypto) so nav here stays stable.
 */
export function SessionHubPage() {
  const { pathname: sessionPathKey } = useLocation();
  const navigate = useNavigate();
  const { supabase, loading: authLoading, ensureAnonymousSession } = useAuth();
  const [demoError, setDemoError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  async function handleCreateDemo() {
    if (!supabase) return;
    setDemoError(null);
    try {
      await ensureAnonymousSession();
      const id = await createDemoSquad(supabase);
      navigate(`/session/${id}`, { replace: true });
    } catch (e) {
      captureAppError(e, { feature: 'demo_squad_create' });
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === 'object' &&
              e !== null &&
              'message' in e &&
              typeof (e as { message: unknown }).message === 'string'
            ? (e as { message: string }).message
            : 'Could not create demo squad.';
      setDemoError(msg);
    }
  }

  if (!configured) {
    return (
      <section className="panel space-y-sm" aria-labelledby="session-unconfigured">
        <h1 id="session-unconfigured" className="font-heading text-fluid-h2 text-gray-light">
          Session unavailable
        </h1>
        <p className="text-fluid-body text-gray-light">
          Configure Supabase environment variables to use the squad room. See the home page for
          setup steps.
        </p>
        <Link to="/" className="btn-primary inline-flex w-fit">
          Back to home
        </Link>
      </section>
    );
  }

  if (authLoading) {
    return <SessionPageAuthSkeleton key={`${sessionPathKey}-auth`} />;
  }

  return (
    <section
      key={sessionPathKey}
      className="session-page-landing relative z-0 mx-auto flex w-full max-w-[640px] flex-col items-center px-md pb-12 pt-[80px] text-center"
      aria-labelledby="session-landing-title"
    >
      {import.meta.env.DEV ? (
        <span className="mb-6 inline-flex rounded border border-[#1a2236] px-2 py-0.5 font-heading text-[0.65rem] font-normal uppercase tracking-[0.12em] text-[#4b5563]">
          Dev only
        </span>
      ) : null}
      <header className="flex w-full max-w-[520px] flex-col items-center gap-4">
        <h1
          id="session-landing-title"
          className="font-heading font-extrabold"
          style={sessionLandingHeadingStyle}
        >
          Squad room
        </h1>
        <p className="mx-auto max-w-[440px] font-sans text-[0.95rem] font-normal leading-[1.65] text-[#8892a4]">
          Get matched into a live room from{' '}
          <strong className="font-medium text-[#c4cdd9]">Intent</strong> — we pair perspectives and
          open a squad when the queue has enough people. Complete your profile first so you are
          ready for the room.
        </p>
      </header>
      <ol className="mt-8 w-full max-w-[420px] list-decimal space-y-2 pl-5 text-left font-sans text-[0.85rem] leading-relaxed text-[#6b7280]">
        <li>
          <strong className="font-medium text-[#a8b2c1]">Intent</strong> — choose side A or B and
          optional tags; you enter the matchmaking pool.
        </li>
        <li>
          <strong className="font-medium text-[#a8b2c1]">Match</strong> — wait until enough people
          on both sides are queued; then we open the squad.
        </li>
        <li>
          <strong className="font-medium text-[#a8b2c1]">Room</strong> — you land in{' '}
          <code className="rounded bg-[#0f1623] px-1 py-0.5 font-mono text-[0.75rem] text-[#8892a4]">
            /session/&lt;id&gt;
          </code>{' '}
          automatically (no manual UUID handoff).
        </li>
      </ol>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/intent"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center border-0 bg-teal px-8 py-[0.65rem] font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity duration-150 ease-out hover:opacity-[0.88]"
          style={{
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Find a squad
        </Link>
        <Link
          to="/settings/profile"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center border border-solid border-[#2d3f55] bg-transparent px-8 py-[0.65rem] font-heading text-[0.95rem] font-medium text-[#a8b2c1] transition-colors duration-150 hover:border-[#3d4f63] hover:text-[#c4cdd9]"
          style={{
            borderRadius: 8,
            fontWeight: 500,
          }}
        >
          Profile settings
        </Link>
      </div>
      {isDemoSquadShortcutsEnabled() ? (
        <details className="mt-10 w-full max-w-[440px] text-left">
          <summary className="cursor-pointer font-sans text-[0.85rem] font-medium text-[#6b7280] underline-offset-4 hover:text-[#a8b2c1]">
            Developer: create a private test squad
          </summary>
          <p className="mt-3 font-sans text-[0.8rem] leading-relaxed text-[#6b7280]">
            Spins a squad with only your account — useful for API and UI checks without waiting on
            matchmaking.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex min-h-[40px] shrink-0 items-center justify-center border border-dashed border-[#3d4f63] bg-transparent px-5 py-2 font-heading text-[0.85rem] font-medium text-[#8892a4] transition-colors hover:border-amber/40 hover:text-[#c4cdd9] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderRadius: 8 }}
              onClick={() => void handleCreateDemo()}
              disabled={!supabase}
            >
              Create demo squad
            </button>
          </div>
        </details>
      ) : null}
      {demoError ? (
        <p className="mt-6 max-w-[440px] font-sans text-[0.875rem] text-amber" role="alert">
          {demoError}
        </p>
      ) : null}
    </section>
  );
}
