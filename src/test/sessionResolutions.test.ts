import { describe, expect, it } from 'vitest';
import {
  formatResolutionShortlistForOutcome,
  sessionUsesResolutionWorkflow,
} from '../lib/sessionResolutions';
import type { SessionResolutionItem } from '../lib/sessionResolutions';

describe('sessionUsesResolutionWorkflow', () => {
  it('enables for city community safety template', () => {
    expect(sessionUsesResolutionWorkflow('city_community_safety', {})).toBe(true);
  });

  it('enables when setup_config flag is set', () => {
    expect(sessionUsesResolutionWorkflow('community_mediation', { resolutionWorkflow: true })).toBe(
      true,
    );
  });
});

describe('formatResolutionShortlistForOutcome', () => {
  const base = (overrides: Partial<SessionResolutionItem>): SessionResolutionItem => ({
    id: '1',
    session_id: 's1',
    title: 'Youth programming',
    description: null,
    owner_org: 'Org A',
    target_days: 90,
    support_count: 3,
    rank_order: null,
    status: 'proposed',
    proposed_by_label: 'Facilitator',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    ...overrides,
  });

  it('formats shortlisted items by rank', () => {
    const text = formatResolutionShortlistForOutcome([
      base({ id: 'a', title: 'Second', rank_order: 2, status: 'shortlisted' }),
      base({ id: 'b', title: 'First', rank_order: 1, status: 'shortlisted' }),
    ]);
    expect(text).toContain('1. First');
    expect(text).toContain('2. Second');
  });
});
