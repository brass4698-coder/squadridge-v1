import { redactContent } from './redaction-engine';

/** Client-side pre-submit masking (server should re-run before persistence when wired). */
export async function redactOutgoingLiveMessage(
  body: string,
  squadId: string,
  actorUserId: string,
): Promise<string> {
  const result = await redactContent({
    text: body,
    mode: 'live_chat',
    audience: 'participant',
    contentType: 'live_message',
    skipDeepEntityPass: true,
    skipPseudonymMap: true,
    context: {
      roomId: squadId,
      actorUserId,
      allowlistTerms: ['SquadRidge', 'CSI'],
    },
    actorLabel: 'client:session-send',
  });
  return result.redactedText;
}
