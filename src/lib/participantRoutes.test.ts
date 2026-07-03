import { describe, expect, it } from 'vitest';
import { participantRoute, buildParticipantInviteUrl } from './participantRoutes';

describe('participantRoutes', () => {
  it('builds path-segment routes', () => {
    expect(participantRoute('invite', 'abc-123')).toBe('/p/invite/abc-123');
    expect(participantRoute('done', 'tok/en')).toBe('/p/done/tok%2Fen');
  });

  it('builds absolute invite URLs', () => {
    expect(buildParticipantInviteUrl('demo', 'https://example.com')).toBe(
      'https://example.com/p/invite/demo',
    );
  });
});
