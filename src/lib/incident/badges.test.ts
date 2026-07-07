import { describe, expect, it } from 'vitest';
import { severityBadgeVariant, verificationBadgeVariant } from './badges';

describe('incident badge variants', () => {
  it('maps severity tiers to semantic badge variants', () => {
    expect(severityBadgeVariant('critical')).toBe('danger');
    expect(severityBadgeVariant('monitoring')).toBe('info');
  });

  it('maps verification statuses to semantic badge variants', () => {
    expect(verificationBadgeVariant('corroborated')).toBe('verified');
    expect(verificationBadgeVariant('unverified')).toBe('draft');
  });
});
