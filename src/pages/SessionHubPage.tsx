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
        <p className="text-fluid-body text-ink-faint">
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
      className="session-page-landing relative z-0 mx-auto flex w-full max-w-[640px] flex-col items-center px-gutter pb-12 pt-[80px] text-center"
      aria-labelledby="session-landing-title"
    >
      {import.meta.env.DEV ? (
        <span className="mb-6 inline-flex rounded border border-line px-2 py-0.5 font-heading text-[0.65rem] font-normal uppercase tracking-[0.12em] text-ink-subtle">
          Dev only
        </span>
      ) : null}
      <header className="flex w-full max-w-[520px] flex-col items-center gap-4">
        <h1
          id="session-landing-title"
          className="font-heading text-fluid-h1-inner font-extrabold text-ink"
        >
          Squad room
        </h1>
        <p className="mx-auto max-w-[440px] font-sans text-[0.95rem] font-normal leading-[1.65] text-ink-faint">
          Get matched into a live room from{' '}
          <strong className="font-medium text-[#text-ink]">Intent</strong> — we pair perspectives
          and open a squad when the queue has enough people. Complete your profile first so you are
          ready for the room.
        </p>
      </header>
      <ol className="mt-8 w-full max-w-[420px] list-decimal space-y-2 pl-5 text-left font-sans text-[0.85rem] leading-relaxed text-ink-subtle">
        <li>
          <strong className="font-medium text-ink-secondary">Intent</strong> — choose side A or B
          and optional tags; you enter the matchmaking pool.
        </li>
        <li>
          <strong className="font-medium text-ink-secondary">Match</strong> — wait until enough
          people on both sides are queued; then we open the squad.
        </li>
        <li>
          <strong className="font-medium text-ink-secondary">Room</strong> — you land in{' '}
          <code className="rounded bg-surface px-1 py-0.5 font-mono text-[0.75rem] text-ink-faint">
            /session/&lt;id&gt;
          </code>{' '}
          automatically (no manual UUID handoff).
        </li>
      </ol>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/find-squad"
          className="focus-ring btn-primary btn-squircle inline-flex min-h-[44px] shrink-0 items-center justify-center px-8 py-[0.65rem] font-heading text-[0.95rem] font-semibold no-underline"
        >
          Find a squad
        </Link>
        <Link
          to="/settings/profile"
          className="focus-ring inline-flex min-h-[44px] shrink-0 items-center justify-center  border border-line-strong bg-transparent px-8 py-[0.65rem] font-heading text-[0.95rem] font-medium text-ink-secondary transition-colors duration-150 hover:border-line hover:text-ink"
        >
          Profile settings
        </Link>
      </div>
      {isDemoSquadShortcutsEnabled() ? (
        <details className="mt-10 w-full max-w-[440px] text-left">
          <summary className="cursor-pointer font-sans text-[0.85rem] font-medium text-ink-subtle underline-offset-4 hover:text-ink-secondary">
            Developer: create a private test squad
          </summary>
          <p className="mt-3 font-sans text-[0.8rem] leading-relaxed text-ink-subtle">
            Spins a squad with only your account — useful for API and UI checks without waiting on
            matchmaking.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="focus-ring inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-lg border border-dashed border-line-strong bg-transparent px-5 py-2 font-heading text-[0.85rem] font-medium text-ink-faint transition-colors hover:border-amber/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
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
        <p className="mt-6 max-w-[440px] font-sans text-[0.875rem] text-sem-warning" role="alert">
          {demoError}
        </p>
      ) : null}
    </section>
  );
}
