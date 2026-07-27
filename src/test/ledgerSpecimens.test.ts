import { describe, expect, it } from 'vitest';
import {
  formatDisplayDate,
  formatRecordId,
  getSpecimenById,
  getStatusChips,
  homepageSpecimen,
  specimenToDocumentFields,
  timestampStatusLabel,
  truncateAnchor,
  visibilityLabel,
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

  it('orders specimen chips ILLUSTRATIVE → not-verifiable → RECORD ID', () => {
    const chips = getStatusChips(homepageSpecimen);
    expect(chips.map((c) => c.kind)).toEqual(['illustrative', 'illustrative', 'record-id']);
    expect(chips[1]?.label).toBe('Specimen (not verifiable)');
    expect(chips[2]?.label).toBe('SQR-2026-0312');
  });

  it('keeps Anchor verified only for live published chips', () => {
    const chips = getStatusChips({
      id: 'SQR-2026-9999',
      specimenType: 'live',
      status: 'anchor-verified',
    });
    expect(chips.map((c) => c.label)).toEqual(['Published', 'Anchor verified', 'SQR-2026-9999']);
  });

  it('resolves homepage canonical specimen', () => {
    expect(homepageSpecimen.id).toBe('SQR-2026-0312');
    expect(homepageSpecimen.organisation).toBe('Regional Mediation Centre');
    expect(homepageSpecimen.participantCount).toBe(12);
    expect(getSpecimenById('SQR-2026-0312')?.slug).toBe(
      'community-safety-coordination-q1-action-commitments',
    );
  });

  it('maps official document fields with honesty labels', () => {
    const doc = specimenToDocumentFields(homepageSpecimen);
    expect(doc.caseReference).toBe('SQR-2026-0312');
    expect(doc.matterTitle).toContain('Community Safety');
    expect(doc.templateType).toBe('Action Commitments Record');
    expect(doc.issuedAtDisplay).toBe('March 12, 2026');
    expect(doc.approvedByRole).toMatch(/facilitator/i);
    expect(doc.visibilityLabel).toBe('Public registry');
    expect(doc.isSpecimen).toBe(true);
    expect(doc.integrityScheme).toMatch(/illustrative/i);
    expect(doc.timestampLabel).toMatch(/specimen/i);
    expect(doc.facilitatorAttestation.length).toBeGreaterThan(20);
  });

  it('labels visibility and timestamp honestly', () => {
    expect(visibilityLabel('public')).toBe('Public registry');
    expect(visibilityLabel('private')).toBe('Private anchored release');
    expect(timestampStatusLabel('not-attested', true)).toMatch(/specimen/i);
    expect(timestampStatusLabel('not-attested', false)).toMatch(/not attested/i);
  });

  it('includes document metadata on every catalog specimen', () => {
    for (const specimen of [
      homepageSpecimen,
      getSpecimenById('SQR-2024-0147')!,
      getSpecimenById('SQR-2023-1209')!,
    ]) {
      const doc = specimenToDocumentFields(specimen);
      expect(doc.caseReference).toMatch(/^SQR-/);
      expect(doc.classification).toBeTruthy();
      expect(doc.templateType).toBeTruthy();
    }
  });
});
