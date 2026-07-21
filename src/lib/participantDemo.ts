/** Walkthrough token for e2e / local demos — never a real `participants.invite_token`. */
export const DEV_PARTICIPANT_DEMO_TOKEN = 'demo-token';

export function isDemoParticipantToken(token: string | undefined | null): boolean {
  return !!token && token.trim() === DEV_PARTICIPANT_DEMO_TOKEN;
}
