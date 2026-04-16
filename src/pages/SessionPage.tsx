import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { SessionMessageItem } from '../components/SessionMessageItem';
import {
  SessionPageAuthSkeleton,
  SessionPageMessagesSkeleton,
} from '../components/session/SessionPageSkeleton';
import { SessionTranslationPanel } from '../components/SessionTranslationPanel';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useTranslation } from '../hooks/useTranslation';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { isAiPipelineEnabled, isSupabaseConfigured } from '../lib/env';
import { encodeSecureMessagePayload } from '../lib/messagePayload';
import { createDemoSquad } from '../lib/squad';
import { ensureSquadMessageKey } from '../lib/squadMessageKey';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { useMessagePlaintexts } from '../hooks/useMessagePlaintexts';
import { useSquad } from '../hooks/useSquad';
import { logIntervention, recordLocalToneAndMaybePersist } from '../lib/ai/pipeline';

const sessionLandingHeadingStyle: CSSProperties = {
  fontSize: 'clamp(2.2rem, 4vw, 3rem)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1.1,
  color: '#f1f5f9',
};

/** Active squad chat — matches onboarding / intent typography */
const sessionChatHeadingStyle: CSSProperties = {
  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: '#f1f5f9',
};

const PAUSE_MESSAGE_MS = 2000;
const SEND_COOLDOWN_MS = 15_000;

type DeliveryStatus = 'pending' | 'sent' | 'failed';

type OptimisticMessage = {
  optimisticId: string;
  squad_id: string;
  sender_id: string;
  encrypted_content: string;
  /** Shown immediately while ciphertext is stored for the insert. */
  plainBody: string;
  sent_at: string;
  status: string;
  deliveryStatus: DeliveryStatus;
};

