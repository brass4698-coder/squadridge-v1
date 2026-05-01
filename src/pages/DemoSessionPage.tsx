import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SessionStrategyRoomChrome } from '../components/session/SessionStrategyRoomChrome';
import { DEMO_PROPOSAL_ID, LAST_SQUAD_KEY, clearDemoSession, getDemoSession } from '../lib';

type DemoMessage = {
  id: string;
  senderLabel: string;
  body: string;
  sentAt: string;
  isOwn: boolean;
};

const SEED: DemoMessage[] = [
  {
    id: 'm1',
    senderLabel: 'Participant B',
    body: 'Proposons trois étapes pour sécuriser le corridor — accès, signalisation, et points neutres.',
    sentAt: '14:02',
    isOwn: false,
  },
  {
    id: 'm2',
    senderLabel: 'Participant C',
    body: '한국어로 핵심만: 먼저 민간인 우선 대피 경로를 합의해야 합니다.',
    sentAt: '14:04',
    isOwn: false,
  },
  {
    id: 'm3',
    senderLabel: 'Participant D',
    body: 'Agree on a single coordination frequency before we draft protocols — avoids crossed signals.',
    sentAt: '14:05',
    isOwn: false,
  },
];

const SEMAPHORE_IDENTITY_LOCAL_STORAGE_KEYS = [
  'squadridge_semaphore_identity',
  'squadridge_zk_identity',
];

export function DemoSessionPage() {
  const navigate = useNavigate();
  const anonymousId = useMemo(() => getDemoSession().anonymousId, []);
  const [messages, setMessages] = useState<DemoMessage[]>(SEED);
  const [composer, setComposer] = useState('');
  const [roomStarted] = useState(() => new Date());
  const [consentGiven, setConsentGiven] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!consentGiven) return;
    const text = composer.trim();
    if (!text) return;
    const next: DemoMessage = {
      id: `local-${Date.now()}`,
      senderLabel: 'You',
      body: text,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };
    setMessages((prev) => [...prev, next]);
    setComposer('');
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
    setMessages(SEED);
    setComposer('');
    setConsentGiven(false);
    navigate('/', { replace: true });
  }

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
        Offline squad demo
      </p>
      <SessionStrategyRoomChrome
        topic="Cross-border corridor — session preview"
        roomStartedAt={roomStarted}
        turnCta="(Demo) Take turns in any order. Live rooms follow your squad’s real phase state."
        interventionBanner="Demo: if Slow down was used, an intervention line would appear here from the database."
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
