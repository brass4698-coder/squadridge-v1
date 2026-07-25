import { describe, expect, it } from 'vitest';
import { FACILITATOR_WORKSPACE, howItWorksVignette } from '../data/howItWorksVignette';

describe('howItWorksVignette', () => {
  it('covers the full facilitator → ledger operational path', () => {
    const titles = howItWorksVignette.steps.map((s) => s.title.toLowerCase());
    expect(titles.some((t) => t.includes('onboarding') || t.includes('session creation'))).toBe(
      true,
    );
    expect(titles.some((t) => t.includes('invitation'))).toBe(true);
    expect(titles.some((t) => t.includes('verification'))).toBe(true);
    expect(titles.some((t) => t.includes('dialogue'))).toBe(true);
    expect(titles.some((t) => t.includes('drafting'))).toBe(true);
    expect(titles.some((t) => t.includes('approval'))).toBe(true);
    expect(titles.some((t) => t.includes('ledger') || t.includes('publication'))).toBe(true);
    expect(titles.some((t) => t.includes('anchor'))).toBe(true);
  });

  it('documents facilitator workspace distinctions', () => {
    expect(FACILITATOR_WORKSPACE.length).toBeGreaterThanOrEqual(3);
    expect(FACILITATOR_WORKSPACE.some((item) => item.title.toLowerCase().includes('notes'))).toBe(
      true,
    );
  });
});
