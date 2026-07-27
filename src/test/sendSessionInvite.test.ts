import { describe, expect, it, vi } from 'vitest';
import { describeSendSessionInviteResult, sendSessionInvite } from '../lib/sendSessionInvite';

describe('sendSessionInvite helpers', () => {
  it('describeSendSessionInviteResult covers email and manual delivery', () => {
    expect(
      describeSendSessionInviteResult({
        ok: true,
        delivery: 'email',
        message: 'Invite email accepted by provider.',
      }),
    ).toContain('accepted');
    expect(
      describeSendSessionInviteResult({
        ok: true,
        delivery: 'manual',
      }),
    ).toMatch(/copy link/i);
  });

  it('describeSendSessionInviteResult covers error codes', () => {
    expect(describeSendSessionInviteResult({ ok: false, error_code: 'rate_limited' })).toMatch(
      /too many/i,
    );
    expect(describeSendSessionInviteResult({ ok: false, error_code: 'forbidden' })).toMatch(
      /do not have access/i,
    );
  });

  it('sendSessionInvite maps invoke success and manual fallback', async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: {
        ok: true,
        delivery: 'manual',
        url: 'https://example.com/p/review/tok',
        message: 'Email provider not configured.',
      },
      error: null,
    });
    const supabase = { functions: { invoke } } as never;
    const result = await sendSessionInvite(supabase, {
      participantId: 'p1',
      toEmail: 'a@b.co',
      linkKind: 'review',
    });
    expect(result).toEqual({
      ok: true,
      delivery: 'manual',
      url: 'https://example.com/p/review/tok',
      message: 'Email provider not configured.',
    });
    expect(invoke).toHaveBeenCalledWith('send-session-invite', {
      body: {
        participant_id: 'p1',
        to_email: 'a@b.co',
        link_kind: 'review',
      },
    });
  });
});
