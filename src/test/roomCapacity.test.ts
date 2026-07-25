import { describe, expect, it } from 'vitest';
import {
  capacityAboveRecommendedWarning,
  clampMaxParticipants,
  DEFAULT_MAX_PARTICIPANTS,
  exceedsRecommendedCapacity,
  inviteAboveRecommendedWarning,
  isRoomAtCapacity,
  MAX_ROOM_PARTICIPANTS,
  MIN_ROOM_PARTICIPANTS,
  parseMaxParticipantsInput,
  RECOMMENDED_MAX_PARTICIPANTS,
  roomCapacityErrorMessage,
} from '../lib/roomCapacity';

describe('roomCapacity', () => {
  it('clamps above the hard ceiling of 12', () => {
    expect(clampMaxParticipants(99)).toBe(MAX_ROOM_PARTICIPANTS);
    expect(parseMaxParticipantsInput('40')).toBe(12);
  });

  it('clamps below the minimum of 2 to the fallback', () => {
    expect(clampMaxParticipants(1, 6)).toBe(6);
    expect(clampMaxParticipants(Number.NaN, 8)).toBe(8);
  });

  it('defaults to the research soft default of 6', () => {
    expect(DEFAULT_MAX_PARTICIPANTS).toBe(6);
    expect(clampMaxParticipants(Number.NaN)).toBe(DEFAULT_MAX_PARTICIPANTS);
  });

  it('warns above the recommended soft maximum of 8', () => {
    expect(RECOMMENDED_MAX_PARTICIPANTS).toBe(8);
    expect(exceedsRecommendedCapacity(8)).toBe(false);
    expect(exceedsRecommendedCapacity(9)).toBe(true);
    expect(capacityAboveRecommendedWarning(9)).toMatch(/co-facilitated/);
    expect(capacityAboveRecommendedWarning(6)).toBeNull();
    expect(inviteAboveRecommendedWarning(8)).toMatch(/invitations/);
    expect(inviteAboveRecommendedWarning(7)).toBeNull();
  });

  it('detects a full room', () => {
    expect(isRoomAtCapacity(12, 12)).toBe(true);
    expect(isRoomAtCapacity(11, 12)).toBe(false);
    expect(isRoomAtCapacity(6, 6)).toBe(true);
  });

  it('returns calm capacity copy', () => {
    expect(roomCapacityErrorMessage(8)).toContain('8');
    expect(roomCapacityErrorMessage()).toContain(String(MAX_ROOM_PARTICIPANTS));
    expect(MIN_ROOM_PARTICIPANTS).toBe(2);
  });
});
