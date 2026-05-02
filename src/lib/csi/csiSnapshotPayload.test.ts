import { describe, expect, it } from 'vitest';
import { computeConflictSeverityIndex } from './conflictSeverityIndex';
import { conflictSeveritySnapshotInsertFromResult } from './csiSnapshotPayload';

const sampleInput = {
  negativeMessageRatio24h: 0.1,
  grievanceClusterIndex: 0.2,
  resourceKeywordsPer1k: 2,
  ingroupOutgroupRate: 0.05,
  sentimentDeltaDayOverDay: -0.05,
  violenceJustifyingPerSession: 0.2,
  topGrievances: [{ theme: 'test', weight: 0.5 }],
};

describe('conflictSeveritySnapshotInsertFromResult', () => {
  it('maps CsiResult columns and JSON for service-role insert', () => {
    const result = computeConflictSeverityIndex(sampleInput);
    const row = conflictSeveritySnapshotInsertFromResult(result, {
      regionKey: 'pilot-1',
      periodStart: '2026-04-20T00:00:00.000Z',
      periodEnd: '2026-04-27T00:00:00.000Z',
      squadCount: 3,
      messageCount: 40,
    });

    expect(row.region_key).toBe('pilot-1');
    expect(row.csi_score).toBe(result.csiScore);
    expect(row.severity_band).toBe(result.band);
    expect(row.sentiment_signal).toBeGreaterThanOrEqual(0);
    expect(row.sentiment_signal).toBeLessThanOrEqual(100);
    expect(row.detected_escalation).toBe(result.detectedEscalation);
    expect(row.squad_count).toBe(3);
    expect(row.message_count).toBe(40);
    expect(row.component_scores).toMatchObject({
      version: 2,
      trace: result.trace,
      meta: result.meta,
    });
    expect(Array.isArray(row.top_grievances)).toBe(true);
  });
});
