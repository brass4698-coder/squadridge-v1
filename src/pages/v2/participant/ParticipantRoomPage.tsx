import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { useParticipantSession } from '../../../hooks/useParticipantSession';
import {
  participantListMessages,
  participantSendMessage,
  type ParticipantMessageRow,
} from '../../../lib/participantToken';
import { participantRoute } from '../../../lib/participantRoutes';

export function ParticipantRoomPage() {
  const token = useParticipantToken();
  const { ctx } = useParticipantSession(token);
  const [messages, setMessages] = useState<ParticipantMessageRow[]>([]);
  const [input, setInput] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const navigate = useNavigate();

  const loadMessages = useCallback(async () => {
    if (!token) return;
    const result = await participantListMessages(token);
    if (result.valid && result.messages) setMessages(result.messages);
  }, [token]);

  useEffect(() => {
    void loadMessages();
    const interval = setInterval(() => void loadMessages(), 4000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  async function send() {
    if (!input.trim() || !token) return;
    await participantSendMessage(token, input.trim());
    setInput('');
    await loadMessages();
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
          <h1 className="text-base font-semibold text-ink">
            {ctx?.session_title ?? 'Protected session'}
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
            const isYou = msg.sender_role === 'participant' && msg.sender_label === ctx?.codename;
            const isFacilitator = msg.sender_role === 'facilitator';
            return (
              <div key={msg.id} className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${isFacilitator ? 'text-brand' : 'text-ink-secondary'}`}
                  >
                    {isYou ? 'You' : msg.sender_label}
                    {isFacilitator ? ' · Facilitator' : ''}
                  </span>
                  <span className="text-xs text-ink-faint">
                    {new Date(msg.sent_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={`max-w-md rounded-xl px-5 py-3 text-sm leading-relaxed ${
                    isYou
                      ? 'bg-brand text-brand-on'
                      : isFacilitator
                        ? 'border border-brand/30 bg-brand-soft text-ink'
                        : 'border border-line bg-surface-elevated text-ink'
                  }`}
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
