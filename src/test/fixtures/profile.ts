import type { Profile } from '../../lib';
import { FIXTURE_USER_ID } from './auth';

/** Minimal complete profile row for `isProfileComplete` / RequireAuth tests. */
export function createCompleteProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: FIXTURE_USER_ID,
    callsign: 'TestOp',
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
