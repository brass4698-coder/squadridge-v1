import { useEffect, useRef, useState } from 'react';
import type { SessionMessage } from '../../lib/supabaseTypes';

export interface DeliberationFeedProps {
  messages: SessionMessage[];
  emptyHeading?: string;
  emptyBody?: string;
  phaseLabel?: string;
  floorCodename?: string | null;
  selfLabel?: string | null;
  className?: string;
}

/**
 * Evolves the existing message list into a deliberation feed with auto-scroll
 * and a "new statement" pill when the reader has scrolled up.
 */
export function DeliberationFeed({
  messages,
  emptyHeading = 'No contributions yet',
  emptyBody = 'When ready, draft a contribution. The facilitator may post a stage prompt first.',
  phaseLabel,
  floorCodename,
  selfLabel,
  className = '',
}: DeliberationFeedProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [pinnedToBottom, setPinnedToBottom] = useState(true);
  const [unseen, setUnseen] = useState(0);
  const prevCountRef = useRef(messages.length);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      const atBottom = dist < 48;
      setPinnedToBottom(atBottom);
      if (atBottom) setUnseen(0);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const added = messages.length - prevCountRef.current;
      if (pinnedToBottom) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        setUnseen(0);
      } else {
        setUnseen((n) => n + added);
      }
    }
    prevCountRef.current = messages.length;
  }, [messages.length, pinnedToBottom]);

  function jumpToLatest() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setUnseen(0);
    setPinnedToBottom(true);
  }

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col ${className}`}>
      {floorCodename ? (
        <p
          className="border-b border-line/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-brand"
          role="status"
        >
          Floor · {floorCodename}
        </p>
      ) : null}

      <div
        ref={scrollerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
        aria-label="Deliberation feed"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-ink">{emptyHeading}</p>
            <p className="mx-auto mt-2 max-w-sm text-xs text-ink-secondary">{emptyBody}</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {messages.map((msg) => {
              const isYou = Boolean(selfLabel && msg.sender_label === selfLabel);
              const isFacilitator = msg.sender_role === 'facilitator';
              const isRoomNote = isFacilitator && msg.sender_label === 'Room note';
              return (
                <li key={msg.id} className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        isRoomNote || isFacilitator ? 'text-brand' : 'text-ink-secondary'
                      }`}
                    >
                      {isYou ? 'You' : msg.sender_label}
                      {isFacilitator && !isRoomNote ? ' · Facilitator' : ''}
                    </span>
                    <span className="font-mono text-[10px] text-ink-faint">
                      {new Date(msg.sent_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {phaseLabel ? (
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                        {phaseLabel}
                      </span>
                    ) : null}
                  </div>
                  <div
                    className={`max-w-lg rounded-lg px-4 py-3 text-sm leading-relaxed ${
                      isRoomNote
                        ? 'border border-line bg-surface-secondary text-ink-secondary'
                        : isYou
                          ? 'bg-brand text-brand-on'
                          : isFacilitator
                            ? 'border border-brand/30 bg-brand-soft text-ink'
                            : 'bg-surface-elevated text-ink shadow-sr-xs'
                    }`}
                  >
                    {msg.body}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      {unseen > 0 ? (
        <button
          type="button"
          onClick={jumpToLatest}
          className="absolute bottom-3 left-1/2 z-10 min-h-[44px] -translate-x-1/2 rounded-md border border-brand/40 bg-surface-elevated px-4 py-2 text-xs font-medium text-brand shadow-sr-sm"
        >
          {unseen === 1 ? 'New statement' : `${unseen} new statements`}
        </button>
      ) : null}
    </div>
  );
}
