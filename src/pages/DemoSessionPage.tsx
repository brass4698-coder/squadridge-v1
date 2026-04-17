import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_PROPOSAL_ID, getDemoSession } from '../lib/demoSession';

const sessionChatHeadingStyle: CSSProperties = {
  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: '#f1f5f9',
};

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

export function DemoSessionPage() {
  const anonymousId = useMemo(() => getDemoSession().anonymousId, []);
  const [messages, setMessages] = useState<DemoMessage[]>(SEED);
  const [composer, setComposer] = useState('');

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
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

  return (
    <section
      className="session-chat-page mx-auto flex w-full max-w-[680px] flex-1 flex-col gap-6 px-6 pb-16 pt-[80px]"
      aria-labelledby="demo-session-title"
    >
      <header className="flex flex-col gap-2">
        <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-amber/90">
          Investor demo · local only
        </p>
        <h1 id="demo-session-title" className="font-heading" style={sessionChatHeadingStyle}>
          Squad session
        </h1>
        <p className="font-heading text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-[#4b5563]">
          Cross-border corridor · Session {anonymousId.slice(0, 8)}…
        </p>
      </header>

      <div className="rounded-lg border border-[#1a2236] bg-[#0f1623]/80 px-4 py-3 font-sans text-[0.8rem] leading-relaxed text-[#8892a4]">
        Translation and live sync are disabled in this offline demo. Messages stay in your browser only.
      </div>

      <div className="flex min-h-[280px] flex-col overflow-hidden rounded-[10px] border border-[#1a2236] bg-[#0f1623]">
        <div className="flex min-h-0 flex-1 flex-col p-6 pt-4">
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
                <p className="mt-2 font-sans text-[0.95rem] leading-relaxed text-[#e2e8f0]">{m.body}</p>
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
          className="min-h-[100px] w-full resize-y rounded-[8px] border border-[#1a2236] bg-[#0f1623] px-4 py-4 font-sans text-[0.95rem] leading-[1.65] text-[#e2e8f0] placeholder:text-[#3d4f63] focus-visible:outline-none focus-visible:border-[rgba(0,194,178,0.4)] focus-visible:shadow-[0_0_0_3px_rgba(0,194,178,0.12)]"
          placeholder="Draft a protocol line… (saved locally)"
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            data-demo="session-send"
            className="inline-flex shrink-0 items-center justify-center border-0 bg-teal px-7 py-2.5 font-heading text-[0.95rem] font-semibold text-[#0b0f1a] transition-opacity hover:opacity-[0.88] disabled:cursor-not-allowed disabled:opacity-50"
            style={{ borderRadius: 8 }}
            disabled={!composer.trim()}
          >
            Send
          </button>
          <Link
            to={`/ledger/${DEMO_PROPOSAL_ID}`}
            className="inline-flex items-center justify-center border border-solid border-[#2d3f55] bg-transparent px-5 py-2.5 font-sans text-[0.95rem] text-[#a8b2c1] transition-colors hover:border-teal/40 hover:text-[#e2e8f0]"
            style={{ borderRadius: 8, fontWeight: 500 }}
          >
            Open ledger proposal
          </Link>
        </div>
      </form>
    </section>
  );
}
