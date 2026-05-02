import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createDemoSessionClaim,
  describeDemoClaimError,
  finalizeDemoSessionClaim,
  issueDemoClaimConsent,
} from './sessionClaim';

function rpcMock(payload: { data: unknown; error: unknown }) {
  return vi.fn().mockResolvedValue(payload);
}

describe('createDemoSessionClaim', () => {
  it('returns the code on success', async () => {
    const rpc = rpcMock({ data: 'abcd1234efgh', error: null });
    const supabase = { rpc } as unknown as SupabaseClient;
    await expect(createDemoSessionClaim(supabase)).resolves.toBe('abcd1234efgh');
    expect(rpc).toHaveBeenCalledWith('create_demo_session_claim');
  });

  it('throws transport errors as-is', async () => {
    const rpc = rpcMock({ data: null, error: { message: 'auth required' } });
    const supabase = { rpc } as unknown as SupabaseClient;
    await expect(createDemoSessionClaim(supabase)).rejects.toEqual({ message: 'auth required' });
  });
});

describe('issueDemoClaimConsent', () => {
  it('returns ok with token + expires_at on success', async () => {
    const rpc = rpcMock({
      data: { ok: true, consent_token: 'deadbeef'.repeat(8), expires_at: '2026-04-28T12:00:00Z' },
      error: null,
    });
    const supabase = { rpc } as unknown as SupabaseClient;
    const out = await issueDemoClaimConsent(supabase, '  some-claim-code  ');
    expect(rpc).toHaveBeenCalledWith('issue_demo_claim_consent', {
      p_claim_code: 'some-claim-code',
    });
    expect(out).toEqual({
      ok: true,
      consent_token: 'deadbeef'.repeat(8),
      expires_at: '2026-04-28T12:00:00Z',
    });
  });

  it('returns structured error_code on documented failures', async () => {
    const rpc = rpcMock({ data: { ok: false, error_code: 'self_consent_forbidden' }, error: null });
    const supabase = { rpc } as unknown as SupabaseClient;
    const out = await issueDemoClaimConsent(supabase, 'code-from-anon');
    expect(out).toEqual({ ok: false, error_code: 'self_consent_forbidden' });
  });

  it('coerces unknown error_code values to invalid_claim', async () => {
    const rpc = rpcMock({ data: { ok: false, error_code: 'bogus_code' }, error: null });
    const supabase = { rpc } as unknown as SupabaseClient;
    const out = await issueDemoClaimConsent(supabase, 'code-from-anon');
    expect(out).toEqual({ ok: false, error_code: 'invalid_claim' });
  });
});

describe('finalizeDemoSessionClaim', () => {
  it('passes both claim code and consent token to the RPC', async () => {
    const rpc = rpcMock({ data: { ok: true, migrated_memberships: 2 }, error: null });
    const supabase = { rpc } as unknown as SupabaseClient;
    const out = await finalizeDemoSessionClaim(supabase, 'code-x', 'token-y');
    expect(rpc).toHaveBeenCalledWith('finalize_demo_session_claim', {
      p_claim_code: 'code-x',
      p_consent_token: 'token-y',
    });
    expect(out).toEqual({ ok: true, migrated_memberships: 2 });
  });

  it('coerces non-numeric migrated_memberships to a number', async () => {
    const rpc = rpcMock({ data: { ok: true, migrated_memberships: '5' }, error: null });
    const supabase = { rpc } as unknown as SupabaseClient;
    const out = await finalizeDemoSessionClaim(supabase, 'code-x', 'token-y');
    expect(out).toEqual({ ok: true, migrated_memberships: 5 });
  });

  it('surfaces structured error codes (consent_token_expired)', async () => {
    const rpc = rpcMock({ data: { ok: false, error_code: 'consent_token_expired' }, error: null });
    const supabase = { rpc } as unknown as SupabaseClient;
    const out = await finalizeDemoSessionClaim(supabase, 'code-x', 'token-y');
    expect(out).toEqual({ ok: false, error_code: 'consent_token_expired' });
  });
});

describe('describeDemoClaimError', () => {
  it('returns a non-empty user-facing message for every documented code', () => {
    const codes = [
      'authentication_required',
      'invalid_claim',
      'claim_not_found',
      'self_consent_forbidden',
      'self_finalize_forbidden',
      'consent_token_required',
      'consent_token_mismatch',
      'consent_token_expired',
    ] as const;
    for (const c of codes) {
      const msg = describeDemoClaimError(c);
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    }
  });
});
