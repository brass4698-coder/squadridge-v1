import { describe, expect, it } from 'vitest';
import { validateGovernedCredential } from './validateGovernedCredential';

describe('validateGovernedCredential', () => {
  it('accepts demo facilitator credential', async () => {
    const r = await validateGovernedCredential('demo-facilitator-watershed');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.demo).toBe(true);
      expect(r.summary.role).toBe('Facilitator');
    }
  });

  it('maps expired demo error token', async () => {
    const r = await validateGovernedCredential('err-expired');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('expired');
  });

  it('routes participant tokens before staff accept', async () => {
    const token = `p_${'a'.repeat(40)}`;
    const r = await validateGovernedCredential(token);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.continueHref).toContain('/p/invite/');
  });

  it('routes long tokens to staff accept', async () => {
    const token = 'a'.repeat(36);
    const r = await validateGovernedCredential(token);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.continueHref).toContain('/invite/accept/');
  });
});
