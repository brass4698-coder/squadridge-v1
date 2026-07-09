import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateParticipantToken,
  recordParticipantConsent,
  generateInviteToken,
  hashEmail,
} from './participantToken';

const rpc = vi.fn();

vi.mock('./supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => rpc(...args),
  },
}));

describe('participantToken', () => {
  beforeEach(() => {
    rpc.mockReset();
  });

  it('validateParticipantToken returns context on success', async () => {
    rpc.mockResolvedValue({
      data: { valid: true, session_title: 'Test session', codename: 'A' },
      error: null,
    });
    const result = await validateParticipantToken('validtoken00000001');
    expect(rpc).toHaveBeenCalledWith('validate_participant_token', {
      p_token: 'validtoken00000001',
    });
    expect(result.valid).toBe(true);
    expect(result.session_title).toBe('Test session');
  });

  it('validateParticipantToken surfaces RPC errors', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'network error' } });
    const result = await validateParticipantToken('bad');
    expect(result).toEqual({ valid: false, error: 'network error' });
  });

  it('validateParticipantToken returns expired error from RPC payload', async () => {
    rpc.mockResolvedValue({ data: { valid: false, error: 'EXPIRED' }, error: null });
    const result = await validateParticipantToken('expired');
    expect(result).toEqual({ valid: false, error: 'EXPIRED' });
  });

  it('recordParticipantConsent calls RPC', async () => {
    rpc.mockResolvedValue({ data: { valid: true }, error: null });
    await recordParticipantConsent('token123');
    expect(rpc).toHaveBeenCalledWith('record_participant_consent', { p_token: 'token123' });
  });

  it('generateInviteToken produces a long hex string', () => {
    const token = generateInviteToken();
    expect(token.length).toBeGreaterThanOrEqual(48);
    expect(token).toMatch(/^[a-f0-9]+$/);
  });

  it('hashEmail is deterministic and lowercase-normalized', async () => {
    const a = await hashEmail('  Test@Example.COM ');
    const b = await hashEmail('test@example.com');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});
