import type { CSSProperties } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isDemoSquadShortcutsEnabled, isSupabaseConfigured } from '../lib/env';
import { enqueueMatchmaking } from '../lib/matchmakingClient';
import { poolKeyFromIntentTags } from '../lib/matchmakingPoolKey';
import { setMatchmakingSession, type MatchPerspective } from '../lib/matchmakingSession';
import { clearSessionIntent, writeSessionIntent } from '../lib/intentStorage';
import type { AppErrorCode } from '../lib/appErrors';
import {
  classifyClientError,
  matchmakingUnavailableClassified,
} from '../lib/appErrors';
import { captureAppError } from '../lib/sentry';
import { setPendingMatchReveal } from '../lib/matchmakingSession';
import { setLastSquadIdInStorage } from '../lib/squad';

const MAX_CHARS = 300;

const headingStyle: CSSProperties = {
  fontSize: 'clamp(2.2rem, 4vw, 3rem)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  color: '#f1f5f9',
};

const primaryCtaStyle: CSSProperties = {
  borderRadius: '8px',
  fontWeight: 600,
};

/** Display labels for optional intent chips (stored verbatim in session intent). */
const OPTIONAL_TAGS = [
  'Processing something hard',
  'Wanting to be heard',
  'Cross\u2011cultural dialogue',
  'Military / veteran experience',
] as const;

