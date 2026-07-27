import { describe, expect, it } from 'vitest';
import {
  DOCUMENTED_LIMITS_LEAD,
  DILIGENCE_FAQ,
  isSecurityTechnicalHash,
  OPERATOR_ACCESS,
  SECURITY_AT_A_GLANCE,
  SECURITY_TECHNICAL_HASHES,
} from '../data/securityPage';
import { getClaim } from '../data/implementationStatus';
import { allowsImmediatePublicPaint } from '../lib/publicRoutes';

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

describe('security page progressive disclosure data', () => {
  it('keeps glance card body copy under ~150 words total', () => {
    const total = SECURITY_AT_A_GLANCE.reduce((sum, card) => sum + wordCount(card.body), 0);
    expect(SECURITY_AT_A_GLANCE).toHaveLength(6);
    expect(total).toBeLessThanOrEqual(150);
  });

  it('states operator-readable disclosure once in Documented limits lead', () => {
    expect(DOCUMENTED_LIMITS_LEAD.toLowerCase()).toMatch(/decrypt|operator/);
    expect(DOCUMENTED_LIMITS_LEAD.toLowerCase()).toMatch(/not signal|not.*e2e|operator-blind/);
  });

  it('operator access and FAQ link back instead of restating the full lead', () => {
    const leadWords = wordCount(DOCUMENTED_LIMITS_LEAD);
    for (const row of OPERATOR_ACCESS) {
      expect(wordCount(row.access)).toBeLessThan(leadWords);
    }
    const operatorFaq = DILIGENCE_FAQ.find((item) =>
      item.q.toLowerCase().includes('operator read'),
    );
    expect(operatorFaq?.a).toMatch(/Documented limits/);
    expect(wordCount(operatorFaq?.a ?? '')).toBeLessThanOrEqual(8);
  });

  it('trims diligence FAQ answers to one short sentence', () => {
    for (const item of DILIGENCE_FAQ) {
      expect(item.a.includes('.')).toBe(true);
      expect(item.a.split(/(?<=[.!?])\s+/).filter(Boolean).length).toBeLessThanOrEqual(2);
      expect(wordCount(item.a)).toBeLessThanOrEqual(24);
    }
  });

  it('recognises technical hashes for glance redirects', () => {
    for (const hash of SECURITY_TECHNICAL_HASHES) {
      expect(isSecurityTechnicalHash(hash)).toBe(true);
    }
    expect(isSecurityTechnicalHash('operator-access')).toBe(false);
    expect(isSecurityTechnicalHash('reviewers')).toBe(false);
  });

  it('points moved registry deep-links at /security/technical', () => {
    expect(getClaim('sha256_anchor').securityHref).toBe('/security/technical#verification-anchor');
    expect(getClaim('ioa_alignment').securityHref).toBe(
      '/security/technical#confidentiality-precedent',
    );
    expect(getClaim('room_app_layer_encryption').securityHref).toBe('/security#operator-access');
  });

  it('allows immediate paint for technical appendix route', () => {
    expect(allowsImmediatePublicPaint('/security/technical')).toBe(true);
  });
});
