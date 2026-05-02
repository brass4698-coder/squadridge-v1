import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { NextStepHint } from '../components/ui/NextStepHint';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { useAuth } from '../contexts/AuthContext';
import { isDemoBypassAllowed } from '../demo/presenterMode';
import {
  captureAppError,
  classifyClientError,
  clearSessionIntent,
  describeInviteResult,
  enqueueMatchmaking,
  getMyActiveInvite,
  isDemoSquadShortcutsEnabled,
  isSupabaseConfigured,
  matchmakingUnavailableClassified,
  poolKeyFromIntentTags,
  redeemInviteCode,
  setLastSquadIdInStorage,
  setMatchmakingSession,
  setPendingMatchReveal,
  writeSessionIntent,
  type ActiveInvite,
  type AppErrorCode,
  type MatchPerspective,
} from '../lib';

const MAX_CHARS = 300;

/**
 * Heading scale lives outside Tailwind's `fontSize` token map (the existing
 * `text-fluid-h1` clamps higher than this page wants) so we keep the inline
 * `clamp` here while migrating the color off `#f1f5f9` to the `text-ink` token.
 */
const headingStyle = {
  fontSize: 'clamp(2.2rem, 4vw, 3rem)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
} as const;

const primaryCtaStyle = {
  borderRadius: 12,
  fontWeight: 600,
} as const;

/** Display labels for optional intent chips (stored verbatim in session intent). */
const OPTIONAL_TAGS = [
  'Processing something hard',
  'Wanting to be heard',
  'Cross\u2011cultural dialogue',
  'Military / veteran experience',
] as const;

