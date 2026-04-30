import type { SquadPeerProfileRow } from '../../hooks';

/**
 * Compact "online now" strip — pseudonyms whose `user_id` shows up in the
 * Realtime presence set. Shown next to the existing peer roster so the room
 * makes it obvious when a participant is actively connected vs simply listed.
 */
export function SessionPresenceList({
  peers,
  presentUserIds,
  currentUserId,
}: {
  peers: SquadPeerProfileRow[];
  presentUserIds: Set<string>;
  currentUserId: string | null | undefined;
}) {
  if (peers.length === 0) return null;
  const onlinePeers = peers.filter((p) => presentUserIds.has(p.user_id));
  const onlineCount =
    onlinePeers.length || (currentUserId && presentUserIds.has(currentUserId) ? 1 : 0);

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-navy-light/30 bg-navy-dark/30 px-3 py-2"
      role="status"
      aria-live="polite"
    >
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.08em] text-slate-500">
        Online now
      </p>
      <p className="font-sans text-[0.78rem] text-slate-300">
        {onlineCount > 0
          ? `${onlineCount} of ${peers.length} connected`
          : 'No participants connected'}
      </p>
      {onlinePeers.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {onlinePeers.map((p) => {
            const isYou = currentUserId && p.user_id === currentUserId;
            const label = p.callsign.trim() || 'Operator';
            return (
              <li
                key={p.user_id}
                className="rounded-full border border-teal/35 bg-teal/10 px-2 py-0.5 font-sans text-[0.72rem] text-teal-light"
              >
                {label}
                {isYou ? ' (you)' : ''}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
