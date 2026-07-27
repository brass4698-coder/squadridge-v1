import { describe, expect, it } from 'vitest';
import {
  claimsByIds,
  getClaim,
  HOME_TRUST_STRIP,
  IMPLEMENTATION_CLAIMS,
  IMPLEMENTATION_STATUS_LEGEND,
  IMPLEMENTATION_STATUS_LEGEND_LIVE_FOCUS,
  isClaimLive,
  PROCESS_GATE_LEGEND,
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
      'Sealed room',
      'Documented limits',
      'Ledger mechanism',
    ]);
  });

  it('marks application-layer room encryption live and operator-blind planned', () => {
    expect(getClaim('room_app_layer_encryption').status).toBe('live');
    expect(getClaim('operator_blind_e2e').status).toBe('planned');
  });

  it('ledger LIVE claim is the release pipeline, not live public entries', () => {
    const claim = getClaim('approved_outcomes_ledger');
    expect(claim.status).toBe('live');
    expect(claim.summary.toLowerCase()).toMatch(/illustrative specimen/);
    expect(claim.summary.toLowerCase()).toMatch(/pipeline/);
  });

  it('status badge labels are stable', () => {
    expect(statusBadgeLabel('live')).toBe('Live');
    expect(statusBadgeLabel('scaffolded')).toBe('Planned · scaffolded');
    expect(statusBadgeLabel('planned')).toBe('Planned · not started');
  });

  it('status legends use badge vocabulary without inventing LIVE synonyms', () => {
    expect(IMPLEMENTATION_STATUS_LEGEND).toMatch(/Live = shipped/);
    expect(IMPLEMENTATION_STATUS_LEGEND).toMatch(/Planned · scaffolded/);
    expect(IMPLEMENTATION_STATUS_LEGEND_LIVE_FOCUS).toMatch(/Live = shipped/);
    expect(PROCESS_GATE_LEGEND).toMatch(/Gated =/);
    expect(PROCESS_GATE_LEGEND).toMatch(/Released =/);
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
