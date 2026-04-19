import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import {
  formatMatchWaitHint,
  isDemoSquadShortcutsEnabled,
  isSupabaseConfigured,
  MATCH_QUEUE_NO_SERVER_TIMEOUT,
  MATCHMAKING_SIDE_SIZE,
  MATCHED_SQUAD_TTL_HOURS,
  pollMatchmakingSnapshot,
  clearMatchmakingSession,
  clearPendingMatchReveal,
  readMatchmakingSession,
  readPendingMatchReveal,
  setLastSquadIdInStorage,
  type MatchmakingSnapshot,
} from '../lib';
import { DEMO_WALKTHROUGH_STORAGE_KEY } from '../demo/demoScript';

/** Poll pool snapshot while waiting; Realtime on `match_queue` also triggers refresh. */
const POLL_MS = 2500;
const SLOT_STAGGER_MS = [800, 1600, 2400] as const;
/** Brief “finding” beat before opening the room (intent narrative + guided demo). */
const NARRATIVE_THEATER_MS = 2400;

type Gate =
  | 'loading'
  | 'no_pool'
  | 'waiting'
  /** `/match?demo=1` — offline story beat before `DemoSessionPage`. */
  | 'guided_demo'
  /** Instant match from intent: always pass through this page before `/session/:id`. */
  | 'instant_reveal';

/**
 * Match — matchmaking gate: pool snapshot, narrative beats, and navigation into `/session/:squadId` when matched.
 * Polls and/or relies on Realtime for queue updates; supports guided demo when `?demo=1` and demo shortcuts are enabled.
 */
