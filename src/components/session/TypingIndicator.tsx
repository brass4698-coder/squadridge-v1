import type { SquadPeerProfileRow } from '../../hooks';

/**
 * Minimal typing indicator: shows up to two pseudonyms that have broadcast a
 * `typing` event in the last few seconds. Falls back to a generic
 * "Someone is typing" line when the typing user isn't in the peer roster
 * (e.g. presence joined before the peer profile RPC returned).
 */
export function TypingIndicator({
  peers,
  typingUserIds,
  currentUserId,
}: {
  peers: SquadPeerProfileRow[];
  typingUserIds: Set<string>;
  currentUserId: string | null | undefined;
}) {
  const others = Array.from(typingUserIds).filter((id) => id !== currentUserId);
  if (others.length === 0) return null;

  const labelFor = (id: string): string => {
    const peer = peers.find((p) => p.user_id === id);
    if (!peer) return 'Someone';
    return peer.callsign.trim() || 'Operator';
  };
  const labels = others.slice(0, 2).map(labelFor);
  const text =
    labels.length === 1
      ? `${labels[0]} is typing…`
      : `${labels[0]} and ${others.length === 2 ? labels[1] : `${others.length - 1} others`} are typing…`;

  return (
    <p
      className="font-sans text-[0.78rem] italic leading-tight text-slate-500"
      aria-live="polite"
      role="status"
    >
      {text}
    </p>
  );
}
