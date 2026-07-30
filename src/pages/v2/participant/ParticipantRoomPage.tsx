import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { SlowDownOverlay } from '../../../components/pacing/SlowDownOverlay';
import { SendCooldownBanner } from '../../../components/pacing/SendCooldownBanner';
import { PaceSuggestionChip } from '../../../components/pacing/PaceSuggestionChip';
import { UnsyncedBanner } from '../../../components/ui/UnsyncedBanner';
import { useSlowDown } from '../../../hooks/useSlowDown';
import { usePaceSignals } from '../../../hooks/usePaceSignals';
import { logPacingIntervention } from '../../../lib/pacing/logPacingIntervention';
import { pullBackMessage } from '../../../lib/pacing/pullBack';

type Message = {
  id: string;
  from: string;
  role: string;
  body: string;
  time: string;
  status?: 'sent' | 'retracted';
};

const seedMessages: Message[] = [
  {
    id: 'm1',
    from: 'Facilitator',
    role: 'Facilitator',
    body: 'Welcome, everyone. We will begin shortly. Please confirm you can read this message.',
    time: '10:01 AM',
    status: 'sent',
  },
  {
    id: 'm2',
    from: 'Amara N.',
    role: 'Participant',
    body: 'Confirmed — I can read this.',
    time: '10:02 AM',
    status: 'sent',
  },
  {
    id: 'm3',
    from: 'Jonas B.',
    role: 'Participant',
    body: 'Ready here.',
    time: '10:03 AM',
    status: 'sent',
  },
];

const PULL_BACK_WINDOW_MS = 60_000;

export function ParticipantRoomPage() {
  const { token } = useParams<{ token: string }>();
  const sessionKey = token ?? 'demo-room';
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [input, setInput] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [sentAtById, setSentAtById] = useState<Record<string, number>>({});
  const [roomPaused, setRoomPaused] = useState(false);
  const navigate = useNavigate();
  const slowDown = useSlowDown();
  const pace = usePaceSignals();

  const round = { current: 1, of: 3, approvalsRemaining: 2 };

  function send() {
    if (!input.trim() || slowDown.sendBlocked || roomPaused) return;
    const id = `m${Date.now()}`;
    const msg: Message = {
      id,
      from: 'You',
      role: 'Participant',
      body: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };
    setMessages((m) => [...m, msg]);
    setSentAtById((prev) => ({ ...prev, [id]: Date.now() }));
    setInput('');
    pace.onSend();
  }

  function leave() {
    navigate(`/p/done/${token ?? 'demo'}`);
  }

  function handleSlowDown(source: 'manual' | 'suggested' = 'manual') {
    const started = slowDown.trigger();
    if (!started) return;
    setInput('');
    pace.clear();
    void logPacingIntervention(
      sessionKey,
      source === 'suggested' ? 'slow_down_suggested_accept' : 'slow_down_self',
    );
  }

  async function handlePullBack(messageId: string) {
    const sentAt = sentAtById[messageId];
    if (sentAt && Date.now() - sentAt > PULL_BACK_WINDOW_MS) return;

    const result = await pullBackMessage(messageId, {
      idempotencyKey: `pullback:${messageId}`,
    });
    if (!result.ok) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status: 'retracted', body: '' } : m)),
    );
    pace.onRetract();
    void logPacingIntervention(sessionKey, 'pull_back_used');
  }

  return (
    <div className="flex h-screen flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <SlowDownOverlay open={slowDown.breathing} />

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
            Protected Session · {roomPaused ? 'Paused' : 'Live'}
          </p>
          <h1 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Northern Watershed Consultation
          </h1>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Round {round.current} of {round.of} · {round.approvalsRemaining} approvals remaining
            after dialogue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRoomPaused((p) => !p)}
            className="rounded border px-3 py-2 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            title="Simulates facilitator room pause (distinct from Slow down)"
          >
            {roomPaused ? 'Resume (demo)' : 'Pause (demo)'}
          </button>
          <button
            type="button"
            data-testid="slow-down-btn"
            onClick={() => handleSlowDown('manual')}
            disabled={slowDown.sendBlocked}
            className="rounded border px-4 py-2 text-sm transition-opacity hover:opacity-70 disabled:opacity-40"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Slow down
          </button>
          <button
            type="button"
            onClick={() => setConfirmLeave(true)}
            className="rounded border px-4 py-2 text-sm transition-opacity hover:opacity-70"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Leave Session
          </button>
        </div>
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

      <UnsyncedBanner />

      {roomPaused ? (
        <div
          role="status"
          className="border-b px-6 py-3 text-center text-sm"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-pending-strip)',
            color: 'var(--color-warning)',
          }}
        >
          Room paused by facilitator. You can keep reading. Sending resumes when the session is live
          again. (Slow down is a personal cooldown—different from this room pause.)
        </div>
      ) : null}

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
            const retracted = msg.status === 'retracted';
            const canPullBack =
              isYou &&
              !retracted &&
              Boolean(sentAtById[msg.id]) &&
              Date.now() - (sentAtById[msg.id] ?? 0) < PULL_BACK_WINDOW_MS;

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
                    opacity: retracted ? 0.7 : 1,
                  }}
                >
                  {retracted ? <em>Pulled back — content no longer shown.</em> : msg.body}
                </div>
                {canPullBack ? (
                  <button
                    type="button"
                    data-testid="pull-back-btn"
                    onClick={() => void handlePullBack(msg.id)}
                    className="mt-1 text-xs underline-offset-2 hover:underline"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Pull back
                  </button>
                ) : null}
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
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {pace.suggestion ? (
            <PaceSuggestionChip
              kind={pace.suggestion.kind}
              onAccept={() => handleSlowDown('suggested')}
              onDismiss={() => pace.dismiss()}
            />
          ) : null}
          <SendCooldownBanner remainingMs={slowDown.cooldownRemainingMs} />
          <div className="flex gap-3">
            <label htmlFor="participant-input" className="sr-only">
              Your message
            </label>
            <textarea
              id="participant-input"
              rows={2}
              value={input}
              disabled={slowDown.sendBlocked || roomPaused}
              onChange={(e) => {
                const next = e.target.value;
                pace.onComposerChange(next, input);
                setInput(next);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={
                roomPaused
                  ? 'Room paused — sending is closed until resume…'
                  : slowDown.sendBlocked
                    ? 'Sending paused — take a breath…'
                    : 'Write your contribution… (Enter to send, Shift+Enter for new line)'
              }
              className="flex-1 resize-none rounded border px-4 py-2.5 text-sm outline-none transition-colors disabled:opacity-60"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-primary)',
              }}
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || slowDown.sendBlocked || roomPaused}
              data-testid="send-message-btn"
              className="shrink-0 rounded px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Send
            </button>
          </div>
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
