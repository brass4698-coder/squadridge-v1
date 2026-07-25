/** Hard ceiling for facilitator-led dialogue rooms. */
export const MAX_ROOM_PARTICIPANTS = 12;
export const MIN_ROOM_PARTICIPANTS = 2;

/**
 * Soft research-backed upper bound for high-stakes dialogue (recommended 4–8).
 * Hard ceiling remains {@link MAX_ROOM_PARTICIPANTS}.
 */
export const RECOMMENDED_MAX_PARTICIPANTS = 8;

/** Default when creating a session without a template override. */
export const DEFAULT_MAX_PARTICIPANTS = 6;

export function clampMaxParticipants(
  value: number,
  fallback: number = DEFAULT_MAX_PARTICIPANTS,
): number {
  if (!Number.isFinite(value) || value < MIN_ROOM_PARTICIPANTS) return fallback;
  return Math.min(MAX_ROOM_PARTICIPANTS, Math.max(MIN_ROOM_PARTICIPANTS, Math.floor(value)));
}

export function parseMaxParticipantsInput(
  raw: string,
  fallback: number = DEFAULT_MAX_PARTICIPANTS,
): number {
  return clampMaxParticipants(parseInt(raw, 10), fallback);
}

export function exceedsRecommendedCapacity(value: number): boolean {
  return Number.isFinite(value) && value > RECOMMENDED_MAX_PARTICIPANTS;
}

/**
 * Warning when max capacity or invite count moves above the 4–8 research range.
 * Soft guidance only — hard ceiling remains 12.
 */
export function capacityAboveRecommendedWarning(value: number): string | null {
  if (!exceedsRecommendedCapacity(value)) return null;
  return (
    `Groups above ${RECOMMENDED_MAX_PARTICIPANTS} are for co-facilitated institutional cases. ` +
    `Hard ceiling remains ${MAX_ROOM_PARTICIPANTS}. Prefer 4–${RECOMMENDED_MAX_PARTICIPANTS} for high-stakes dialogue.`
  );
}

/** Warn once invite count reaches or exceeds the soft recommended maximum. */
export function inviteAboveRecommendedWarning(inviteCount: number): string | null {
  if (!Number.isFinite(inviteCount) || inviteCount < RECOMMENDED_MAX_PARTICIPANTS) return null;
  return (
    `You have ${inviteCount} invitations. Rooms above ${RECOMMENDED_MAX_PARTICIPANTS} are for ` +
    `co-facilitated institutional cases only (hard ceiling ${MAX_ROOM_PARTICIPANTS}).`
  );
}

export function roomCapacityErrorMessage(max: number = MAX_ROOM_PARTICIPANTS): string {
  return `This room is limited to ${max} participants. Remove an invitation or raise capacity only up to ${MAX_ROOM_PARTICIPANTS}.`;
}

export function isRoomAtCapacity(currentCount: number, maxParticipants: number): boolean {
  const cap = clampMaxParticipants(maxParticipants, MAX_ROOM_PARTICIPANTS);
  return currentCount >= cap;
}
