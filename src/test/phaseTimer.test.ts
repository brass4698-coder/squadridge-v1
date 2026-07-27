import { describe, expect, it } from 'vitest';
import {
  budgetSecondsForStage,
  computePhaseRemainingSeconds,
  defaultPhaseBudgetsForTemplate,
  formatPhaseCountdown,
  stageOrdinal,
  timerUrgency,
} from '../lib/phaseTimer';

describe('phaseTimer helpers', () => {
  it('seeds different default budgets per template', () => {
    const ngo = defaultPhaseBudgetsForTemplate('ngo_deliberation');
    const mediation = defaultPhaseBudgetsForTemplate('community_mediation');
    expect(budgetSecondsForStage(ngo, 'story')).toBeGreaterThan(
      budgetSecondsForStage(mediation, 'story'),
    );
  });

  it('computes remaining while running against server clock', () => {
    const started = '2026-07-26T12:00:00.000Z';
    const serverNow = '2026-07-26T12:01:00.000Z';
    const remaining = computePhaseRemainingSeconds(
      {
        phase_started_at: started,
        phase_duration_seconds: 180,
        phase_timer_state: 'running',
        server_now: serverNow,
      },
      Date.parse(serverNow),
    );
    expect(remaining).toBe(120);
  });

  it('freezes remaining when paused', () => {
    const remaining = computePhaseRemainingSeconds({
      phase_started_at: null,
      phase_duration_seconds: 45,
      phase_timer_state: 'paused',
    });
    expect(remaining).toBe(45);
  });

  it('returns zero when elapsed', () => {
    expect(
      computePhaseRemainingSeconds({
        phase_started_at: '2026-07-26T12:00:00.000Z',
        phase_duration_seconds: 0,
        phase_timer_state: 'elapsed',
      }),
    ).toBe(0);
  });

  it('maps urgency bands without relying on color alone', () => {
    expect(timerUrgency(100, 100)).toBe('neutral');
    expect(timerUrgency(20, 100)).toBe('amber');
    expect(timerUrgency(5, 100)).toBe('red');
  });

  it('formats countdown and stage ordinal', () => {
    expect(formatPhaseCountdown(125)).toBe('2:05');
    expect(formatPhaseCountdown(null)).toBe('—');
    expect(stageOrdinal('framing')).toEqual({ index: 4, total: 7 });
  });
});
