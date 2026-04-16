import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/env';
import { pollMatchmakingSnapshot } from '../lib/matchmakingClient';
import type { MatchmakingSnapshot } from '../lib/matchmakingClient';
import {
  MATCH_QUEUE_NO_SERVER_TIMEOUT,
  MATCHMAKING_SIDE_SIZE,
  MATCHED_SQUAD_TTL_HOURS,
} from '../lib/matchmakingConstants';
import { clearMatchmakingSession, readMatchmakingSession } from '../lib/matchmakingSession';
import { setLastSquadIdInStorage } from '../lib/squad';

const POLL_MS = 5000;
const SLOT_STAGGER_MS = [800, 1600, 2400] as const;

type Gate = 'loading' | 'no_pool' | 'waiting';

export function Match() {
  const navigate = useNavigate();
  const { supabase, session, ensureAnonymousSession } = useAuth();
  const configured = isSupabaseConfigured();
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
  }, [configured, supabase, ensureAnonymousSession, refresh]);

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

    return () => {
      void supabase.removeChannel(ch);
      clearInterval(poll);
    };
  }, [supabase, session?.user?.id, gate, refresh]);

  useEffect(() => {
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
  }, []);

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

  if (!configured) {
    return (
      <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16">
        <p className="max-w-md text-center font-sans text-sm text-slate-400">
          Configure Supabase to use live matching. You can still use the demo session from the home flow.
        </p>
        <Link to="/" className="mt-6 text-teal underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (gate === 'loading') {
    return (
      <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16">
        <div className="h-10 w-10 animate-pulse rounded-full border-2 border-teal-500/40" aria-hidden />
        <p className="mt-6 font-sans text-sm text-slate-500">Loading matching…</p>
      </div>
    );
  }

  if (gate === 'no_pool') {
    return (
      <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16">
        <h2 className="font-heading text-xl font-semibold text-slate-100">Start from intent</h2>
        <p className="mt-3 max-w-md text-center font-sans text-sm leading-relaxed text-slate-400">
          Matching starts after you set your intention and choose a perspective. That keeps the room balanced across
          sides.
        </p>
        <Link
          to="/intent"
          className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-teal px-8 py-3 font-heading text-[0.95rem] font-semibold text-[#0b0f1a]"
        >
          Set intention
        </Link>
      </div>
    );
  }

  const q = snapshot && snapshot.outcome === 'queued' ? snapshot : null;

  return (
    <div className="relative flex min-h-[calc(100dvh-120px)] flex-col items-center justify-center bg-[#070b12] px-6 py-16">
      <div className="relative flex max-w-lg flex-col items-center text-center">
        <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
          <div className="absolute h-24 w-24 rounded-full border-4 border-teal-500/30 animate-ping" aria-hidden />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20" />
        </div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-100 md:text-3xl">
          Finding your squad
        </h2>
        <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-slate-400 md:text-base">
          We form a room when there are at least {MATCHMAKING_SIDE_SIZE} people waiting on perspective A and{' '}
          {MATCHMAKING_SIDE_SIZE} on B in the same pool. Low traffic means longer waits. Matched squads expire after
          about {MATCHED_SQUAD_TTL_HOURS} hours.
        </p>

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
              Waiting in pool: {q.waiting_a} on A · {q.waiting_b} on B. The room opens when we can take {MATCHMAKING_SIDE_SIZE}{' '}
              from each side.
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
          Cold start tip: orgs and cohorts often run fixed windows (e.g. top of the hour) so people arrive together.
          Until then, we’ll hold your spot in the queue while this tab stays open. {MATCH_QUEUE_NO_SERVER_TIMEOUT}
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