export function SessionPage() {
  const { squadId: squadIdParam } = useParams<{ squadId?: string }>();
  /** Single `/session/:squadId?` route — normalize empty/undefined so landing vs room is stable. */
  const squadId =
    squadIdParam !== undefined && squadIdParam !== null && String(squadIdParam).trim().length > 0
      ? String(squadIdParam).trim()
      : undefined;
  const { pathname: sessionPathKey } = useLocation();
  const navigate = useNavigate();
  const { supabase, session, loading: authLoading, ensureAnonymousSession } = useAuth();
  const {
    messages,
    loading,
    error,
    refresh,
    realtimeStatus,
    applyLocalMessage,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useRealtimeMessages(squadId);
  const { data: squad, refetch: refetchSquad } = useSquad(squadId);
  const [messageKey, setMessageKey] = useState<CryptoKey | null>(null);
  const [archiving, setArchiving] = useState(false);
  const scrollRootRef = useRef<HTMLUListElement | null>(null);
  const loadOlderSentinelRef = useRef<HTMLLIElement | null>(null);
  const prefs = useUserPreferences();
  const { translate, modelLoading } = useTranslation();
  const online = useOnlineStatus();
  const receivedEpochById = useRef(new Map<string, number>());
  const translationWarmupDone = useRef(false);
  const lastRoomErrorToast = useRef<string | null>(null);

  const plaintextById = useMessagePlaintexts(messages, messageKey);

  useEffect(() => {
    if (!supabase || !squadId || !squad) {
      setMessageKey(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { key } = await ensureSquadMessageKey(supabase, squadId, squad);
        if (!cancelled) setMessageKey(key);
        if (!squad.message_encryption_key) {
          await refetchSquad();
        }
      } catch {
        if (!cancelled) setMessageKey(null);
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

  useEffect(() => {
    if (!error) {
      lastRoomErrorToast.current = null;
      return;
    }
    if (lastRoomErrorToast.current === error) return;
    lastRoomErrorToast.current = error;
    toast.error(error);
  }, [error]);

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
  const [demoError, setDemoError] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  /** Power of Pause: brief breathing message over the composer */
  const [slowDownBreathing, setSlowDownBreathing] = useState(false);
  /** After breathing, Send is cooled down until this timestamp (epoch ms) */
  const [sendCooldownUntil, setSendCooldownUntil] = useState<number | null>(null);
  const [, setCooldownTick] = useState(0);

  const configured = isSupabaseConfigured();

  const sendPaused =
    sendCooldownUntil !== null && Date.now() < sendCooldownUntil;
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

  async function handleCreateDemo() {
    if (!supabase) return;
    setDemoError(null);
    try {
      await ensureAnonymousSession();
      const id = await createDemoSquad(supabase);
      navigate(`/session/${id}`, { replace: true });
    } catch (e) {
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

  async function handleSend() {
    if (!supabase || !squadId || !composer.trim()) return;
    if (sendPaused) return;
    if (!online) {
      toast.warning('You appear to be offline. Reconnect, then send your message.');
      return;
    }
    if (squad?.archived_at) {
      toast.error('This squad is archived. Messaging is disabled.');
      return;
    }
    setSending(true);
    const text = composer.trim();
    setComposer('');
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
    try {
      const { key } = await ensureSquadMessageKey(supabase, squadId, squad);
      enc = await encodeSecureMessagePayload(text, key);
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
    const optimistic: OptimisticMessage = {
      optimisticId,
      squad_id: squadId,
      sender_id: user.id,
      encrypted_content: enc,
      plainBody: text,
      sent_at: new Date().toISOString(),
      status: 'active',
      deliveryStatus: 'pending',
    };
    setOptimisticMessages((prev) => [...prev, optimistic]);

    const { data: insertedRow, error: sendError } = await supabase
      .from('messages')
      .insert({
        squad_id: squadId,
        sender_id: user.id,
        encrypted_content: enc,
      })
      .select()
      .single();

    if (sendError) {
      setOptimisticMessages((prev) =>
        prev.map((m) => (m.optimisticId === optimisticId ? { ...m, deliveryStatus: 'failed' } : m)),
      );
      setComposer(text);
      setSending(false);
      toast.error(
        sendError.message?.trim()
          ? `Message could not be sent: ${sendError.message}`
          : 'Message could not be sent. Check your connection and try again.',
      );
      return;
    }

    setOptimisticMessages((prev) => prev.filter((m) => m.optimisticId !== optimisticId));
    if (insertedRow) {
      applyLocalMessage(insertedRow);
    }

    if (isAiPipelineEnabled() && squadId) {
      const { persistOk } = await recordLocalToneAndMaybePersist(supabase, squadId, text);
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
    await supabase.from('messages').update({ status: 'retracted' }).eq('id', messageId);
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
          Configure Supabase environment variables to use the squad room. See the home page for setup steps.
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

  if (!squadId) {
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
            Open a squad to exchange structured messages. Live rooms require sign-in, callsign, and role (complete
            onboarding). For development, you can still spin a private demo squad from this page when Supabase is
            configured.
          </p>
        </header>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center border-0 bg-teal px-8 py-[0.65rem] font-heading text-[0.95rem] text-[#0b0f1a] transition-opacity duration-150 ease-out hover:opacity-[0.88] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              borderRadius: 8,
              fontWeight: 600,
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
            onClick={() => void handleCreateDemo()}
            disabled={!supabase}
          >
            Create demo squad
          </button>
          <Link
            to="/onboarding"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center border border-solid border-[#2d3f55] bg-transparent px-8 py-[0.65rem] font-heading text-[0.95rem] font-medium text-[#a8b2c1] transition-colors duration-150 hover:border-[#3d4f63] hover:text-[#c4cdd9]"
            style={{
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            Review onboarding
          </Link>
        </div>
        {demoError ? (
          <p className="mt-6 max-w-[440px] font-sans text-[0.875rem] text-amber" role="alert">
            {demoError}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section
      key={sessionPathKey}
      className="session-chat-page mx-auto flex w-full max-w-[680px] flex-1 flex-col gap-6 px-6 pb-16 pt-[80px]"
      aria-labelledby="session-title"
    >
      <header className="flex flex-col">
        <h1 id="session-title" className="font-heading" style={sessionChatHeadingStyle}>
          Squad session
        </h1>
        <p className="mt-1 font-heading text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-[#4b5563]">
          Private room
        </p>
      </header>

      {squad?.archived_at ? (
        <div
          className="rounded-[8px] border border-amber/40 bg-[#1a1408] px-4 py-3 font-sans text-[0.8125rem] text-[#f5d7a3]"
          role="status"
        >
          This squad is archived. You can still read history and export a transcript; new messages are disabled.
        </div>
      ) : null}

      <SessionTranslationPanel modelLoading={modelLoading} />

      {error ? (
        <p className="font-sans text-[0.875rem] text-amber" role="alert">
          {error}
        </p>
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
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-b border-[#1a2236] px-4 py-2">
          {!squad?.archived_at ? (
            <button
              type="button"
              className="font-sans text-[0.75rem] font-medium text-[#4b5563] transition-colors hover:text-amber"
              disabled={archiving}
              onClick={() => void handleArchiveSquad()}
            >
              {archiving ? 'Archiving…' : 'Archive squad'}
            </button>
          ) : null}
          <button
            type="button"
            className="font-sans text-[0.75rem] font-medium text-[#4b5563] transition-colors hover:text-[#a8b2c1]"
            onClick={() => handleExportTranscript()}
          >
            Export transcript
          </button>
          <button
            type="button"
            className="font-sans text-[0.75rem] font-medium text-[#4b5563] transition-colors hover:text-[#a8b2c1]"
            onClick={() => void refresh()}
          >
            Refresh
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-6 pt-4">
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
            disabled={sending || slowDownBreathing || !online || Boolean(squad?.archived_at)}
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
            disabled={
              sending || !composer.trim() || sendPaused || !online || Boolean(squad?.archived_at)
            }
          >
            {sending ? 'Sending…' : !online ? 'Offline' : 'Send'}
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
  );
}
