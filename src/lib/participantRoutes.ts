export type ParticipantStep =
  | 'invite'
  | 'verify'
  | 'consent'
  | 'briefing'
  | 'waiting'
  | 'room'
  | 'done';

/** Path-segment token routes: `/p/{step}/{token}` */
export function participantRoute(step: ParticipantStep, token: string): string {
  const encoded = encodeURIComponent(token);
  return `/p/${step}/${encoded}`;
}

/** Demo token accepted only in local dev builds for walkthroughs. */
export const DEV_PARTICIPANT_DEMO_TOKEN = 'demo-token';

export function buildParticipantInviteUrl(token: string, origin = window.location.origin): string {
  return `${origin}${participantRoute('invite', token)}`;
}
