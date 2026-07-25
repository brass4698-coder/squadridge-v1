export type ParticipantStep =
  | 'invite'
  | 'verify'
  | 'consent'
  | 'briefing'
  | 'waiting'
  | 'room'
  | 'review'
  | 'done';

/** Path-segment token routes: `/p/{step}/{token}` */
export function participantRoute(step: ParticipantStep, token: string): string {
  const encoded = encodeURIComponent(token);
  return `/p/${step}/${encoded}`;
}

/** @deprecated Prefer `DEV_PARTICIPANT_DEMO_TOKEN` from `participantDemo`. */
export { DEV_PARTICIPANT_DEMO_TOKEN } from './participantDemo';

export function buildParticipantInviteUrl(token: string, origin = window.location.origin): string {
  return `${origin}${participantRoute('invite', token)}`;
}
