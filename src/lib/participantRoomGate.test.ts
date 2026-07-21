import { describe, expect, it } from 'vitest';
import { isParticipantRoomReady } from './participantRoomGate';

describe('isParticipantRoomReady', () => {
  it('requires verified + live/open/paused', () => {
    expect(isParticipantRoomReady('live', 'verified')).toBe(true);
    expect(isParticipantRoomReady('open', 'verified')).toBe(true);
    expect(isParticipantRoomReady('paused', 'verified')).toBe(true);
    expect(isParticipantRoomReady('setup', 'verified')).toBe(false);
    expect(isParticipantRoomReady('live', 'pending')).toBe(false);
    expect(isParticipantRoomReady(undefined, 'verified')).toBe(false);
  });
});