export function IntentPage() {
  const navigate = useNavigate();
  const { supabase, ensureAnonymousSession } = useAuth();
  const configured = isSupabaseConfigured();
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Dev-only: last classified code for support / Sentry correlation */
  const [errorCode, setErrorCode] = useState<AppErrorCode | null>(null);
  const [perspective, setPerspective] = useState<MatchPerspective | null>(null);

  const len = text.length;

  function toggleTag(label: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  async function handleFindSquad() {
    if (!supabase) return;
    if (perspective === null) {
      setError('Choose perspective A or B so we can balance both sides of the room.');
      return;
    }
    setBusy(true);
    setError(null);
    setErrorCode(null);
    try {
      const tags = [...selected];
      writeSessionIntent({
        text: text.trim(),
        tags,
      });
      await ensureAnonymousSession();
      const poolKey = poolKeyFromIntentTags(tags);
      const snap = await enqueueMatchmaking(supabase, poolKey, perspective);
      if (!snap) {
        const c = matchmakingUnavailableClassified();
        setError(c.userMessage);
        setErrorCode(c.code);
        captureAppError(new Error('matchmaking_enqueue_and_try returned null snapshot'), {
          feature: 'intent_matchmaking',
          extra: { poolKey, perspective },
        });
        return;
      }
      if (snap.outcome === 'matched') {
        setLastSquadIdInStorage(snap.squad_id);
        setPendingMatchReveal(snap.squad_id);
        navigate('/match', { replace: true });
        return;
      }
      if (snap.outcome === 'queued') {
        setMatchmakingSession(poolKey, perspective);
        navigate('/match', { replace: true });
        return;
      }
      if (snap.outcome === 'idle') {
        setError(
          'Matching is idle for this pool right now. Try again in a moment, or adjust your optional tags.',
        );
        setErrorCode('MATCHMAKING_UNAVAILABLE');
        return;
      }
      const _exhaustive: never = snap;
      void _exhaustive;
    } catch (e) {
      const classified = classifyClientError(e);
      setError(classified.userMessage);
      setErrorCode(classified.code);
      captureAppError(e, {
        feature: 'intent_matchmaking',
        extra: { code: classified.code, kind: classified.kind },
      });
    } finally {
      setBusy(false);
    }
  }

  function handleSkip() {
    clearSessionIntent();
    navigate('/session', { replace: true });
  }

  if (!configured) {
    const demoPath = isDemoSquadShortcutsEnabled();
    return (
      <section className="mx-auto w-full max-w-copy px-md py-12" aria-labelledby="intent-unconfigured">
        <h1 id="intent-unconfigured" className="font-heading text-fluid-h2 text-gray-light">
          {demoPath ? 'Try the guided path (offline demo)' : 'Matching unavailable'}
        </h1>
        <p className="mt-4 font-sans text-[0.95rem] leading-relaxed text-[#8892a4]">
          {demoPath
            ? 'Supabase isn’t configured in this environment, so live matching and rooms are disabled. You can still walk the product story: a short “finding your squad” step, then a local-only demo session and sample ledger entry.'
            : 'Configure Supabase to use the squad room. See the home page for setup steps.'}
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          {demoPath ? (
            <>
              <Link
                to="/match?demo=1"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-teal px-8 py-3 font-heading text-[0.95rem] font-semibold text-[#0b0f1a]"
              >
                Continue demo — match → session
              </Link>
              <Link
                to="/onboarding"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#2d3f55] px-6 py-3 font-sans text-[0.9rem] font-medium text-[#a8b2c1] transition-colors hover:border-[#3d4f65] hover:text-[#c4cdd9]"
              >
                Start from onboarding
              </Link>
              <Link to="/" className="inline-flex font-sans text-[0.9rem] text-[#6b7280] underline-offset-4 hover:text-[#a8b2c1] hover:underline">
                Home
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="inline-flex text-teal underline-offset-4 hover:underline">
                Back to home
              </Link>
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="intent-page-root mx-auto flex w-full max-w-[640px] flex-col px-md pb-16 pt-[100px] md:pt-[120px]"
      aria-labelledby="intent-heading"
    >
      <header className="flex flex-col gap-4">
        <h1 id="intent-heading" className="font-heading" style={headingStyle}>
          Set your intention
        </h1>
        <p className="max-w-[520px] font-sans text-[0.95rem] font-normal leading-[1.65] text-[#8892a4]">
          This stays private. It helps us route you to the right room.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-6">
        <div>
          <label
            htmlFor="intent-text"
            className="mb-2 block font-sans text-[0.95rem] font-medium leading-snug text-[#c4cdd9]"
          >
            I&apos;m here because…
          </label>
          <textarea
            id="intent-text"
            name="intent"
            rows={5}
            maxLength={MAX_CHARS}
            placeholder=""
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-describedby="intent-char-count"
            className="w-full resize-y rounded-[10px] border border-[#1a2236] bg-[#0f1623] px-4 py-3 font-sans text-[0.95rem] leading-relaxed text-[#e2e8f0] placeholder:text-[#6b7280] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          />
          <p
            id="intent-char-count"
            className="mt-2 text-right font-sans text-[0.8rem] tabular-nums text-[#6b7280]"
            aria-live="polite"
          >
            {len}/{MAX_CHARS}
          </p>
        </div>

        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-3 font-sans text-[0.85rem] font-medium text-[#a8b2c1]">
            Optional — tap what fits (you can leave this blank)
          </legend>
          <div className="flex flex-wrap gap-2">
            {OPTIONAL_TAGS.map((tag) => {
              const on = selected.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-[8px] border px-3 py-2 font-sans text-[0.85rem] font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                    on
                      ? 'border-teal bg-teal/[0.12] text-[#e2e8f0]'
                      : 'border-[#2d3f55] bg-transparent text-[#a8b2c1] hover:border-[#3d4f63] hover:text-[#c4cdd9]'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-3 font-sans text-[0.85rem] font-medium text-[#a8b2c1]">
            Perspective for matching — pick one
          </legend>
          <p className="mb-3 max-w-[520px] font-sans text-[0.8rem] leading-relaxed text-[#6b7280]">
            We need people on both sides in the room at once. “A” and “B” are neutral labels — use them to self-sort into
            two groups (not “good vs bad”).
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            {(
              [
                { id: 'A' as const, label: 'Perspective A' },
                { id: 'B' as const, label: 'Perspective B' },
              ] as const
            ).map(({ id, label }) => {
              const on = perspective === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPerspective(id)}
                  className={`flex-1 rounded-[10px] border px-4 py-3 text-left font-sans text-[0.9rem] font-medium transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                    on
                      ? 'border-teal bg-teal/[0.12] text-[#e2e8f0]'
                      : 'border-[#2d3f55] bg-transparent text-[#a8b2c1] hover:border-[#3d4f63] hover:text-[#c4cdd9]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            disabled={busy || !supabase || perspective === null}
            onClick={() => void handleFindSquad()}
            className="inline-flex min-h-[44px] w-full shrink-0 items-center justify-center bg-teal px-8 py-[0.65rem] font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity duration-150 ease-out hover:opacity-[0.88] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            style={primaryCtaStyle}
          >
            {busy ? 'Finding…' : 'Find my squad'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="self-center font-sans text-[0.9rem] font-medium text-[#6b7280] underline-offset-4 transition-colors hover:text-[#a8b2c1] hover:underline"
        >
          Session hub only (skip matching)
        </button>

        {error ? (
          <div className="flex flex-col gap-3 rounded-[10px] border border-amber/35 bg-[#1a1408]/80 px-4 py-3" role="alert">
            <p className="font-sans text-[0.875rem] leading-relaxed text-[#f5d7a3]">{error}</p>
            {import.meta.env.DEV && errorCode ? (
              <p className="font-mono text-[0.7rem] text-amber/90">Code: {errorCode}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border-0 bg-teal px-4 py-2 font-heading text-[0.85rem] font-semibold text-[#0b0f1a] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy || perspective === null}
                onClick={() => void handleFindSquad()}
              >
                Retry
              </button>
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border border-[#2d3f55] bg-transparent px-4 py-2 font-sans text-[0.85rem] font-medium text-[#a8b2c1] transition-colors hover:border-[#3d4f63]"
                onClick={() => navigate('/session', { replace: false })}
              >
                Session hub
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
