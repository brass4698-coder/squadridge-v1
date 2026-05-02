import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Languages, Pause, Play } from 'lucide-react';
import { SessionStrategyRoomChrome } from '../components/session/SessionStrategyRoomChrome';
import { useDemoWalkthrough } from '../demo/DemoWalkthroughContext';
import { DEMO_PROPOSAL_ID, LAST_SQUAD_KEY, clearDemoSession, getDemoSession } from '../lib';

type DemoMessage = {
  id: string;
  senderLabel: string;
  body: string;
  sentAt: string;
  isOwn: boolean;
};

const SEMAPHORE_IDENTITY_LOCAL_STORAGE_KEYS = [
  'squadridge_semaphore_identity',
  'squadridge_zk_identity',
];

function formatClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Offline session preview.
 *
 * Beyond the static seeded transcript, the **Play scene** control streams a
 * scripted incoming-message sequence from the active scenario, fires a single
 * Slow down intervention banner mid-scene, and reveals a translation pair so
 * presenters can talk through the safety + multilingual story without leaving
 * the local-only demo. Nothing leaves the tab.
 */
export function DemoSessionPage() {
  const navigate = useNavigate();
  const { scenario } = useDemoWalkthrough();
  const anonymousId = useMemo(() => getDemoSession().anonymousId, []);

  const initialMessages: DemoMessage[] = useMemo(
    () =>
      scenario.seedMessages.map((m) => ({
        id: m.id,
        senderLabel: m.senderLabel,
        body: m.body,
        sentAt: m.sentAt,
        isOwn: false,
      })),
    [scenario.seedMessages],
  );

  const [messages, setMessages] = useState<DemoMessage[]>(initialMessages);
  const [composer, setComposer] = useState('');
  const [roomStarted] = useState(() => new Date());
  const [consentGiven, setConsentGiven] = useState(false);

  const [scenePlaying, setScenePlaying] = useState(false);
  const [interventionVisible, setInterventionVisible] = useState(false);
  const [translationVisible, setTranslationVisible] = useState(false);
  const sceneTimersRef = useRef<number[]>([]);

  useEffect(() => {
    setMessages(initialMessages);
    setInterventionVisible(false);
    setTranslationVisible(false);
    setScenePlaying(false);
    sceneTimersRef.current.forEach((id) => window.clearTimeout(id));
    sceneTimersRef.current = [];
  }, [initialMessages]);

  useEffect(() => {
    return () => {
      sceneTimersRef.current.forEach((id) => window.clearTimeout(id));
      sceneTimersRef.current = [];
    };
  }, []);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!consentGiven) return;
    const text = composer.trim();
    if (!text) return;
    const next: DemoMessage = {
      id: `local-${Date.now()}`,
      senderLabel: 'You',
      body: text,
      sentAt: formatClock(new Date()),
      isOwn: true,
    };
    setMessages((prev) => [...prev, next]);
    setComposer('');
  }

  function handlePlayScene() {
    if (scenePlaying) return;
    sceneTimersRef.current.forEach((id) => window.clearTimeout(id));
    sceneTimersRef.current = [];
    setScenePlaying(true);
    setInterventionVisible(false);
    setTranslationVisible(false);

    let cumulative = 0;
    scenario.scriptedIncoming.forEach((incoming, idx) => {
      cumulative += incoming.delayMs;
      const id = window.setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `scene-${Date.now()}-${idx}`,
            senderLabel: incoming.senderLabel,
            body: incoming.body,
            sentAt: formatClock(new Date()),
            isOwn: false,
          },
        ]);
      }, cumulative);
      sceneTimersRef.current.push(id);
    });

    // Intervention banner just after the second scripted message lands.
    const interventionAt =
      (scenario.scriptedIncoming[0]?.delayMs ?? 0) +
      (scenario.scriptedIncoming[1]?.delayMs ?? 0) +
      400;
    const interventionId = window.setTimeout(() => {
      setInterventionVisible(true);
    }, interventionAt);
    sceneTimersRef.current.push(interventionId);

    // Translation reveal alongside the third scripted message.
    const translationAt = cumulative + 200;
    const translationId = window.setTimeout(() => {
      setTranslationVisible(true);
      setScenePlaying(false);
    }, translationAt);
    sceneTimersRef.current.push(translationId);
  }

  function handleResetScene() {
    sceneTimersRef.current.forEach((id) => window.clearTimeout(id));
    sceneTimersRef.current = [];
    setScenePlaying(false);
    setInterventionVisible(false);
    setTranslationVisible(false);
    setMessages(initialMessages);
  }

  function handleLeaveAndForget() {
    try {
      clearDemoSession();
      localStorage.removeItem(LAST_SQUAD_KEY);
      for (const k of SEMAPHORE_IDENTITY_LOCAL_STORAGE_KEYS) {
        localStorage.removeItem(k);
      }
    } catch {
      /* ignore: storage may be unavailable in private mode */
    }
    handleResetScene();
    setComposer('');
    setConsentGiven(false);
    navigate('/', { replace: true });
  }

  const interventionBanner = interventionVisible
    ? scenario.interventionLine
    : 'Demo: if Slow down was used, an intervention line would appear here from the database.';

  return (
    <section
      className="session-chat-page mx-auto flex w-full min-w-0 max-w-[680px] flex-1 flex-col gap-6 px-4 pb-16 pt-[72px] sm:px-6 sm:pt-[80px]"
      aria-labelledby="demo-session-title"
    >
      <div
        role="status"
        className="rounded-lg border border-amber/45 bg-amber/10 px-4 py-3 font-sans text-[0.82rem] leading-relaxed text-amber"
      >
        <strong className="font-semibold text-amber">Demo only — your privacy:</strong> Messages you
        type here are kept in this browser tab and never leave it. This is a walkthrough, not a real
        session.
      </div>
      <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-amber/90">
        Offline squad demo · {scenario.shortLabel}
      </p>
      <SessionStrategyRoomChrome
        topic={`${scenario.label} — session preview`}
        roomStartedAt={roomStarted}
        turnCta="(Demo) Take turns in any order. Live rooms follow your squad’s real phase state."
        interventionBanner={interventionBanner}
        onReportRoom={() => {}}
        onReportParticipant={() => {}}
      />
      <h1 id="demo-session-title" className="sr-only">
        Squad session {anonymousId.slice(0, 8)}
      </h1>

      <div className="rounded-lg border border-[#1a2236] bg-[#0f1623]/80 px-4 py-3 font-sans text-[0.85rem] leading-relaxed text-[#a8b2c1]">
        <p className="font-medium text-[#e2e8f0]">What this demo does and doesn&apos;t do</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.82rem]">
          <li>
            <span className="font-medium text-[#c4cdd9]">Stays in your browser:</span> nothing you
            type is sent to a server, queue, or another participant.
          </li>
          <li>
            <span className="font-medium text-[#c4cdd9]">Not encrypted end-to-end</span> in real
            sessions either: live rooms use app-layer encryption, but trained facilitators may
            review messages flagged for safety. See{' '}
            <Link
              to="/security"
              className="font-medium text-teal-light underline-offset-4 hover:underline"
            >
              Security &amp; privacy
            </Link>
            .
          </li>
          <li>
            <span className="font-medium text-[#c4cdd9]">Translation and live sync are off</span>{' '}
            here. Real squads route messages through Supabase Realtime and the redaction pipeline.
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-500/[0.05] px-4 py-3">
        <p className="font-sans text-[0.8rem] leading-relaxed text-slate-300">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-teal-light">
            Presenter
          </span>{' '}
          Run the scripted scene to stream incoming messages, fire the Slow down intervention, and
          reveal translation. Everything stays local.
        </p>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            data-demo="session-play-scene"
            onClick={handlePlayScene}
            disabled={scenePlaying}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-md bg-teal px-3 py-2 font-heading text-[0.82rem] font-semibold text-[#0b0f1a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {scenePlaying ? (
              <>
                <Pause className="h-3.5 w-3.5" aria-hidden /> Playing…
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" aria-hidden /> Play scene
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleResetScene}
            disabled={scenePlaying}
            className="inline-flex min-h-[40px] items-center rounded-md border border-slate-600 bg-transparent px-3 py-2 font-sans text-[0.82rem] text-slate-300 hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-[#1a2236] bg-[#0b0f14] px-4 py-3">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => setConsentGiven(e.target.checked)}
          className="mt-1 h-4 w-4 cursor-pointer accent-teal"
          aria-describedby="demo-consent-help"
        />
        <span className="font-sans text-[0.85rem] leading-relaxed text-[#c4cdd9]">
          I understand this is a non-private demo and that anything I type stays in this browser
          tab.
          <span id="demo-consent-help" className="mt-1 block text-[0.78rem] text-[#5c6570]">
            Required before sending in this preview. Real sessions show a different consent flow.
          </span>
        </span>
      </label>

      <div className="flex min-h-[280px] flex-col overflow-hidden rounded-[10px] border border-[#1a2236] bg-[#0f1623]">
        <div className="flex min-h-0 flex-1 flex-col p-4 pt-3 sm:p-6 sm:pt-4">
          <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto" aria-live="polite">
            {messages.map((m) => (
              <li
                key={m.id}
                className={`rounded-lg border px-4 py-3 ${
                  m.isOwn
                    ? 'border-teal-500/35 bg-[#0b0f14]/90'
                    : 'border-[#1a2236] bg-[#0b0f14]/80'
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-heading text-[0.7rem] font-semibold uppercase tracking-wide text-[#64748b]">
                    {m.senderLabel}
                  </span>
                  <span className="font-sans text-[0.7rem] text-[#4b5563]">{m.sentAt}</span>
                </div>
                <p className="mt-2 font-sans text-[0.95rem] leading-relaxed text-[#e2e8f0]">
                  {m.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {translationVisible ? (
        <div
          className="flex flex-col gap-2 rounded-lg border border-teal-500/35 bg-teal-500/[0.06] px-4 py-3"
          role="status"
        >
          <p className="flex items-center gap-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-teal-light">
            <Languages className="h-3.5 w-3.5" aria-hidden /> Translation reveal · on-device
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <p className="rounded-md bg-[#070b12]/70 px-3 py-2 font-sans text-[0.82rem] text-slate-300">
              <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">
                Source
              </span>
              {scenario.translationReveal.source}
            </p>
            <p className="rounded-md bg-[#070b12]/70 px-3 py-2 font-sans text-[0.82rem] text-slate-100">
              <span className="block font-mono text-[0.6rem] uppercase tracking-[0.14em] text-teal-light">
                {scenario.persona.language}
              </span>
              {scenario.translationReveal.translated}
            </p>
          </div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-slate-500">
            Demo: real translation runs in a Web Worker; nothing is sent to a translation server.
          </p>
        </div>
      ) : null}

      <form className="flex flex-col" onSubmit={handleSend}>
        <textarea
          id="demo-composer"
          name="demo-composer"
          data-demo="session-composer"
          aria-label="Message"
          rows={4}
          disabled={!consentGiven}
          className="min-h-[100px] w-full resize-y rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-4 font-sans text-[0.95rem] leading-[1.65] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:outline-none focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:shadow-[0_0_0_3px_rgba(0,194,178,0.12)] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder={
            consentGiven
              ? 'Draft a protocol line… (saved locally)'
              : 'Acknowledge the demo notice above to start drafting.'
          }
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            data-demo="session-send"
            className="inline-flex min-h-[44px] min-w-0 items-center justify-center border-0 bg-teal px-6 py-2.5 font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity hover:opacity-[0.88] disabled:cursor-not-allowed disabled:opacity-50 sm:px-7"
            style={{ borderRadius: 8 }}
            disabled={!consentGiven || !composer.trim()}
          >
            Send
          </button>
          <Link
            to={`/ledger/${DEMO_PROPOSAL_ID}`}
            className="inline-flex min-h-[44px] min-w-0 items-center justify-center border border-solid border-[#2d3f55] bg-transparent px-5 py-2.5 font-sans text-[0.95rem] text-[#a8b2c1] transition-colors hover:border-teal/40 hover:text-[#e2e8f0]"
            style={{ borderRadius: 8, fontWeight: 500 }}
          >
            Open ledger proposal
          </Link>
          <button
            type="button"
            data-demo="session-leave-and-forget"
            onClick={handleLeaveAndForget}
            className="ml-auto inline-flex items-center justify-center rounded-[8px] border border-[#2d3f55] bg-transparent px-4 py-2 font-sans text-[0.85rem] text-[#94a3b8] transition-colors hover:border-amber/50 hover:text-amber"
          >
            Leave and forget
          </button>
        </div>
        <p className="mt-2 font-sans text-[0.72rem] text-[#5c6570]">
          <span className="font-medium text-[#94a3b8]">Leave and forget</span> clears the demo
          session, last-squad pointer, and any local Semaphore identity stored by this browser, then
          returns you to the home page.
        </p>
      </form>
    </section>
  );
}