export function Match() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { supabase, session, ensureAnonymousSession } = useAuth();
  const configured = isSupabaseConfigured();
  const demoQuery = searchParams.get('demo') === '1';
  const guidedDemo = demoQuery && isDemoSquadShortcutsEnabled();

  const [gate, setGate] = useState<Gate>('loading');
  const [slots, setSlots] = useState([false, false, false]);
  const [snapshot, setSnapshot] = useState<MatchmakingSnapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const poolKeyRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase || !poolKeyRef.current) return;
    try {
      const snap = await pollMatchmakingSnapshot(supabase, poolKeyRef.current);
      setSnapshot(snap);
      setLoadError(null);
      if (snap?.outcome === 'idle') {
        poolKeyRef.current = null;
        clearMatchmakingSession();
        setGate('no_pool');
        return;
      }
      if (snap?.outcome === 'matched') {
        const id = snap.squad_id;
        setLastSquadIdInStorage(id);
        clearMatchmakingSession();
        toast.success('Your squad is ready — opening the room.');
        navigate(`/session/${id}`, { replace: true });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not refresh match status.';
      setLoadError(msg);
    }
  }, [supabase, navigate]);

  useEffect(() => {
    if (guidedDemo) {
      clearPendingMatchReveal();
      setGate('guided_demo');
      const walkthroughActive =
        typeof sessionStorage !== 'undefined' &&
        sessionStorage.getItem(DEMO_WALKTHROUGH_STORAGE_KEY) === '1';
      if (walkthroughActive) {
        return undefined;
      }
      const t = window.setTimeout(() => {
        navigate('/session/demo-session-001', { replace: true });
      }, NARRATIVE_THEATER_MS);
      return () => clearTimeout(t);
    }

    const pending = readPendingMatchReveal();
    if (pending) {
      if (!configured || !supabase) {
        clearPendingMatchReveal();
        setGate('no_pool');
        return;
      }
      setGate('instant_reveal');
      const t = window.setTimeout(() => {
        clearPendingMatchReveal();
        setLastSquadIdInStorage(pending);
        toast.success('Your squad is ready — opening the room.');
        navigate(`/session/${pending}`, { replace: true });
      }, NARRATIVE_THEATER_MS);
      return () => clearTimeout(t);
    }

    if (!configured || !supabase) {
      setGate('no_pool');
      return;
    }

    void (async () => {
      try {
        await ensureAnonymousSession();
      } catch {
        setGate('no_pool');
        return;
      }

      const stored = readMatchmakingSession();
      if (!stored) {
        setGate('no_pool');
        return;
      }

      poolKeyRef.current = stored.poolKey;
      setGate('waiting');
      await refresh();
    })();
  }, [guidedDemo, configured, supabase, ensureAnonymousSession, refresh, navigate]);

  useEffect(() => {
    if (!supabase || !session?.user?.id || gate !== 'waiting') return;
    const uid = session.user.id;

    const ch = supabase
      .channel(`match_queue:${uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_queue',
          filter: `user_id=eq.${uid}`,
        },
        () => {
          void refresh();
        },
      )
      .subscribe();

    const poll = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    const onVis = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    const onFocus = () => {
      void refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', onFocus);

    return () => {
      void supabase.removeChannel(ch);
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  }, [supabase, session?.user?.id, gate, refresh]);

  useEffect(() => {
    if (gate !== 'waiting' && gate !== 'guided_demo' && gate !== 'instant_reveal') return;
    const timers = SLOT_STAGGER_MS.map((delay, i) =>
      window.setTimeout(() => {
        setSlots((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay),
    );
    return () => timers.forEach((id) => clearTimeout(id));
  }, [gate]);

  async function handleLeaveQueue() {
    if (!supabase || !poolKeyRef.current) return;
    try {
      const { error } = await supabase.rpc('matchmaking_cancel_waiting', {
        p_pool_key: poolKeyRef.current,
      });
      if (error) throw error;
      clearMatchmakingSession();
      navigate('/intent', { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not leave queue.');
    }
  }

  if (gate === 'loading') {
    return (
      <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16">
        <div
          className="h-10 w-10 animate-pulse rounded-full border-2 border-teal-500/40"
          aria-hidden
        />
        <p className="mt-6 font-sans text-sm text-slate-500">Loading matching…</p>
      </div>
    );
  }

  if (gate === 'no_pool') {
    if (!configured) {
      const canDemo = isDemoSquadShortcutsEnabled();
      return (
        <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16">
          <h2 className="font-heading text-xl font-semibold text-slate-100">
            Matching needs Supabase
          </h2>
          <p className="mt-3 max-w-md text-center font-sans text-sm leading-relaxed text-slate-400">
            {canDemo
              ? 'Connect a Supabase project for live queues and rooms, or run the short offline guided demo that walks match → sample session → ledger.'
              : 'Configure Supabase for live matching. Enable demo shortcuts on staging if you need the offline story (see .env.example).'}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            {canDemo ? (
              <Link
                to="/match?demo=1"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[1.75rem] bg-teal px-8 py-3 font-heading text-[0.95rem] font-semibold text-[#0b0f1a]"
              >
                Guided demo (match → session)
              </Link>
            ) : null}
            <Link to="/intent" className="text-teal underline-offset-4 hover:underline">
              Set intention
            </Link>
            <Link
              to="/"
              className="font-sans text-[0.9rem] text-[#6b7280] underline-offset-4 hover:text-[#a8b2c1] hover:underline"
            >
              Home
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16">
        <h2 className="font-heading text-xl font-semibold text-slate-100">Start from intent</h2>
        <p className="mt-3 max-w-md text-center font-sans text-sm leading-relaxed text-slate-400">
          Matching starts after you set your intention and choose a perspective. That keeps the room
          balanced across sides.
        </p>
        <p className="mt-6 max-w-md text-center font-sans text-[0.85rem] leading-relaxed text-slate-500">
          Need a verified role?{' '}
          <Link
            to="/verify"
            className="font-medium text-teal-light underline-offset-4 hover:underline"
          >
            Verify your account
          </Link>
          .
        </p>
        <Link
          to="/intent"
          className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-[1.75rem] bg-teal px-8 py-3 font-heading text-[0.95rem] font-semibold text-[#0b0f1a]"
        >
          Set intention
        </Link>
      </div>
    );
  }

  if (gate === 'guided_demo' || gate === 'instant_reveal') {
    const isDemo = gate === 'guided_demo';
    return (
      <div
        className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16"
        data-demo="match-guided-root"
      >
        <div className="relative flex max-w-lg flex-col items-center text-center">
          <p className="mb-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber/90">
            {isDemo ? 'Guided demo' : 'Opening your room'}
          </p>
          <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
            <div
              className="absolute h-24 w-24 rounded-full border-4 border-teal-500/30 animate-ping"
              aria-hidden
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 md:text-3xl">
            Finding your squad
          </h2>
          <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-slate-400 md:text-base">
            {isDemo
              ? 'This step simulates matchmaking for walkthroughs. Next: a local-only sample session (no live sync).'
              : 'Your match is ready. We pause here so the story matches the full journey: intent → match → session.'}
          </p>
          <div className="mt-10 flex w-full max-w-sm flex-col gap-4 text-left">
            {['A', 'B', 'C'].map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  slots[i] ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="h-8 w-8 shrink-0 rounded-full border-2 border-teal-500/40 animate-pulse" />
                <span className="font-sans text-sm text-slate-500">Participant {label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const q = snapshot && snapshot.outcome === 'queued' ? snapshot : null;

  return (
    <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16">
      <div className="relative flex max-w-lg flex-col items-center text-center">
        <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
          <div
            className="absolute h-24 w-24 rounded-full border-4 border-teal-500/30 animate-ping"
            aria-hidden
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20" />
        </div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 md:text-3xl">
          Finding your squad
        </h2>
        <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-slate-400 md:text-base">
          We form a room when there are at least {MATCHMAKING_SIDE_SIZE} people waiting on
          perspective A and {MATCHMAKING_SIDE_SIZE} on B in the same pool. Low traffic means longer
          waits. Matched squads expire after about {MATCHED_SQUAD_TTL_HOURS} hours.
        </p>
        <p className="mt-4 max-w-md text-center font-sans text-[0.85rem] leading-relaxed text-slate-500">
          Need a verified role?{' '}
          <Link
            to="/verify"
            className="font-medium text-teal-light underline-offset-4 hover:underline"
          >
            Verify your account
          </Link>
          .
        </p>
        {import.meta.env.DEV ? (
          <p className="mt-4 max-w-md text-left font-sans text-[0.8rem] leading-relaxed text-slate-500">
            How updates work: this page calls the matchmaking snapshot on an interval and when this
            tab becomes visible, and subscribes to Realtime changes on your{' '}
            <code className="text-slate-400">match_queue</code> row so we react as soon as the
            server assigns you.
          </p>
        ) : null}

        {q ? (
          <div
            className="mt-8 w-full rounded-xl border border-slate-700/80 bg-slate-900/50 px-4 py-3 text-left font-sans text-sm text-slate-300"
            aria-live="polite"
          >
            <p className="text-slate-400">
              {q.side === 'A' ? 'Perspective A' : 'Perspective B'} — queue position{' '}
              <span className="tabular-nums text-slate-200">{q.queue_position}</span>
            </p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-slate-500">
              Waiting in pool: {q.waiting_a} on A · {q.waiting_b} on B. The room opens when we can
              take {MATCHMAKING_SIDE_SIZE} from each side.
            </p>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-slate-500">
              {formatMatchWaitHint(
                q.waiting_a,
                q.waiting_b,
                q.queue_position,
                MATCHMAKING_SIDE_SIZE,
              )}
            </p>
          </div>
        ) : (
          <p className="mt-8 font-sans text-[0.85rem] text-slate-500" aria-live="polite">
            Syncing queue status…
          </p>
        )}

        <div className="mt-10 flex w-full max-w-sm flex-col gap-4 text-left">
          {['A', 'B', 'C'].map((label, i) => (
            <div
              key={label}
              className={`flex items-center gap-3 transition-opacity duration-300 ${
                slots[i] ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="h-8 w-8 shrink-0 rounded-full border-2 border-teal-500/40 animate-pulse" />
              <span className="font-sans text-sm text-slate-500">Participant {label}</span>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-md text-left font-sans text-[0.8rem] leading-relaxed text-slate-500">
          Cold start tip: orgs and cohorts often run fixed windows (e.g. top of the hour) so people
          arrive together. Until then, we’ll hold your spot in the queue while this tab stays open.{' '}
          {MATCH_QUEUE_NO_SERVER_TIMEOUT}
        </p>

        {loadError ? (
          <p className="mt-4 font-sans text-[0.875rem] text-amber" role="alert">
            {loadError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void handleLeaveQueue()}
          className="mt-8 font-sans text-[0.9rem] font-medium text-[#6b7280] underline-offset-4 transition-colors hover:text-[#a8b2c1] hover:underline"
        >
          Leave queue
        </button>
      </div>
    </div>
  );
}
