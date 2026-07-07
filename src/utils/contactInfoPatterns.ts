import { detectAddressHeuristics } from '../lib/redaction-engine/detectors/addressHeuristic';
import { detectEmails } from '../lib/redaction-engine/detectors/email';
import { detectPhones } from '../lib/redaction-engine/detectors/phone';

export type ContactInfoKind = 'email' | 'phone' | 'street_address';

export type ContactInfoMatch = {
  kind: ContactInfoKind;
  span: { start: number; end: number };
};

const STREET_KIND = 'direct_street_address';

/**
 * Detect personal contact info patterns that must not appear in incident dialogue.
 * Reuses the same deterministic detectors as live message redaction.
 */
export function findContactInfoMatches(text: string): ContactInfoMatch[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const matches: ContactInfoMatch[] = [];

  for (const hit of detectEmails(trimmed)) {
    matches.push({
      kind: 'email',
      span: hit.span,
    });
  }

  for (const hit of detectPhones(trimmed)) {
    matches.push({
      kind: 'phone',
      span: hit.span,
    });
  }

  for (const hit of detectAddressHeuristics(trimmed)) {
    if (hit.kind !== STREET_KIND) continue;
    matches.push({
      kind: 'street_address',
      span: hit.span,
    });
  }

  return matches.sort((a, b) => a.span.start - b.span.start);
}

export function textContainsContactInfo(text: string): boolean {
  return findContactInfoMatches(text).length > 0;
}

export function contactInfoValidationMessage(text: string): string | null {
  const matches = findContactInfoMatches(text);
  if (matches.length === 0) return null;

  const kinds = new Set(matches.map((m) => m.kind));
  const parts: string[] = [];
  if (kinds.has('email')) parts.push('email addresses');
  if (kinds.has('phone')) parts.push('phone numbers');
  if (kinds.has('street_address')) parts.push('street addresses');

  return `Please remove ${parts.join(', ')} before posting. Personal contact details are not allowed in incident dialogue.`;
}
