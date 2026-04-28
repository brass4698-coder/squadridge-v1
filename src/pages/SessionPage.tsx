import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  SessionFeatureErrorBoundary,
  SessionMessageItem,
  SessionPageAuthSkeleton,
  SessionPageMessagesSkeleton,
  SessionRoomEntryTransition,
  SessionSafetyStrip,
  SessionTranslationPanel,
  SquadPeerStrip,
} from '../components';
import { SessionStrategyRoomChrome } from '../components/session/SessionStrategyRoomChrome';
import { useAuth } from '../contexts/AuthContext';
import {
  useMessagePlaintexts,
  useOnlineStatus,
  useRealtimeMessages,
  useSquad,
  useSquadInterventions,
  useSquadPeerProfiles,
  useTranslation,
  useUserPreferences,
} from '../hooks';
import {
  addSessionLifecycleBreadcrumb,
  captureAppError,
  encodeSecureMessagePayload,
  ensureSquadMessageKey,
  isAiPipelineEnabled,
  isSupabaseConfigured,
  logIntervention,
  recordLocalToneAndMaybePersist,
  enqueuePendingSend,
  listPendingSendsForSquad,
  removePendingSend,
  SEND_RETRY_ATTEMPTS,
  SEND_QUEUE_BROADCAST_CHANNEL,
  sendRetryDelayMs,
  setSentrySquadContext,
  sleep,
  assertEdgeRateLimit,
  MATCHED_SQUAD_TTL_HOURS,
  type Database,
} from '../lib';
import { redactOutgoingLiveMessage } from '../lib/liveMessageRedaction';

/**
 * SessionPage — verified-anonymous squad dialogue room (app-layer encrypted payloads, realtime, optional translation).
 * Requires auth and a complete profile via {@link SessionAccess}.
 */
const PAUSE_MESSAGE_MS = 2000;
const SEND_COOLDOWN_MS = 15_000;

type DeliveryStatus = 'pending' | 'sent' | 'failed';

type OptimisticMessage = {
  optimisticId: string;
  squad_id: string;
  sender_id: string;
  payload_ciphertext: string;
  /** Shown immediately while ciphertext is stored for the insert. */
  plainBody: string;
  sent_at: string;
  status: string;
  deliveryStatus: DeliveryStatus;
};

