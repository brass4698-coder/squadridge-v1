const LIVE_STATUSES = new Set(['live', 'open', 'paused']);

/** True when facilitator has opened the room and this participant is verified. */
export function isParticipantRoomReady(
  sessionStatus: string | undefined,
  verificationStatus: string | undefined,
): boolean {
  return verificationStatus === 'verified' && !!sessionStatus && LIVE_STATUSES.has(sessionStatus);
}
