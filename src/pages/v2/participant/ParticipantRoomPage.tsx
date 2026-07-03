import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { participantRoute } from '../../../lib/participantRoutes';

type Message = { id: string; from: string; role: string; body: string; time: string };

const seedMessages: Message[] = [
  {
    id: 'm1',
    from: 'Facilitator',
    role: 'Facilitator',
    body: 'Welcome, everyone. We will begin shortly. Please confirm you can read this message.',
    time: '10:01 AM',
  },
  {
    id: 'm2',
    from: 'Amara N.',
    role: 'Participant',
    body: 'Confirmed — I can read this.',
    time: '10:02 AM',
  },
  { id: 'm3', from: 'Jonas B.', role: 'Participant', body: 'Ready here.', time: '10:03 AM' },
];

export function ParticipantRoomPage() {
  const token = useParticipantToken();
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [input, setInput] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const navigate = useNavigate();

  function send() {
    if (!input.trim()) return;
    const msg: Message = {
      id: `m${Date.now()}`,
      from: 'You',
      role: 'Participant',
      body: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((m) => [...m, msg]);
    setInput('');
  }

  function leave() {
    if (!token) return;
    navigate(participantRoute('done', token));
  }

  if (!token) return null;

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-accent)' }}
          >
            Protected Session · Live
          </p>
          <h1 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Northern Watershed Consultation
          </h1>
        </div>
        <button
          onClick={() => setConfirmLeave(true)}
          className="rounded border px-4 py-2 text-sm transition-opacity hover:opacity-70"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          Leave Session
        </button>
      </div>

      {/* Confidentiality strip */}
      <div
        className="border-b px-6 py-2.5 text-center text-xs"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-accent-light)',
          color: 'var(--color-accent)',
        }}
      >
        This dialogue is private. Nothing said here will be shared publicly without explicit
        approval.
      </div>

      {/* Messages */}
      <main
        className="flex-1 overflow-y-auto px-6 py-6"
        aria-label="Session dialogue"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="mx-auto max-w-2xl flex flex-col gap-4">
          {messages.map((msg) => {
            const isYou = msg.from === 'You';
            const isFacilitator = msg.role === 'Facilitator';
            return (
              <div key={msg.id} className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isFacilitator ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                    }}
                  >
                    {msg.from} {isFacilitator ? '· Facilitator' : ''}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {msg.time}
                  </span>
                </div>
                <div
                  className="max-w-md rounded-xl px-5 py-3 text-sm leading-relaxed"
                  style={{
                    backgroundColor: isYou
                      ? 'var(--color-accent)'
                      : isFacilitator
                        ? 'var(--color-accent-light)'
                        : 'var(--color-surface)',
                    color: isYou ? '#fff' : 'var(--color-text-primary)',
                    border: isYou ? 'none' : `1px solid var(--color-border)`,
                  }}
                >
                  {msg.body}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Input */}
      <div
        className="border-t p-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="mx-auto flex max-w-2xl gap-3">
          <label htmlFor="participant-input" className="sr-only">
            Your message
          </label>
          <textarea
            id="participant-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Write your contribution… (Enter to send, Shift+Enter for new line)"
            className="flex-1 resize-none rounded border px-4 py-2.5 text-sm outline-none transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="shrink-0 rounded px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Send
          </button>
        </div>
        <p className="mt-2 text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Private · Not recorded · Only the approved outcome may be published
        </p>
      </div>

      {confirmLeave && (
        <ConfirmModal
          title="Leave this session?"
          body="You will exit the room. Your previous contributions remain in the session record for facilitator reference only and will not be published. You may not be able to re-enter."
          confirmLabel="Leave Session"
          cancelLabel="Stay"
          dangerous
          onConfirm={leave}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
    </div>
  );
}
