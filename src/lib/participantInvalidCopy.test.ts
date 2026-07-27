import { describe, it, expect } from 'vitest';
import { copyForParticipantTokenError } from './participantInvalidCopy';

describe('copyForParticipantTokenError', () => {
  it('maps EXPIRED to recoverable copy with request-access action', () => {
    const copy = copyForParticipantTokenError('EXPIRED');
    expect(copy.title).toMatch(/expired/i);
    expect(copy.primaryAction.href).toBe('/request-access');
  });

  it('maps DECLINED to facilitator-contact copy', () => {
    const copy = copyForParticipantTokenError('DECLINED');
    expect(copy.title).toMatch(/no longer available/i);
    expect(copy.body).toMatch(/declined/i);
  });

  it('defaults unknown errors to not-found copy', () => {
    const copy = copyForParticipantTokenError('NOT_FOUND');
    expect(copy.title).toMatch(/not found/i);
  });
});
