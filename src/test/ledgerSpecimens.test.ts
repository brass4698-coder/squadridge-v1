import { describe, expect, it } from 'vitest';
import {
  formatDisplayDate,
  formatRecordId,
  getSpecimenById,
  getStatusChips,
  homepageSpecimen,
  truncateAnchor,
} from '../data/ledgerSpecimens';

describe('ledgerSpecimens helpers', () => {
  it('formats canonical record IDs', () => {
    expect(formatRecordId('sqr-2026-0312')).toBe('SQR-2026-0312');
    expect(formatRecordId('SQR-2026-0312')).toBe('SQR-2026-0312');
  });

  it('formats display dates as Month DD, YYYY', () => {
    expect(formatDisplayDate('2026-03-12')).toBe('March 12, 2026');
  });

  it('truncates anchors', () => {
    expect(truncateAnchor('7c3a91d7b4e6f8aa2d91e91f')).toBe('7c3a…e91f');
    expect(truncateAnchor('sha256:7c3a91d7b4e6f8aa2d91e91f')).toBe('7c3a…e91f');
  });

  it('orders status chips ILLUSTRATIVE → ANCHOR VERIFIED → RECORD ID', () => {
    const chips = getStatusChips(homepageSpecimen);
    expect(chips.map((c) => c.kind)).toEqual(['illustrative', 'anchor-verified', 'record-id']);
    expect(chips[2]?.label).toBe('SQR-2026-0312');
  });

  it('resolves homepage canonical specimen', () => {
    expect(homepageSpecimen.id).toBe('SQR-2026-0312');
    expect(homepageSpecimen.organisation).toBe('Regional Mediation Centre');
    expect(homepageSpecimen.participantCount).toBe(12);
    expect(getSpecimenById('SQR-2026-0312')?.slug).toBe(
      'community-safety-coordination-q1-action-commitments',
    );
  });
});
