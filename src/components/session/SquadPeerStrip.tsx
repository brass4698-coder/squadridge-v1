import type { SquadPeerProfileRow } from '../../hooks/useSquadPeerProfiles';

function formatRoleLabel(p: SquadPeerProfileRow): string {
  if (p.role_archetype === 'other' && p.role_other_detail?.trim()) {
    return p.role_other_detail.trim();
  }
  if (p.role_archetype) {
    return p.role_archetype.replace(/_/g, ' ');
  }
  return 'Participant';
}

type Props = {
  peers: SquadPeerProfileRow[];
  currentUserId: string | null | undefined;
};

/** In-room pseudonyms: callsign, role, coarse tags — same squad only (RPC + RLS). */
export function SquadPeerStrip({ peers, currentUserId }: Props) {
  if (peers.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-navy-light/40 bg-navy-dark/40 px-4 py-3"
      role="region"
      aria-label="People in this squad"
    >
      <p className="mb-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.06em] text-slate-400">
        In this room
      </p>
      <ul className="flex flex-col gap-2">
        {peers.map((p) => {
          const isYou = currentUserId && p.user_id === currentUserId;
          const label = p.callsign.trim() || 'Operator';
          const tags = (p.tags ?? []).filter(Boolean).slice(0, 2);
          return (
            <li key={p.user_id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-sans text-[0.85rem] text-gray-light">
              <span className="font-medium text-teal">
                {label}
                {isYou ? ' (you)' : ''}
              </span>
              <span className="text-slate-400">· {formatRoleLabel(p)}</span>
              {tags.length > 0 ? (
                <span className="text-[0.75rem] text-slate-500">— {tags.join(', ')}</span>
              ) : null}
              {p.region_hint?.trim() ? (
                <span className="text-[0.72rem] text-slate-600">· {p.region_hint.trim()}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
