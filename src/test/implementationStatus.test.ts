import { describe, expect, it } from 'vitest';
import {
  claimsByIds,
  getClaim,
  HOME_TRUST_STRIP,
  IMPLEMENTATION_CLAIMS,
  isClaimLive,
  statusBadgeLabel,
  TRUST_FEATURE_CLAIM_IDS,
} from '../data/implementationStatus';
import { allowsImmediatePublicPaint } from '../lib/publicRoutes';

describe('Implementation Status Registry', () => {
  it('never marks RFC 3161 or operator-blind E2E as live', () => {
    expect(getClaim('rfc3161_timestamp').status).toBe('scaffolded');
    expect(getClaim('operator_blind_e2e').status).toBe('planned');
    expect(isClaimLive('rfc3161_timestamp')).toBe(false);
    expect(isClaimLive('operator_blind_e2e')).toBe(false);
  });

  it('marks SHA-256 anchor live', () => {
    expect(getClaim('sha256_anchor').status).toBe('live');
  });

  it('trust feature grid resolves from registry ids', () => {
    const rows = claimsByIds(TRUST_FEATURE_CLAIM_IDS);
    expect(rows).toHaveLength(TRUST_FEATURE_CLAIM_IDS.length);
    expect(rows.every((r) => IMPLEMENTATION_CLAIMS.some((c) => c.id === r.id))).toBe(true);
  });

  it('home trust strip has four evaluator labels', () => {
    expect(HOME_TRUST_STRIP.map((x) => x.label)).toEqual([
      'Invite-only',
      'Manual review',
      'Documented limits',
      'Approved-outcomes-only ledger',
    ]);
  });

  it('status badge labels are stable', () => {
    expect(statusBadgeLabel('live')).toBe('Live');
    expect(statusBadgeLabel('scaffolded')).toBe('Planned · scaffolded');
    expect(statusBadgeLabel('planned')).toBe('Planned · not started');
  });
});

describe('public immediate paint routes', () => {
  it('allows diligence pages without auth wait', () => {
    for (const path of ['/pricing', '/roadmap', '/pipeline', '/faq', '/about', '/security', '/']) {
      expect(allowsImmediatePublicPaint(path)).toBe(true);
    }
  });

  it('still gates app routes behind auth init', () => {
    expect(allowsImmediatePublicPaint('/app/facilitator')).toBe(false);
  });
});
