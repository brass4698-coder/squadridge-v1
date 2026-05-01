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
import { readSessionIntent } from '../lib/intentStorage';

/** Fallback poll while waiting: faster before Realtime connects; slower once subscribed (Realtime drives updates). */
const POLL_MS_BEFORE_REALTIME = 4000;
const POLL_MS_WITH_REALTIME = 10000;
const SLOT_STAGGER_MS = [800, 1600, 2400] as const;
/** Brief “finding” beat before opening the room (intent narrative + guided demo). */
const NARRATIVE_THEATER_MS = 2400;

type Gate =
  | 'loading'
  | 'no_pool'
  | 'waiting'
  /** `/match?demo=1` — story beat before confirm. */
  | 'guided_demo'
  | 'instant_reveal'
  | 'confirm_live'
  | 'confirm_demo'
  | 'confirm_instant';

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
  const [pendingSquadId, setPendingSquadId] = useState<string | null>(null);
  const poolKeyRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    // Skip refresh until intent stored a pool key (avoids snapshot RPC with a null key).
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
      if (snap?.outcome === 'matched' && snap.squad_id) {
        setPendingSquadId(snap.squad_id);
        setGate('confirm_live');
        return;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not refresh match status.';
      setLoadError(msg);
    }
  }, [supabase]);

  useEffect(() => {
    if (guidedDemo) {
      clearPendingMatchReveal();
      setGate('guided_demo');
      /** Narrative beat then confirm — same route as scripted tour (`/match?demo=1`). Tour chrome may still advance via Space before this fires. */
      const t = window.setTimeout(() => {
        setPendingSquadId('demo-session-001');
        setGate('confirm_demo');
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
        setPendingSquadId(pending);
        setGate('confirm_instant');
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

    let pollId = window.setInterval(() => {
      void refresh();
    }, POLL_MS_BEFORE_REALTIME);
    let pollUpgradedForRealtime = false;

    const upgradePollIfRealtime = () => {
      if (pollUpgradedForRealtime) return;
      pollUpgradedForRealtime = true;
      window.clearInterval(pollId);
      pollId = window.setInterval(() => {
        void refresh();
      }, POLL_MS_WITH_REALTIME);
    };

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
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          upgradePollIfRealtime();
        }
      });

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
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('focus', onFocus);
    };
  }, [supabase, session?.user?.id, gate, refresh]);

  useEffect(() => {
    if (
      gate !== 'waiting' &&
      gate !== 'guided_demo' &&
      gate !== 'instant_reveal' &&
      gate !== 'confirm_live' &&
      gate !== 'confirm_demo' &&
      gate !== 'confirm_instant'
    ) {
      return;
    }
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
      navigate('/find-squad', { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not leave queue.');
    }
  }

  if (gate === 'loading') {
    return (
      <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-navy px-6 py-16">
        <div
          className="h-10 w-10 animate-pulse rounded-full border-2 border-teal-500/40"
          aria-hidden
        />
        <p className="mt-6 font-sans text-sm text-ink-faint">Loading matching…</p>
      </div>
    );
  }

  if (gate === 'no_pool') {
    if (!configured) {
      const canDemo = isDemoSquadShortcutsEnabled();
      return (
        <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-navy px-6 py-16">
          <h2 className="font-heading text-xl font-semibold text-ink">Live matching unavailable</h2>
          <p className="mt-3 max-w-md text-center font-sans text-sm leading-relaxed text-ink-secondary">
            {canDemo
              ? 'This environment doesn’t have live matching wired up, so queues and real rooms are off. You can still use the short offline walkthrough: match → sample session → ledger.'
              : 'Live matching needs backend configuration. Enable demo shortcuts on staging if you need the offline story (see .env.example).'}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
            {canDemo ? (
              <Link
                to="/match?demo=1"
                className="inline-flex min-h-[44px] items-center justify-center rounded-[1.75rem] bg-teal px-8 py-3 font-heading text-[0.95rem] font-semibold text-navy"
              >
                Guided demo (match → session)
              </Link>
            ) : null}
            <Link to="/find-squad" className="text-teal underline-offset-4 hover:underline">
              Find squad
            </Link>
            <Link
              to="/"
              className="font-sans text-[0.9rem] text-ink-muted underline-offset-4 hover:text-ink-secondary hover:underline"
            >
              Home
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-navy px-6 py-16">
        <div className="relative flex max-w-lg flex-col items-center text-center">
          <h2 className="font-heading text-xl font-semibold text-ink">Let’s get you matched</h2>
          <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-ink-secondary">
            First, tell us your perspective and any relevant context. This helps us match you with
            people on the other side and keep the room balanced.
          </p>
          <p className="mt-6 max-w-md text-center font-sans text-[0.85rem] leading-relaxed text-ink-faint">
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
            to="/find-squad"
            className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-[1.75rem] bg-teal px-8 py-3 font-heading text-[0.95rem] font-semibold text-navy"
          >
            Go to Find squad
          </Link>
          <p className="mt-6 max-w-md text-center font-sans text-[0.8rem] text-ink-faint">
            Already set your intent?{' '}
            <Link to="/" className="text-teal underline-offset-4 hover:underline">
              Return home
            </Link>{' '}
            or check your connection, then try again.
          </p>
        </div>
      </div>
    );
  }

  if (gate === 'confirm_live' || gate === 'confirm_demo' || gate === 'confirm_instant') {
    const mm = readMatchmakingSession();
    const intent = readSessionIntent();
    return (
      <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-navy px-6 py-16">
        <div className="w-full max-w-md sr-section-card text-left">
          <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber/90">
            Match ready
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-ink">
            Confirm to enter the room
          </h2>
          <p className="mt-2 font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
            {gate === 'confirm_demo'
              ? 'Offline walkthrough: no live participants. The next screen is a local-only sample session.'
              : gate === 'confirm_instant'
                ? 'We matched you from your intent. Review how we used your input, then open the room.'
                : 'You are about to join a live squad. Keep this tab open; rooms expire after a period of inactivity.'}
          </p>
          <div className="mt-5 space-y-2 rounded-lg border border-white/[0.06] bg-navy-dark/60 p-3 font-sans text-[0.8rem] text-ink-secondary">
            <p>
              <span className="text-ink-faint">Squad / session</span>{' '}
              <span className="font-mono text-[0.75rem] text-ink-secondary">
                {pendingSquadId ?? '—'}
              </span>
            </p>
            {mm ? (
              <p>
                <span className="text-ink-faint">Your perspective in queue</span> Side {mm.side} ·
                pool key{' '}
                <span className="font-mono text-ink-secondary">{mm.poolKey.slice(0, 12)}…</span>
              </p>
            ) : null}
            {intent?.text ? (
              <p>
                <span className="text-ink-faint">Why this match (your intent)</span>{' '}
                {intent.text.slice(0, 200)}
                {intent.text.length > 200 ? '…' : ''}
              </p>
            ) : null}
            {intent && intent.tags.length > 0 ? (
              <p>
                <span className="text-ink-faint">Tags</span> {intent.tags.join(', ')}
              </p>
            ) : null}
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/find-squad', { replace: true })}
              className="btn-secondary inline-flex min-h-[48px] items-center justify-center px-4 text-[0.9rem]"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={() => {
                const id = pendingSquadId;
                if (!id) return;
                if (gate === 'confirm_instant') clearPendingMatchReveal();
                if (gate === 'confirm_live' || gate === 'confirm_instant')
                  clearMatchmakingSession();
                setLastSquadIdInStorage(id);
                toast.success('Opening the room.');
                navigate(`/session/${id}`, { replace: true });
              }}
              className="btn-primary inline-flex min-h-[48px] items-center justify-center px-5 text-[0.9rem]"
            >
              Enter room
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gate === 'guided_demo' || gate === 'instant_reveal') {
    const isDemo = gate === 'guided_demo';
    return (
      <div
        className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-navy px-6 py-16"
        data-demo="match-guided-root"
      >
        <div className="relative flex max-w-lg flex-col items-center text-center">
          <p className="mb-3 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber/90">
            {isDemo ? 'Guided demo' : 'Opening your room'}
          </p>
          <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
            <div
              className="absolute h-24 w-24 rounded-full border-4 border-teal/30 animate-ping"
              aria-hidden
            />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal/20" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 md:text-3xl">
            Finding your squad
          </h2>
          <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-ink-secondary md:text-base">
            {isDemo
              ? 'This step simulates matchmaking for walkthroughs. Next: a local-only sample session (no live sync).'
              : 'Your match is ready. We pause here so the story matches the full journey: intent → match → session.'}
          </p>
          <div className="mt-10 flex w-full max-w-sm flex-col gap-4 text-left" aria-live="polite">
            {['A', 'B', 'C'].map((label, i) =>
              slots[i] ? (
                <div key={label} className="flex items-center gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full border-2 border-teal/40 animate-pulse" />
                  <span className="font-sans text-sm text-ink-faint">Participant {label}</span>
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
    );
  }

  const q = snapshot && snapshot.outcome === 'queued' ? snapshot : null;

  return (
    <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-navy px-6 py-16">
      {demoQuery ? (
        <div
          role="status"
          className="mb-8 w-full max-w-lg rounded-lg border border-amber/40 bg-amber/10 px-4 py-2 font-sans text-[0.75rem] leading-snug text-amber"
        >
          Demo path (<code>?demo=1</code>): staging-style flow — not a live cohort.
        </div>
      ) : null}
      <div className="relative flex max-w-lg flex-col items-center text-center">
        <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
          <div
            className="absolute h-24 w-24 rounded-full border-4 border-teal/30 animate-ping"
            aria-hidden
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal/20" />
        </div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 md:text-3xl">
          Finding your squad
        </h2>
        <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-ink-secondary md:text-base">
          Your room opens when we have enough people on both perspectives in your interest area
          (from your optional tags and verification scope). We need {MATCHMAKING_SIDE_SIZE} on each
          side before we open the room. Low traffic means longer waits. Squads expire after about{' '}
          {MATCHED_SQUAD_TTL_HOURS} hours.
        </p>
        <p className="mt-4 max-w-md text-center font-sans text-[0.85rem] leading-relaxed text-ink-faint">
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
          <p className="mt-4 max-w-md text-left font-sans text-[0.8rem] leading-relaxed text-ink-faint">
            How updates work: Realtime on your{' '}
            <code className="text-ink-secondary">match_queue</code> row triggers refresh; fallback
            snapshot polling starts at {POLL_MS_BEFORE_REALTIME}ms then slows to{' '}
            {POLL_MS_WITH_REALTIME}ms once subscribed. Also refreshes when the tab becomes visible.
          </p>
        ) : null}

        {q ? (
          <div
            className="mt-8 w-full rounded-xl border border-line/70 bg-navy-dark/60 px-4 py-3 text-left font-sans text-sm text-ink-secondary"
            aria-live="polite"
          >
            <p className="text-ink-secondary">
              {q.side === 'A' ? 'Perspective A' : 'Perspective B'} — queue position{' '}
              <span className="tabular-nums text-ink-secondary">{q.queue_position}</span>
            </p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-faint">
              Waiting: {q.waiting_a} on perspective A · {q.waiting_b} on B. The room opens when we
              can take {MATCHMAKING_SIDE_SIZE} from each side.
            </p>
            <p className="mt-3 text-[0.8rem] leading-relaxed text-ink-faint">
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

        <div className="mt-10 flex w-full max-w-sm flex-col gap-4 text-left" aria-live="polite">
          {['A', 'B', 'C'].map((label, i) =>
            slots[i] ? (
              <div key={label} className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full border-2 border-teal/40 animate-pulse" />
                <span className="font-sans text-sm text-ink-faint">Participant {label}</span>
              </div>
            ) : null,
          )}
        </div>

        <p className="mt-10 max-w-md text-left font-sans text-[0.8rem] leading-relaxed text-ink-faint">
          Cold start tip: orgs and cohorts often run fixed windows (e.g. top of the hour) so people
          arrive together. Until then, we’ll hold your spot in the queue while this tab stays open.
          {import.meta.env.DEV ? (
            <> {MATCH_QUEUE_NO_SERVER_TIMEOUT}</>
          ) : (
            <>
              {' '}
              There’s no automatic queue timeout in this pilot — use Leave queue when you stop
              waiting.
            </>
          )}
        </p>

        {loadError ? (
          <p className="mt-4 font-sans text-[0.875rem] text-amber" role="alert">
            {import.meta.env.DEV
              ? loadError
              : 'Could not refresh your place in the queue. Check your connection or try leaving the queue and starting again.'}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void handleLeaveQueue()}
          className="sr-ghost-link mt-8 text-[0.9rem] font-medium"
        >
          Leave queue
        </button>
      </div>
    </div>
  );
}
