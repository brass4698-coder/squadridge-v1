import { describe, expect, it } from 'vitest';
import {
  formatPipelineMetric,
  isFounderNotePlaceholder,
  isPipelineMetricUnpublished,
} from '../data/siteMessaging';

describe('pipeline / founder honesty helpers', () => {
  it('treats {{TOKEN}} placeholders as unpublished', () => {
    expect(isPipelineMetricUnpublished('{{ACTIVE_CONVERSATIONS}}')).toBe(true);
    expect(isPipelineMetricUnpublished('')).toBe(true);
    expect(isPipelineMetricUnpublished('  ')).toBe(true);
    expect(isPipelineMetricUnpublished('3')).toBe(false);
    expect(isPipelineMetricUnpublished('0')).toBe(false);
  });

  it('formats unpublished metrics as em dash', () => {
    expect(formatPipelineMetric('{{LOI_COUNT}}')).toEqual({
      display: '—',
      unpublished: true,
    });
    expect(formatPipelineMetric('0')).toEqual({ display: '0', unpublished: false });
    expect(formatPipelineMetric('12')).toEqual({ display: '12', unpublished: false });
  });

  it('detects founder note placeholder', () => {
    expect(isFounderNotePlaceholder('{{FOUNDER_NOTE}}')).toBe(true);
    expect(isFounderNotePlaceholder('')).toBe(true);
    expect(isFounderNotePlaceholder('We built this for facilitators.')).toBe(false);
  });
});
