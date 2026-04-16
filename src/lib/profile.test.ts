import { describe, expect, it } from 'vitest';
import type { Profile } from './profile';
import { isProfileComplete, PROFILE_ROLE_OTHER_MAX_LEN, PROFILE_ROLE_OTHER_MIN_LEN } from './profile';

function base(overrides: Partial<Profile>): Profile {
  return {
    id: '00000000-0000-4000-8000-000000000001',
    callsign: 'AB',
    role_archetype: 'strategist',
    role_other_detail: null,
    era_affiliation: null,
    tags: [],
    language: null,
    region_hint: null,
    timezone_window: null,
    onboarding_completed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('isProfileComplete', () => {
  it('requires callsign length >= 2', () => {
    expect(isProfileComplete(base({ callsign: 'A' }))).toBe(false);
    expect(isProfileComplete(base({ callsign: '  AB  ' }))).toBe(true);
  });

  it('requires role_archetype', () => {
    expect(isProfileComplete(base({ role_archetype: null }))).toBe(false);
    expect(isProfileComplete(base({ role_archetype: '' }))).toBe(false);
  });

  it('when role is other, requires role_other_detail in [min,max] trimmed length', () => {
    const short = 'x'.repeat(PROFILE_ROLE_OTHER_MIN_LEN - 1);
    const ok = 'x'.repeat(PROFILE_ROLE_OTHER_MIN_LEN);
    const long = 'x'.repeat(PROFILE_ROLE_OTHER_MAX_LEN + 1);
    expect(
      isProfileComplete(
        base({ role_archetype: 'other', role_other_detail: short }),
      ),
    ).toBe(false);
    expect(
      isProfileComplete(base({ role_archetype: 'other', role_other_detail: ok })),
    ).toBe(true);
    expect(
      isProfileComplete(
        base({ role_archetype: 'other', role_other_detail: long }),
      ),
    ).toBe(false);
  });
});
