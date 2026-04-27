import { describe, expect, it } from 'vitest';
import {
  computeConflictSeverityIndex,
  csiBandFromScore,
  DEFAULT_CSI_BANDS,
  DEFAULT_CSI_REFS,
  scoreSentimentTrajectory,
} from './conflictSeverityIndex';

const baseInput = {
  negativeMessageRatio24h: 0.1,
  grievanceClusterIndex: 0.2,
  resourceKeywordsPer1k: 2,
  ingroupOutgroupRate: 0.05,
  sentimentDeltaDayOverDay: -0.05,
  violenceJustifyingPerSession: 0.2,
  topGrievances: [] as { theme: string; weight: number }[],
};

describe('conflictSeverityIndex', () => {
  it('maps sentiment ratio with reference', () => {
    expect(scoreSentimentTrajectory(0, DEFAULT_CSI_REFS.sentimentNegativeRef)).toBe(0);
    expect(
      Math.round(
        scoreSentimentTrajectory(
          DEFAULT_CSI_REFS.sentimentNegativeRef,
          DEFAULT_CSI_REFS.sentimentNegativeRef,
        ),
      ),
    ).toBe(100);
  });

  it('classifies green / yellow / red by default bands', () => {
    expect(csiBandFromScore(10, DEFAULT_CSI_BANDS)).toBe('green');
    expect(csiBandFromScore(45, DEFAULT_CSI_BANDS)).toBe('yellow');
    expect(csiBandFromScore(90, DEFAULT_CSI_BANDS)).toBe('red');
  });

  it('computes a bounded CSI score 0-100 and trace with six rows', () => {
    const r = computeConflictSeverityIndex(baseInput);
    expect(r.csiScore).toBeGreaterThanOrEqual(0);
    expect(r.csiScore).toBeLessThanOrEqual(100);
    expect(r.trace).toHaveLength(6);
    const raw = r.trace.reduce((a, t) => a + t.weightedContribution, 0);
    expect(Math.round(raw)).toBe(r.csiScore);
  });

  it('flags escalation when any component is very high (default)', () => {
    const r = computeConflictSeverityIndex({
      ...baseInput,
      negativeMessageRatio24h: 1,
      grievanceClusterIndex: 1,
      resourceKeywordsPer1k: 100,
      ingroupOutgroupRate: 0.5,
      sentimentDeltaDayOverDay: -0.5,
      violenceJustifyingPerSession: 10,
    });
    expect(r.detectedEscalation).toBe(true);
  });
});
