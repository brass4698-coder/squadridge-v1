import { describe, expect, it } from 'vitest';
import { ledgerEntryToCard, ledgerEntryToDocumentFields } from '../lib/ledgerDisplay';
import type { LedgerEntry } from '../hooks/useLedger';

function sampleEntry(overrides: Partial<LedgerEntry> = {}): LedgerEntry {
  return {
    id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    session_id: '11111111-1111-4111-8111-111111111111',
    summary: 'Approved coordination commitments for Q1.',
    agreed_terms: 'Shared referral protocol.',
    pending_items: null,
    status: 'published',
    published_at: '2026-03-12T18:00:00Z',
    ledger_sha: '7c3a91d7b4e6f8aa2d91e91fabcdef01',
    created_at: '2026-03-12T18:00:00Z',
    updated_at: '2026-03-12T18:00:00Z',
    session: {
      title: 'Community Safety Coordination',
      conflict_type: 'Regional Mediation Centre',
      language: 'en',
      outcome_public: true,
      status: 'released',
    },
    ...overrides,
  } as LedgerEntry;
}

describe('ledgerDisplay', () => {
  it('maps live entries to official document fields without inventing volume', () => {
    const doc = ledgerEntryToDocumentFields(sampleEntry());
    expect(doc.isSpecimen).toBe(false);
    expect(doc.caseReference).toMatch(/^SQR-/);
    expect(doc.matterTitle).toBe('Community Safety Coordination');
    expect(doc.visibilityLabel).toBe('Public registry');
    expect(doc.integrityScheme).toMatch(/SHA-256/);
    expect(doc.timestampLabel).toMatch(/not attested/i);
    expect(doc.participantCount).toBeUndefined();
  });

  it('includes document chrome on live cards', () => {
    const card = ledgerEntryToCard(sampleEntry());
    expect(card.variant).toBe('live');
    expect(card.document?.caseReference).toBe(card.id);
    expect(card.document?.approvedByRole).toMatch(/facilitator/i);
    expect(card.href).toContain('/ledger/');
  });
});
