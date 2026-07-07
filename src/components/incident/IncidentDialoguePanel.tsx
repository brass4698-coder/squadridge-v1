import { useMemo, useState, type FormEvent } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '../ui/EmptyState';
import { StatusBadge } from '../ui/StatusBadge';
import { contactInfoValidationMessage } from '../../utils/contactInfoPatterns';
import type {
  IncidentItemRow,
  IncidentMessageRow,
  IncidentThreadRow,
} from '../../lib/incident/types';

type IncidentDialoguePanelProps = {
  threads: IncidentThreadRow[];
  messages: IncidentMessageRow[];
  items: IncidentItemRow[];
  activeThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onOpenThread: (input: { topic: string; itemId?: string | null }) => Promise<void>;
  onSendMessage: (input: { threadId: string; body: string }) => Promise<void>;
  onPauseThread: (threadId: string) => Promise<void>;
  onResolveThread: (threadId: string) => Promise<void>;
  canModerate: boolean;
  canPost: boolean;
  loading?: boolean;
};

export function IncidentDialoguePanel({
  threads,
  messages,
  items,
  activeThreadId,
  onSelectThread,
  onOpenThread,
  onSendMessage,
  onPauseThread,
  onResolveThread,
  canModerate,
  canPost,
  loading,
}: IncidentDialoguePanelProps) {
  const [topic, setTopic] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [linkedItemId, setLinkedItemId] = useState<string>('');

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? threads[0] ?? null;
  const threadMessages = useMemo(
    () => (activeThread ? messages.filter((message) => message.thread_id === activeThread.id) : []),
    [activeThread, messages],
  );

  async function handleOpenThread(event: FormEvent) {
    event.preventDefault();
    if (!topic.trim()) {
      toast.error('Add a question or concern before opening a thread.');
      return;
    }
    try {
      await onOpenThread({
        topic: topic.trim(),
        itemId: linkedItemId || null,
      });
      setTopic('');
      setLinkedItemId('');
      toast.success('Thread opened.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not open thread.');
    }
  }

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();
    if (!activeThread) return;
    const contactError = contactInfoValidationMessage(messageBody);
    if (contactError) {
      toast.error(contactError);
      return;
    }
    if (!messageBody.trim()) return;
    try {
      await onSendMessage({ threadId: activeThread.id, body: messageBody.trim() });
      setMessageBody('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send message.');
    }
  }

  return (
    <section className="flex min-h-0 flex-col gap-4" aria-labelledby="incident-dialogue-heading">
      <header>
        <p className="font-mono text-app-meta uppercase tracking-[0.14em] text-brand">Dialogue</p>
        <h2
          id="incident-dialogue-heading"
          className="font-display text-page-title font-semibold text-ink"
        >
          Scoped questions
        </h2>
        <p className="mt-1 text-app-body text-ink-secondary">
          Threads stay tied to a ledger item or topic. Use calm language — share a concern, add a
          question, or suggest a source.
        </p>
      </header>

      {canPost ? (
        <form
          onSubmit={(event) => void handleOpenThread(event)}
          className="rounded-lg border border-line bg-surface-secondary p-4"
        >
          <label className="block space-y-1">
            <span className="text-app-meta font-medium text-ink-secondary">Open a question</span>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="focus-ring min-h-[44px] w-full rounded-md border border-line bg-surface px-3 text-app-body text-ink"
              placeholder="What needs clarification in this room?"
            />
          </label>
          <label className="mt-3 block space-y-1">
            <span className="text-app-meta font-medium text-ink-secondary">
              Link to ledger item (optional)
            </span>
            <select
              value={linkedItemId}
              onChange={(event) => setLinkedItemId(event.target.value)}
              className="focus-ring min-h-[44px] w-full rounded-md border border-line bg-surface px-3 text-app-body text-ink"
            >
              <option value="">General topic</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="focus-ring mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-md border border-brand/40 bg-brand-soft px-4 text-app-button font-semibold text-brand"
          >
            <MessageSquarePlus aria-hidden className="h-4 w-4" />
            Open the first question
          </button>
        </form>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
        <nav aria-label="Dialogue threads" className="space-y-2">
          {loading ? (
            <div className="h-24 animate-pulse rounded-lg border border-line bg-surface motion-reduce:animate-none" />
          ) : threads.length === 0 ? (
            <EmptyState
              heading="No threads yet"
              body="Open a scoped question when the room is ready for dialogue."
            />
          ) : (
            threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelectThread(thread.id)}
                className={`focus-ring w-full rounded-md border px-3 py-3 text-left transition-colors ${
                  activeThread?.id === thread.id
                    ? 'border-brand/40 bg-brand-soft'
                    : 'border-line bg-surface hover:border-line-strong'
                }`}
              >
                <p className="font-heading text-app-body font-semibold text-ink">{thread.topic}</p>
                <div className="mt-2">
                  <StatusBadge
                    variant={
                      thread.status === 'open'
                        ? 'live'
                        : thread.status === 'paused'
                          ? 'paused'
                          : 'approved'
                    }
                  >
                    {thread.status}
                  </StatusBadge>
                </div>
              </button>
            ))
          )}
        </nav>

        <div className="flex min-h-[20rem] flex-col rounded-lg border border-line bg-surface">
          {activeThread ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                <h3 className="font-heading text-section-title font-semibold text-ink">
                  {activeThread.topic}
                </h3>
                {canModerate ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void onPauseThread(activeThread.id)}
                      className="focus-ring inline-flex min-h-[44px] items-center rounded-md border border-line px-3 text-app-meta text-ink-secondary"
                    >
                      Pause thread
                    </button>
                    <button
                      type="button"
                      onClick={() => void onResolveThread(activeThread.id)}
                      className="focus-ring inline-flex min-h-[44px] items-center rounded-md border border-line px-3 text-app-meta text-ink-secondary"
                    >
                      Resolve thread
                    </button>
                  </div>
                ) : null}
              </div>

              <ol aria-live="polite" className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {threadMessages.map((message) => (
                  <li
                    key={message.id}
                    className="animate-step-in rounded-md border border-line bg-surface-secondary px-3 py-2 motion-reduce:animate-none"
                  >
                    <p className="text-app-body leading-relaxed text-ink">{message.body}</p>
                    <p className="mt-2 font-mono text-app-meta tabular-nums text-ink-faint">
                      {new Date(message.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                      {message.is_facilitator ? ' · facilitator' : null}
                    </p>
                  </li>
                ))}
              </ol>

              {canPost ? (
                <form
                  onSubmit={(event) => void handleSendMessage(event)}
                  className="border-t border-line p-4"
                >
                  <label className="block space-y-1">
                    <span className="text-app-meta font-medium text-ink-secondary">
                      Add a question
                    </span>
                    <textarea
                      value={messageBody}
                      onChange={(event) => setMessageBody(event.target.value)}
                      rows={3}
                      className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2 text-app-body text-ink"
                      placeholder="Share a concern or suggest a source — no personal contact details."
                    />
                  </label>
                  <button
                    type="submit"
                    className="focus-ring mt-3 inline-flex min-h-[44px] items-center rounded-md border border-brand/40 bg-brand-soft px-4 text-app-button font-semibold text-brand"
                  >
                    Send
                  </button>
                </form>
              ) : null}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                heading="Select a thread"
                body="Choose a scoped question to read the dialogue or add a response."
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
