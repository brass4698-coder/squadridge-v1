import { describe, expect, it } from 'vitest';
import {
  contactInfoValidationMessage,
  findContactInfoMatches,
  textContainsContactInfo,
} from './contactInfoPatterns';

describe('contactInfoPatterns', () => {
  it('detects email addresses', () => {
    const text = 'Reach me at jane.doe@example.com for details.';
    expect(textContainsContactInfo(text)).toBe(true);
    expect(findContactInfoMatches(text).some((m) => m.kind === 'email')).toBe(true);
  });

  it('detects phone numbers', () => {
    const text = 'Call 415-555-0101 if needed.';
    expect(textContainsContactInfo(text)).toBe(true);
    expect(findContactInfoMatches(text).some((m) => m.kind === 'phone')).toBe(true);
  });

  it('detects street-style addresses', () => {
    const text = 'They live at 123 Oak Street near the park.';
    expect(textContainsContactInfo(text)).toBe(true);
    expect(findContactInfoMatches(text).some((m) => m.kind === 'street_address')).toBe(true);
  });

  it('returns null validation message for safe text', () => {
    expect(contactInfoValidationMessage('A verified source noted increased tension.')).toBeNull();
  });

  it('returns a helpful validation message when contact info is present', () => {
    const message = contactInfoValidationMessage('Email alice@example.com');
    expect(message).toContain('email addresses');
    expect(message).toContain('not allowed');
  });
});
