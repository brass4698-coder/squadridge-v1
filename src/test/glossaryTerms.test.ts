import { describe, expect, it } from 'vitest';
import { GLOSSARY_TERMS } from '../data/glossaryTerms';

describe('glossaryTerms', () => {
  it('defines facilitator-facing glosses without privacy overclaims', () => {
    const ids = Object.keys(GLOSSARY_TERMS);
    expect(ids).toEqual(
      expect.arrayContaining([
        'bearer-secret',
        'codename',
        'ledger-sha',
        'canonicalised',
        'verification-anchor',
        'rfc-3161',
        'instrument-hash',
        'authorship-attestation',
      ]),
    );
    for (const term of Object.values(GLOSSARY_TERMS)) {
      expect(term.gloss.length).toBeGreaterThan(20);
      expect(term.gloss.toLowerCase()).not.toMatch(/end-to-end encrypted/);
      expect(term.gloss.toLowerCase()).not.toMatch(/fully zero-knowledge/);
    }
  });
});
