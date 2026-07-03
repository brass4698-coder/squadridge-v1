import { describe, it, expect } from 'vitest';
import { copyForInviteReason } from './inviteInvalidCopy';

describe('copyForInviteReason', () => {
  it('returns not_found copy when reason is undefined or unknown', () => {
    const c = copyForInviteReason(undefined);
    expect(c.reason).toBe('not_found');
    expect(c.title).toMatch(/not found/i);
    expect(c.primaryAction.href).toBe('/request-access');
  });

  it('returns not_found copy for reason=not_found', () => {
    expect(copyForInviteReason('not_found').reason).toBe('not_found');
  });

  it('routes an already_used invite to sign-in (not request-access)', () => {
    // Rationale: the user already completed verification once — the useful
    // next step is signing in with that account, not asking for a new invite.
    const c = copyForInviteReason('already_used');
    expect(c.reason).toBe('already_used');
    expect(c.primaryAction.href).toBe('/sign-in');
    expect(c.title).toMatch(/already been used/i);
  });

  it('routes revoked / expired invites to request-access', () => {
    for (const reason of ['revoked', 'expired'] as const) {
      const c = copyForInviteReason(reason);
      expect(c.reason).toBe(reason);
      expect(c.primaryAction.href).toBe('/request-access');
    }
  });

  it('every reason includes a body, a primary action, and a secondary action', () => {
    for (const reason of ['not_found', 'revoked', 'already_used', 'expired'] as const) {
      const c = copyForInviteReason(reason);
      expect(c.body.length).toBeGreaterThan(20);
      expect(c.primaryAction.label.length).toBeGreaterThan(0);
      expect(c.primaryAction.href.startsWith('/')).toBe(true);
      expect(c.secondaryAction).toBeDefined();
      expect(c.secondaryAction!.href.startsWith('/')).toBe(true);
    }
  });
});