export function IntentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { supabase, ensureAnonymousSession } = useAuth();
  const configured = isSupabaseConfigured();
  const inviteCode = searchParams.get('code')?.trim() ?? '';
  /**
   * Presenter / demo bypass: when `?demo=1` is in the URL AND the environment
   * allows demo bypasses (DEV build or presenter mode set from the hub), the
   * pilot-invite gate is treated as satisfied and Find-my-squad routes straight
   * to the offline `/match?demo=1` story without touching the live queue.
   * This MUST stay strictly gated — production users without DEV/presenter mode
   * still see the real invite requirement.
   */
  const demoQuery = searchParams.get('demo') === '1';
  const demoBypass = demoQuery && isDemoBypassAllowed();
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Dev-only: last classified code for support / Sentry correlation */
  const [errorCode, setErrorCode] = useState<AppErrorCode | null>(null);
  const [perspective, setPerspective] = useState<MatchPerspective | null>(null);
  const [activeInvite, setActiveInvite] = useState<ActiveInvite | null>(null);
  const [inviteChecking, setInviteChecking] = useState(false);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  const len = text.length;

  useEffect(() => {
    if (!configured || !supabase) return;
    if (demoBypass) return;
    let cancelled = false;

    void (async () => {
      setInviteChecking(true);
      setInviteMessage(null);
      try {
        await ensureAnonymousSession();
        const result = inviteCode
          ? await redeemInviteCode(supabase, inviteCode)
          : await getMyActiveInvite(supabase);
        if (cancelled) return;

        if (result.ok) {
          setActiveInvite(result.invite);
          setInviteMessage(describeInviteResult(result));
        } else {
          setActiveInvite(null);
          setInviteMessage(describeInviteResult(result));
        }
      } catch {
        if (!cancelled) {
          setActiveInvite(null);
          setInviteMessage('Could not verify pilot access right now. Try again in a moment.');
        }
      } finally {
        if (!cancelled) setInviteChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [configured, demoBypass, ensureAnonymousSession, inviteCode, supabase]);

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
    if (demoBypass) {
      // Presenter path: capture intent locally for the offline confirm screen
      // and route to /match?demo=1, which runs the guided demo flow without
      // enqueueing into the live `match_queue` table.
      writeSessionIntent({ text: text.trim(), tags: [...selected] });
      navigate('/match?demo=1', { replace: true });
      return;
    }
    if (inviteChecking) {
      setError('Still verifying your pilot invite. Try again in a moment.');
      return;
    }
    if (!activeInvite) {
      setError('Enter a valid pilot invite before joining the match queue.');
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
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      let zkScope: string | null = null;
      if (uid) {
        const { data: va } = await supabase
          .from('verified_attributes')
          .select('attribute_value')
          .eq('user_id', uid)
          .order('verified_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        zkScope = va?.attribute_value ?? null;
      }
      const poolKey = poolKeyFromIntentTags(tags, zkScope);
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
      <section
        className="mx-auto w-full max-w-copy px-gutter py-12"
        aria-labelledby="intent-unconfigured"
      >
        <h1 id="intent-unconfigured" className="font-heading text-fluid-h2 text-gray-light">
          {demoPath ? 'Try the guided path (offline demo)' : 'Matching unavailable'}
        </h1>
        <p className="mt-4 font-sans text-[0.95rem] leading-relaxed text-ink-faint">
          {demoPath
            ? 'Live matching isn’t available in this environment, so real queues and rooms are off. You can still walk the product story: a short “finding your squad” step, then a local-only demo session and sample ledger entry.'
            : 'Configure the backend to use the squad room. See the home page for setup steps.'}
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          {demoPath ? (
            <>
              <Link
                to="/match?demo=1"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-teal px-8 py-3 font-heading text-[0.95rem] font-semibold text-navy"
              >
                Continue demo — match → session
              </Link>
              <Link
                to="/?demo=1"
                className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-line-strong px-6 py-3 font-sans text-[0.9rem] font-medium text-ink-secondary transition-colors hover:border-line hover:text-ink"
              >
                Start tour from home
              </Link>
              <Link
                to="/"
                className="inline-flex font-sans text-[0.9rem] text-ink-muted underline-offset-4 hover:text-ink-secondary hover:underline"
              >
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
      className="intent-page-root mx-auto flex w-full max-w-[640px] flex-col px-gutter pb-16 pt-[100px] md:pt-[120px]"
      aria-labelledby="intent-heading"
    >
      <header className="flex flex-col gap-4">
        <h1 id="intent-heading" className="font-heading text-ink" style={headingStyle}>
          Set your intention
        </h1>
        <p className="max-w-[520px] font-sans text-[0.95rem] font-normal leading-[1.65] text-ink-faint">
          It helps us route you to the right room.
        </p>
      </header>

      <div className="mt-12 flex flex-col gap-12">
        <div>
          <label
            htmlFor="intent-text"
            className="mb-2 block font-sans text-[0.95rem] font-medium leading-snug text-ink-secondary"
          >
            I&apos;m here because…
          </label>
          <div
            className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.8125rem] leading-snug text-ink-faint"
            id="intent-privacy-row"
          >
            <span
              className="inline-flex items-center gap-1.5 text-ink-faint"
              title="Your intention helps us match you with the right group; facilitators may see it for routing."
            >
              <Lock className="size-3.5 shrink-0 text-teal/90" aria-hidden />
              <span>Used only for routing</span>
            </span>
            <span
              className="inline-flex items-center rounded border border-teal/35 bg-teal/[0.08] px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-teal-light"
              title="Your identity stays private; verification uses zero-knowledge proofs where the stack is live."
            >
              ZK-ready
            </span>
          </div>
          <div className="intent-textarea-shell">
            <div className="intent-textarea-inner">
              <textarea
                id="intent-text"
                name="intent"
                data-demo="intent-input"
                rows={5}
                maxLength={MAX_CHARS}
                placeholder=""
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-describedby="intent-privacy-row intent-char-count"
                className="relative z-[2] w-full resize-y border-0 bg-transparent px-4 py-3 font-sans text-[0.95rem] leading-relaxed text-ink placeholder:text-ink-muted focus-visible:outline-none"
              />
            </div>
          </div>
          <p
            id="intent-char-count"
            className="mt-2 text-right font-mono text-[0.8rem] font-medium tabular-nums tracking-[0.08em] text-ink-subtle"
            aria-live="polite"
          >
            {len} / {MAX_CHARS}
          </p>
        </div>

        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-4 font-sans text-[0.85rem] font-medium text-ink-secondary">
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
                  data-active={on ? 'true' : 'false'}
                  onClick={() => toggleTag(tag)}
                  className={`intent-chip rounded-[8px] px-3 py-2 font-sans text-[0.85rem] font-medium focus-ring ${
                    on ? 'text-ink' : 'border border-line-strong bg-transparent text-ink-secondary'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="min-w-0 border-0 p-0">
          <legend className="mb-4 font-sans text-[0.85rem] font-medium text-ink-secondary">
            Perspective for matching — pick one
          </legend>
          <p className="mb-4 max-w-[520px] font-sans text-[0.8rem] leading-relaxed text-ink-muted">
            We need people on both sides in the room at once. “A” and “B” are neutral labels — use
            them to self-sort into two groups (not “good vs bad”). E.g., “more regulation” vs “less
            regulation” — both perspectives matter.
          </p>
          <SegmentedControl<MatchPerspective>
            ariaLabel="Perspective"
            value={perspective}
            onChange={setPerspective}
            fill
            className="max-w-md"
            options={[
              { value: 'A', label: 'Perspective A', demoId: 'intent-perspective-a' },
              { value: 'B', label: 'Perspective B' },
            ]}
          />
        </fieldset>

        <div
          className={`rounded-[10px] border px-4 py-3 font-sans text-[0.84rem] leading-relaxed ${
            demoBypass
              ? 'border-amber/40 bg-amber/[0.08] text-amber-light'
              : activeInvite
                ? 'border-teal/30 bg-teal/[0.06] text-teal-light'
                : 'border-amber/30 bg-[#1a1408]/70 text-[#f5d7a3]'
          }`}
          role={demoBypass || activeInvite ? 'status' : 'alert'}
        >
          <p className="font-medium">
            {demoBypass
              ? 'Demo presenter bypass active'
              : inviteChecking
                ? 'Verifying pilot access…'
                : activeInvite
                  ? `Pilot access active: ${activeInvite.label}`
                  : 'Pilot invite required'}
          </p>
          <p className="mt-1 text-[0.78rem] opacity-85">
            {demoBypass
              ? 'Find my squad will skip the live queue and open the guided demo at /match?demo=1.'
              : (inviteMessage ??
                'Use /invite with a cohort code before entering a live matching queue.')}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            data-demo="intent-find-squad"
            disabled={
              busy ||
              !supabase ||
              perspective === null ||
              (!demoBypass && (inviteChecking || !activeInvite))
            }
            onClick={() => void handleFindSquad()}
            className="intent-primary-cta inline-flex min-h-[52px] w-full shrink-0 items-center justify-center px-8 py-3 font-heading text-[0.95rem] font-bold text-navy transition-[box-shadow,opacity] duration-150 ease-out hover:opacity-[0.97] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            style={primaryCtaStyle}
          >
            {busy ? 'Finding…' : 'Find my squad'}
          </button>
        </div>

        <NextStepHint className="mt-6 w-full max-w-md self-center">
          <span className="font-medium text-slate-400">Next:</span> You’ll join the match screen
          with a live queue position. When we have enough people on both perspectives, we open the
          room and take you there automatically.
        </NextStepHint>

        <button
          type="button"
          onClick={handleSkip}
          className="self-center font-sans text-[0.9rem] font-medium text-ink-muted underline-offset-4 transition-colors hover:text-ink-secondary hover:underline"
        >
          Session hub only (skip matching)
        </button>
        <p className="self-center max-w-[520px] text-center font-sans text-[0.78rem] leading-relaxed text-ink-subtle">
          Account verification helps match you with vetted peers — optional if you want open
          dialogue first. You can verify from the match screen or the{' '}
          <Link to="/verify" className="text-teal-light/90 underline-offset-2 hover:underline">
            Verify
          </Link>{' '}
          page.
        </p>

        {error ? (
          <div
            className="flex flex-col gap-3 rounded-[10px] border border-amber/35 bg-amber/[0.08] px-4 py-3"
            role="alert"
          >
            <p className="font-sans text-[0.875rem] leading-relaxed text-amber-light">{error}</p>
            {import.meta.env.DEV && errorCode ? (
              <p className="font-mono text-[0.7rem] text-amber/90">Code: {errorCode}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[8px] border-0 bg-teal px-4 py-2 font-heading text-[0.85rem] font-semibold text-navy transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy || perspective === null}
                onClick={() => void handleFindSquad()}
              >
                Retry
              </button>
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[8px] border border-line-strong bg-transparent px-4 py-2 font-sans text-[0.85rem] font-medium text-ink-secondary transition-colors hover:border-line"
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