export function SessionPage({ squadId }: { squadId: string }) {
  const { pathname: sessionPathKey } = useLocation();
  const { supabase, session, loading: authLoading } = useAuth();
  const {
    messages,
    loading,
    queryError,
    realtimeError,
    retryRealtimeConnection,
    refresh,
    realtimeStatus,
    applyLocalMessage,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRealtimeMessages(squadId);
  const {
    data: squad,
    isSuccess: squadQuerySuccess,
    isPending: squadQueryPending,
    isError: squadQueryIsError,
    error: squadQueryError,
    refetch: refetchSquad,
  } = useSquad(squadId);
  const { data: interventionRows = [] } = useSquadInterventions(supabase, squadId);
  const { data: squadPeers = [] } = useSquadPeerProfiles(squadId);
  const [messageKey, setMessageKey] = useState<CryptoKey | null>(null);
  const [messageKeyMaterial, setMessageKeyMaterial] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  const scrollRootRef = useRef<HTMLUListElement | null>(null);
  const loadOlderSentinelRef = useRef<HTMLLIElement | null>(null);
  const prefs = useUserPreferences();
  const { translate, modelLoading } = useTranslation();
  const online = useOnlineStatus();
  const receivedEpochById = useRef(new Map<string, number>());
  const translationWarmupDone = useRef(false);

  useEffect(() => {
    setSentrySquadContext(squadId);
  }, [squadId]);

  useEffect(() => {
    addSessionLifecycleBreadcrumb('enter', { squadId });
    return () => addSessionLifecycleBreadcrumb('leave', { squadId });
  }, [squadId]);

  useEffect(() => {
    if (!supabase || !squadId || !squad) {
      setMessageKey(null);
      setMessageKeyMaterial(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { key, keyBase64 } = await ensureSquadMessageKey(supabase, squadId, squad);
        if (!cancelled) {
          setMessageKey(key);
          setMessageKeyMaterial(keyBase64);
        }
        if (!squad.message_encryption_key) {
          await refetchSquad();
        }
      } catch (e) {
        captureAppError(e, { feature: 'session_message_key', extra: { squadId } });
        if (!cancelled) {
          setMessageKey(null);
          setMessageKeyMaterial(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, squadId, squad, refetchSquad]);

  useEffect(() => {
    const root = scrollRootRef.current;
    const target = loadOlderSentinelRef.current;
    if (!root || !target || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root, rootMargin: '80px 0px 0px 0px', threshold: 0 },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, messages.length]);

  const userId = session?.user?.id ?? null;

  function epochForMessage(messageId: string): number {
    const map = receivedEpochById.current;
    if (!map.has(messageId)) {
      map.set(messageId, prefs.translationPreferenceEpoch);
    }
    return map.get(messageId)!;
  }

  useEffect(() => {
    if (translationWarmupDone.current || !prefs.translationEnabled) return;
    translationWarmupDone.current = true;
    void translate('Hello.', prefs.preferredLanguage);
  }, [prefs.translationEnabled, prefs.preferredLanguage, translate]);
  const [composer, setComposer] = useState('');
  const [sending, setSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  /** Power of Pause: brief breathing message over the composer */
  const [slowDownBreathing, setSlowDownBreathing] = useState(false);
  /** After breathing, Send is cooled down until this timestamp (epoch ms) */
  const [sendCooldownUntil, setSendCooldownUntil] = useState<number | null>(null);
  const [, setCooldownTick] = useState(0);

  const configured = isSupabaseConfigured();

  const sendPaused = sendCooldownUntil !== null && Date.now() < sendCooldownUntil;
  const sendCooldownSecondsRemaining = sendCooldownUntil
    ? Math.max(0, Math.ceil((sendCooldownUntil - Date.now()) / 1000))
    : 0;

  useEffect(() => {
    if (!sendCooldownUntil || Date.now() >= sendCooldownUntil) return;
    const id = window.setInterval(() => {
      setCooldownTick((n) => n + 1);
      if (Date.now() >= sendCooldownUntil) {
        setSendCooldownUntil(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sendCooldownUntil]);

  const [httpDegraded, setHttpDegraded] = useState(false);
  const flushLockRef = useRef(false);
  const tabIdRef = useRef<string>(
    typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `squadridge-tab-${Math.random().toString(36).slice(2)}`,
  );
  const sendQueueBcRef = useRef<BroadcastChannel | null>(null);
  const composerDraftKey = `squadridge-composer-draft:${squadId}`;
  const optimisticRef = useRef<OptimisticMessage[]>([]);
  optimisticRef.current = optimisticMessages;

  const mergePendingFromIndexedDb = useCallback(() => {
    return listPendingSendsForSquad(squadId).then((rows) => {
      const fromDb = rows.map((r) => ({
        optimisticId: r.localId,
        squad_id: r.squadId,
        sender_id: r.senderId,
        payload_ciphertext: r.payload_ciphertext,
        plainBody: r.plainBody,
        sent_at: r.createdAt,
        status: 'active',
        deliveryStatus: 'pending' as const,
      }));
      setOptimisticMessages((prev) => {
        if (prev.length === 0) return fromDb;
        const seen = new Set(prev.map((p) => p.optimisticId));
        return [...prev, ...fromDb.filter((x) => !seen.has(x.optimisticId))];
      });
    });
  }, [squadId]);

  const plaintextById = useMessagePlaintexts(messages, messageKey, messageKeyMaterial);

  const tryInsertMessage = useCallback(
    async (m: OptimisticMessage): Promise<{ ok: boolean }> => {
      if (!supabase) return { ok: false };
      try {
        await assertEdgeRateLimit(supabase, 'messages_insert');
      } catch (e) {
        captureAppError(e instanceof Error ? e : new Error('rate limit'), {
          feature: 'message_send',
          extra: { squadId: m.squad_id },
        });
        return { ok: false };
      }
      type IngestPayload = { message: Database['public']['Tables']['messages']['Row'] };
      const { data, error: fnError } = await supabase.functions.invoke<IngestPayload>(
        'ingest-message',
        {
          body: {
            squad_id: m.squad_id,
            payload_ciphertext: m.payload_ciphertext,
          },
        },
      );

      if (fnError) {
        captureAppError(new Error(fnError.message || 'ingest-message failed'), {
          feature: 'message_send',
          extra: { squadId: m.squad_id, code: fnError.name },
        });
        return { ok: false };
      }
      const insertedRow = data?.message;
      if (!insertedRow) {
        captureAppError(new Error('ingest-message returned no row'), {
          feature: 'message_send',
          extra: { squadId: m.squad_id },
        });
        return { ok: false };
      }
      await removePendingSend(m.optimisticId);
      setOptimisticMessages((prev) => prev.filter((x) => x.optimisticId !== m.optimisticId));
      applyLocalMessage(insertedRow);
      return { ok: true };
    },
    [supabase, applyLocalMessage],
  );

  const tryInsertWithBackoff = useCallback(
    async (m: OptimisticMessage): Promise<{ ok: boolean }> => {
      for (let attempt = 0; attempt < SEND_RETRY_ATTEMPTS; attempt++) {
        const result = await tryInsertMessage(m);
        if (result.ok) return { ok: true };
        if (attempt < SEND_RETRY_ATTEMPTS - 1) {
          await sleep(sendRetryDelayMs(attempt));
        }
      }
      return { ok: false };
    },
    [tryInsertMessage],
  );

  const flushPendingMessages = useCallback(
    async (options?: { quietly?: boolean }) => {
      if (!supabase || !squadId || sending) return;
      const quietly = options?.quietly === true;
      if (!quietly) {
        sendQueueBcRef.current?.postMessage({
          type: 'flush-needed',
          squadId,
          fromTab: tabIdRef.current,
        });
      }

      const work = async () => {
        if (flushLockRef.current) return;
        flushLockRef.current = true;
        try {
          for (;;) {
            const pending = optimisticRef.current.filter((x) => x.deliveryStatus === 'pending');
            if (pending.length === 0) break;
            const m = pending[0]!;
            const result = await tryInsertWithBackoff(m);
            if (!result.ok) {
              setOptimisticMessages((prev) =>
                prev.map((x) =>
                  x.optimisticId === m.optimisticId ? { ...x, deliveryStatus: 'failed' } : x,
                ),
              );
              setHttpDegraded(true);
              break;
            }
          }
        } finally {
          flushLockRef.current = false;
        }
      };

      const lockName = `squadridge-session-send-queue-${squadId}`;
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.locks !== 'undefined' &&
        typeof navigator.locks.request === 'function'
      ) {
        await navigator.locks.request(lockName, { mode: 'exclusive' }, work);
      } else {
        await work();
      }
    },
    [supabase, squadId, sending, tryInsertWithBackoff],
  );

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const ch = new BroadcastChannel(SEND_QUEUE_BROADCAST_CHANNEL);
    sendQueueBcRef.current = ch;
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data as { type?: string; squadId?: string; fromTab?: string };
      if (!d || d.fromTab === tabIdRef.current) return;
      if (d.squadId !== squadId) return;
      if (d.type === 'pending-enqueued') {
        void mergePendingFromIndexedDb().then(() => {
          void flushPendingMessages({ quietly: true });
        });
        return;
      }
      if (d.type === 'flush-needed') {
        void flushPendingMessages({ quietly: true });
      }
    };
    ch.addEventListener('message', onMsg);
    return () => {
      ch.removeEventListener('message', onMsg);
      ch.close();
      sendQueueBcRef.current = null;
    };
  }, [squadId, flushPendingMessages, mergePendingFromIndexedDb]);

  useEffect(() => {
    void mergePendingFromIndexedDb();
  }, [mergePendingFromIndexedDb]);

  useEffect(() => {
    if (!composerDraftKey) return;
    try {
      const saved = sessionStorage.getItem(composerDraftKey);
      setComposer(saved ?? '');
    } catch {
      /* sessionStorage may be unavailable */
    }
  }, [squadId, composerDraftKey]);

  useEffect(() => {
    if (!composerDraftKey) return;
    const id = window.setTimeout(() => {
      try {
        if (composer.trim()) sessionStorage.setItem(composerDraftKey, composer);
        else sessionStorage.removeItem(composerDraftKey);
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(id);
  }, [composer, composerDraftKey]);

  /** Drop optimistic rows when the server list already contains the same ciphertext (race: realtime before client applies insert). */
  useEffect(() => {
    if (!userId || optimisticMessages.length === 0 || messages.length === 0) return;
    const toRemove = optimisticMessages.filter((o) =>
      messages.some(
        (m) =>
          m.sender_id === o.sender_id &&
          m.payload_ciphertext === o.payload_ciphertext &&
          Math.abs(new Date(m.sent_at).getTime() - new Date(o.sent_at).getTime()) < 8_000,
      ),
    );
    if (toRemove.length === 0) return;
    for (const o of toRemove) void removePendingSend(o.optimisticId);
    setOptimisticMessages((prev) =>
      prev.filter((x) => !toRemove.some((r) => r.optimisticId === x.optimisticId)),
    );
  }, [messages, userId, optimisticMessages]);

  useEffect(() => {
    if (!online || !supabase || !squadId || sending) return;
    if (optimisticMessages.length === 0) return;
    void flushPendingMessages();
  }, [online, supabase, squadId, sending, optimisticMessages.length, flushPendingMessages]);

  /** When live updates reconnect, flush pending sends with backoff (pairs with online flush). */
  useEffect(() => {
    if (realtimeStatus !== 'live' || !online || !supabase || !squadId || sending) return;
    if (optimisticMessages.length === 0) return;
    void flushPendingMessages();
  }, [
    realtimeStatus,
    online,
    supabase,
    squadId,
    sending,
    optimisticMessages.length,
    flushPendingMessages,
  ]);

  const handleRefreshMessages = useCallback(async () => {
    setRefreshingMessages(true);
    try {
      await refresh();
      setHttpDegraded(false);
    } finally {
      setRefreshingMessages(false);
    }
  }, [refresh]);

  async function handleRetrySend(optimisticId: string) {
    if (!supabase || !online) {
      toast.warning('Reconnect, then retry sending.');
      return;
    }
    const m = optimisticMessages.find((x) => x.optimisticId === optimisticId);
    if (!m) return;
    setSending(true);
    setOptimisticMessages((prev) =>
      prev.map((x) => (x.optimisticId === optimisticId ? { ...x, deliveryStatus: 'pending' } : x)),
    );
    const result = await tryInsertWithBackoff(m);
    if (!result.ok) {
      setOptimisticMessages((prev) =>
        prev.map((x) => (x.optimisticId === optimisticId ? { ...x, deliveryStatus: 'failed' } : x)),
      );
      setComposer(m.plainBody);
      toast.error(
        'Message could not be sent. Check your connection and tap Retry on the message below.',
      );
      setHttpDegraded(true);
    } else {
      setHttpDegraded(false);
    }
    setSending(false);
  }

  async function handleSend() {
    if (!supabase || !squadId || !composer.trim()) return;
    if (sendPaused) return;
    if (squad?.archived_at) {
      toast.error('This squad is archived. Messaging is disabled.');
      return;
    }
    setSending(true);
    const text = composer.trim();
    setComposer('');
    if (composerDraftKey) {
      try {
        sessionStorage.removeItem(composerDraftKey);
      } catch {
        /* ignore */
      }
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSending(false);
      return;
    }

    if (!squad) {
      setComposer(text);
      setSending(false);
      toast.error('Squad data not loaded yet.');
      return;
    }

    let enc: string;
    let bodyForSend: string;
    try {
      const { key } = await ensureSquadMessageKey(supabase, squadId, squad);
      bodyForSend = await redactOutgoingLiveMessage(text, squadId, user.id);
      enc = await encodeSecureMessagePayload(bodyForSend, key);
      if (!squad.message_encryption_key) {
        await refetchSquad();
      }
    } catch (e) {
      setComposer(text);
      setSending(false);
      toast.error(e instanceof Error ? e.message : 'Could not encrypt message.');
      return;
    }

    const optimisticId = crypto.randomUUID();
    const sentAt = new Date().toISOString();
    const optimistic: OptimisticMessage = {
      optimisticId,
      squad_id: squadId,
      sender_id: user.id,
      payload_ciphertext: enc,
      plainBody: bodyForSend,
      sent_at: sentAt,
      status: 'active',
      deliveryStatus: 'pending',
    };

    try {
      await enqueuePendingSend({
        localId: optimisticId,
        squadId,
        senderId: user.id,
        payload_ciphertext: enc,
        plainBody: bodyForSend,
        createdAt: sentAt,
      });
      sendQueueBcRef.current?.postMessage({
        type: 'pending-enqueued',
        squadId,
        fromTab: tabIdRef.current,
      });
    } catch {
      setComposer(text);
      setSending(false);
      toast.error('Could not save your message for retry. Try again.');
      return;
    }

    setOptimisticMessages((prev) => [...prev, optimistic]);

    if (!online) {
      setSending(false);
      toast.info('Offline — message saved. It will send when you are back online.');
      return;
    }

    const result = await tryInsertWithBackoff(optimistic);
    if (!result.ok) {
      setOptimisticMessages((prev) =>
        prev.map((x) => (x.optimisticId === optimisticId ? { ...x, deliveryStatus: 'failed' } : x)),
      );
      setComposer(text);
      setSending(false);
      toast.error(
        'Message could not be sent. It is saved — use Retry on the message or check your connection.',
      );
      setHttpDegraded(true);
      return;
    }

    setHttpDegraded(false);

    if (isAiPipelineEnabled() && squadId) {
      const { persistOk } = await recordLocalToneAndMaybePersist(supabase, squadId, bodyForSend);
      if (!persistOk) {
        toast.warning(
          'Your message was sent, but tone insight could not be saved. Dialogue continues as normal.',
        );
      }
    }

    setSending(false);
  }

  async function handleArchiveSquad() {
    if (!supabase || !squadId) return;
    setArchiving(true);
    const { error: upErr } = await supabase
      .from('squads')
      .update({ archived_at: new Date().toISOString(), status: 'archived' })
      .eq('id', squadId);
    setArchiving(false);
    if (upErr) {
      toast.error(upErr.message);
      return;
    }
    await refetchSquad();
    toast.success('Squad archived. Messaging is disabled.');
  }

  function handleExportTranscript() {
    if (!squadId) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      squadId,
      messages: messages.map((m) => ({
        id: m.id,
        sent_at: m.sent_at,
        sender_id: m.sender_id,
        body: plaintextById[m.id] ?? '',
        status: m.status,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `squad-${squadId}-transcript.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Transcript downloaded.');
  }

  async function handlePullBack(messageId: string) {
    if (!supabase) return;
    const { error } = await supabase
      .from('messages')
      .update({ status: 'retracted' })
      .eq('id', messageId);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  }

  function handleSlowDown() {
    if (slowDownBreathing) return;
    if (sendPaused) return;

    if (supabase && squadId) {
      void logIntervention(supabase, squadId, 'slow_down_clear');
    }

    setSlowDownBreathing(true);
    window.setTimeout(() => {
      setComposer('');
      setSlowDownBreathing(false);
      setSendCooldownUntil(Date.now() + SEND_COOLDOWN_MS);
    }, PAUSE_MESSAGE_MS);
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

  if (squadQueryPending) {
    return <SessionPageAuthSkeleton key={`${sessionPathKey}-squad`} />;
  }

  if (squadQueryIsError) {
    return (
      <section className="panel space-y-sm" aria-labelledby="session-squad-error">
        <h1 id="session-squad-error" className="font-heading text-fluid-h2 text-gray-light">
          Couldn&apos;t open this room
        </h1>
        <p className="text-fluid-body text-gray-light">
          {squadQueryError instanceof Error
            ? squadQueryError.message
            : 'Something went wrong while loading the squad.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-primary inline-flex w-fit"
            onClick={() => void refetchSquad()}
          >
            Try again
          </button>
          <Link
            to="/find-squad"
            className="inline-flex min-h-[44px] items-center self-center text-teal underline-offset-4 hover:underline"
          >
            Start a new search
          </Link>
        </div>
      </section>
    );
  }

  if (squadQuerySuccess && squad === null) {
    return (
      <section className="panel space-y-sm" aria-labelledby="session-squad-missing">
        <h1 id="session-squad-missing" className="font-heading text-fluid-h2 text-gray-light">
          This room isn&apos;t available anymore
        </h1>
        <p className="text-fluid-body text-gray-light">
          The squad may have expired or the link is no longer valid. Rooms typically expire after
          about {MATCHED_SQUAD_TTL_HOURS} hours.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link to="/find-squad" className="btn-primary inline-flex w-fit">
            Start a new search
          </Link>
          <Link
            to="/session"
            className="font-sans text-[0.9rem] text-teal underline-offset-4 hover:underline"
          >
            Session hub
          </Link>
        </div>
      </section>
    );
  }

  return (
    <SessionFeatureErrorBoundary squadId={squadId} key={squadId}>
      <SessionRoomEntryTransition key={squadId} squadId={squadId} />
      <section
        key={sessionPathKey}
        className="session-chat-page mx-auto flex w-full min-w-0 max-w-[680px] flex-1 flex-col gap-6 px-4 pb-16 pt-[72px] sm:px-6 sm:pt-[80px]"
        aria-labelledby="session-title"
      >
        <SessionStrategyRoomChrome
          topic={squad?.topic ?? 'Squad session'}
          roomStartedAt={squad ? new Date(squad.created_at) : new Date()}
          turnCta="When it is your turn, share one clear contribution. The phase rail is a local guide; your squad may move faster or slower than the labels suggest."
          interventionBanner={
            interventionRows[0]
              ? `Signal: ${interventionRows[0].intervention_type.replace(/_/g, ' ')}`
              : null
          }
          onReportRoom={() => {
            toast.message(
              `Room report reference: ${squadId.slice(0, 8)}… — MVP triage is manual; keep this tab if you need to share with support.`,
            );
          }}
          onReportParticipant={() => {
            toast.message(
              'Report participant: describe what happened without doxxing. MVP reviews use moderator tools.',
            );
          }}
        />

        <h1 id="session-title" className="sr-only">
          Squad session — {squad?.topic ?? squadId}
        </h1>

        <SquadPeerStrip peers={squadPeers} currentUserId={session?.user?.id} />

        <SessionSafetyStrip squadId={squadId} />

        {squad?.archived_at ? (
          <div
            className="rounded-[8px] border border-amber/40 bg-[#1a1408] px-4 py-3 font-sans text-[0.8125rem] text-[#f5d7a3]"
            role="status"
          >
            This squad is archived. You can still read history and export a transcript; new messages
            are disabled.
          </div>
        ) : null}

        <SessionTranslationPanel modelLoading={modelLoading} />

        {queryError || realtimeError ? (
          <div
            className="rounded-[8px] border border-amber/40 bg-[#1a1408] px-4 py-3 font-sans text-[0.8125rem] text-[#f5d7a3]"
            role="alert"
          >
            <p className="font-medium text-[#f5d7a3]">
              {realtimeError ? realtimeError : 'Could not load messages.'}
            </p>
            <p className="mt-2 text-[#c4a574]">
              {realtimeError
                ? 'You can still reload messages over HTTP. Try reconnecting live updates, or use Refresh now if the problem continues. Unsent messages stay saved until they send.'
                : queryError}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {realtimeError ? (
                <button
                  type="button"
                  className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border-0 bg-teal px-4 py-2 font-heading text-[0.85rem] font-semibold text-[#0b0f1a] transition-opacity hover:opacity-90"
                  onClick={() => retryRealtimeConnection()}
                >
                  Retry live connection
                </button>
              ) : null}
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border border-[#2d3f55] bg-transparent px-4 py-2 font-sans text-[0.85rem] font-medium text-[#a8b2c1] transition-colors hover:border-[#3d4f63] hover:text-[#e2e8f0] disabled:opacity-60"
                aria-busy={refreshingMessages}
                disabled={refreshingMessages}
                onClick={() => void handleRefreshMessages()}
              >
                {refreshingMessages ? 'Reloading…' : 'Reload messages'}
              </button>
              {realtimeError ? (
                <button
                  type="button"
                  className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border border-[#2d3f55] bg-transparent px-4 py-2 font-sans text-[0.85rem] font-medium text-[#a8b2c1] transition-colors hover:border-[#3d4f63] hover:text-[#e2e8f0]"
                  onClick={() => window.location.reload()}
                >
                  Refresh now
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {httpDegraded && online && !queryError && !realtimeError ? (
          <div
            className="rounded-[8px] border border-amber/30 bg-[#121a24] px-4 py-2.5 font-sans text-[0.8125rem] text-[#a8b2c1]"
            role="status"
          >
            Having trouble reaching the server. Failed messages stay in this room with a Retry
            action — or reconnect and they will try automatically.
          </div>
        ) : null}

        {realtimeStatus === 'offline' && !queryError ? (
          <div
            className="rounded-[8px] border border-amber/35 bg-[#1a1408] px-4 py-3 font-sans text-[0.8125rem] text-[#f5d7a3]"
            role="status"
          >
            <p className="font-medium text-[#f5d7a3]">Offline – waiting to reconnect</p>
            <p className="mt-2 text-[#c4a574]">
              Queued messages send when you are back online. Live updates resume automatically, or
              retry below.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border-0 bg-teal px-4 py-2 font-heading text-[0.85rem] font-semibold text-[#0b0f1a] transition-opacity hover:opacity-90"
                onClick={() => retryRealtimeConnection()}
              >
                Retry live connection
              </button>
              <button
                type="button"
                className="inline-flex min-h-[40px] items-center justify-center rounded-[8px] border border-[#2d3f55] bg-transparent px-4 py-2 font-sans text-[0.85rem] font-medium text-[#a8b2c1] transition-colors hover:border-[#3d4f63] hover:text-[#e2e8f0]"
                onClick={() => window.location.reload()}
              >
                Refresh now
              </button>
            </div>
          </div>
        ) : null}

        {(realtimeStatus === 'connecting' || realtimeStatus === 'reconnecting') && (
          <div
            className="flex items-center gap-2 rounded-[8px] border border-[#1a2236] bg-[#0a1018] px-4 py-2.5 font-sans text-[0.8125rem] text-[#a8b2c1]"
            role="status"
            aria-live="polite"
          >
            <span
              className="inline-block size-2 shrink-0 rounded-full bg-teal/80 motion-safe:animate-pulse"
              aria-hidden
            />
            {realtimeStatus === 'reconnecting' ? 'Reconnecting…' : 'Connecting live updates…'}
          </div>
        )}

        <div className="flex min-h-[280px] flex-col overflow-hidden rounded-[10px] border border-[#1a2236] bg-[#0f1623]">
          <div
            role="toolbar"
            aria-label="Squad session actions"
            className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-b border-[#1a2236] px-4 py-2 sm:gap-3"
          >
            {!squad?.archived_at ? (
              <button
                type="button"
                className="inline-flex min-h-[44px] items-center justify-center px-2 font-sans text-[0.75rem] font-medium text-[#4b5563] transition-colors hover:text-amber disabled:opacity-60"
                aria-busy={archiving}
                aria-label={archiving ? 'Archiving squad' : 'Archive squad'}
                disabled={archiving}
                onClick={() => void handleArchiveSquad()}
              >
                {archiving ? 'Archiving…' : 'Archive squad'}
              </button>
            ) : null}
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center justify-center px-2 font-sans text-[0.75rem] font-medium text-[#4b5563] transition-colors hover:text-[#a8b2c1]"
              aria-label="Export conversation transcript as JSON"
              onClick={() => handleExportTranscript()}
            >
              Export transcript
            </button>
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center justify-center px-2 font-sans text-[0.75rem] font-medium text-[#4b5563] transition-colors hover:text-[#a8b2c1] disabled:opacity-60"
              aria-busy={refreshingMessages}
              aria-label={
                refreshingMessages ? 'Refreshing messages' : 'Refresh messages from server'
              }
              disabled={refreshingMessages}
              onClick={() => void handleRefreshMessages()}
            >
              {refreshingMessages ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col p-4 pt-3 sm:p-6 sm:pt-4">
            <ul
              ref={scrollRootRef}
              className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
              aria-live="polite"
              aria-busy={loading}
              aria-label={loading ? 'Loading messages' : undefined}
            >
              {hasNextPage ? (
                <li
                  ref={loadOlderSentinelRef}
                  className="list-none py-2 text-center font-sans text-[0.72rem] text-[#4b5563]"
                  aria-hidden={!isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading earlier messages…' : '\u00a0'}
                </li>
              ) : null}
              {loading ? <SessionPageMessagesSkeleton count={5} /> : null}
              {messages.length === 0 && optimisticMessages.length === 0 && !loading ? (
                <li className="flex min-h-[200px] flex-1 flex-col items-center justify-center px-4 py-8 text-center font-sans text-[0.9rem] italic leading-relaxed text-[#3d4f63]">
                  No messages yet. Say hello calmly.
                </li>
              ) : null}
              {!loading
                ? messages.map((m) => {
                    const body = plaintextById[m.id] ?? '';
                    const retracted = m.status === 'retracted';
                    const isOwn = Boolean(userId && m.sender_id && m.sender_id === userId);
                    return (
                      <SessionMessageItem
                        key={m.id}
                        originalBody={body}
                        sentAtLabel={new Date(m.sent_at).toLocaleString()}
                        retracted={retracted}
                        isOwn={isOwn}
                        translationEnabled={prefs.translationEnabled}
                        preferredLanguage={prefs.preferredLanguage}
                        translationPreferenceEpoch={prefs.translationPreferenceEpoch}
                        receivedEpoch={epochForMessage(m.id)}
                        translate={translate}
                        onPullBack={() => void handlePullBack(m.id)}
                      />
                    );
                  })
                : null}
              {!loading
                ? optimisticMessages.map((m) => (
                    <SessionMessageItem
                      key={m.optimisticId}
                      originalBody={m.plainBody}
                      sentAtLabel={new Date(m.sent_at).toLocaleString()}
                      retracted={false}
                      isOwn={true}
                      translationEnabled={false}
                      preferredLanguage={prefs.preferredLanguage}
                      translationPreferenceEpoch={prefs.translationPreferenceEpoch}
                      receivedEpoch={prefs.translationPreferenceEpoch}
                      translate={translate}
                      onPullBack={() => undefined}
                      deliveryStatus={m.deliveryStatus}
                      onRetrySend={
                        m.deliveryStatus === 'failed'
                          ? () => void handleRetrySend(m.optimisticId)
                          : undefined
                      }
                      retryDisabled={sending}
                    />
                  ))
                : null}
            </ul>
          </div>
        </div>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
        >
          <div className="relative">
            <textarea
              id="composer"
              name="composer"
              aria-label="Message"
              rows={4}
              className="min-h-[100px] w-full resize-y rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-4 font-sans text-[0.95rem] leading-[1.65] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:outline-none focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:shadow-[0_0_0_3px_rgba(0,194,178,0.12)] disabled:opacity-60"
              placeholder="Write with intention…"
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              disabled={sending || slowDownBreathing || Boolean(squad?.archived_at)}
            />
            {slowDownBreathing ? (
              <div
                className="absolute inset-0 flex items-center justify-center rounded-[8px] bg-[#0f1623]/95 px-6"
                aria-live="polite"
              >
                <p className="max-w-[28ch] text-center font-sans text-[0.95rem] italic leading-relaxed text-[#4b5563]">
                  Take a breath. You can come back to this.
                </p>
              </div>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className={`inline-flex shrink-0 items-center justify-center border-0 bg-teal font-heading text-[0.95rem] text-[#0b0f1a] transition-opacity duration-150 hover:opacity-[0.88] disabled:cursor-not-allowed ${
                sendPaused ? 'pointer-events-none opacity-40' : 'disabled:opacity-50'
              }`}
              style={{
                borderRadius: 8,
                fontWeight: 600,
                padding: '0.6rem 1.75rem',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
              disabled={sending || !composer.trim() || sendPaused || Boolean(squad?.archived_at)}
            >
              {sending ? 'Sending…' : !online ? 'Queue message' : 'Send'}
            </button>
            {sendPaused && sendCooldownSecondsRemaining > 0 ? (
              <span className="font-sans text-[0.75rem] text-[#4b5563]" aria-live="polite">
                Sending again in {sendCooldownSecondsRemaining}s…
              </span>
            ) : null}
            <button
              type="button"
              className="inline-flex shrink-0 items-center justify-center border border-solid border-[#2d3f55] bg-transparent px-5 py-2.5 font-sans text-[0.95rem] text-[#a8b2c1] transition-colors duration-150 hover:border-[rgba(0,194,178,0.4)] hover:text-[#e2e8f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(0,194,178,0.35)] disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                borderRadius: 8,
                fontWeight: 500,
                backgroundColor: 'transparent',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
              disabled={slowDownBreathing || sendPaused || Boolean(squad?.archived_at)}
              onClick={handleSlowDown}
            >
              Slow down
            </button>
          </div>
        </form>
      </section>
    </SessionFeatureErrorBoundary>
  );
}
