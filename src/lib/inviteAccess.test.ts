import { afterEach, describe, expect, it } from 'vitest';
import {
  attachInviteCohortToPoolKey,
  buildInviteContinuationPath,
  clearPendingInviteCode,
  getPendingInviteCode,
  normalizeInviteCode,
  setPendingInviteCode,
  withPendingInvitePath,
} from './inviteAccess';

describe('inviteAccess helpers', () => {
  afterEach(() => {
    clearPendingInviteCode();
  });

  it('normalizes invite codes for storage and RPC use', () => {
    expect(normalizeInviteCode(' Cohort- Pilot 2026 ')).toBe('cohort-pilot2026');
  });

  it('builds invite continuation paths for auth callbacks', () => {
    expect(buildInviteContinuationPath('pilot-2026', '/onboarding/verification')).toBe(
      '/invite?code=pilot-2026&continue=%2Fonboarding%2Fverification',
    );
    expect(buildInviteContinuationPath('pilot-2026')).toBe('/invite?code=pilot-2026');
  });

  it('stores pending invite codes in session storage', () => {
    setPendingInviteCode(' PILOT-2026 ');
    expect(getPendingInviteCode()).toBe('pilot-2026');
    expect(withPendingInvitePath('/find-squad')).toBe('/invite?code=pilot-2026');
  });

  it('prefixes pool keys with the invite cohort binding', () => {
    expect(attachInviteCohortToPoolKey('dialogue|zk:scope', 'pilot-one')).toBe(
      'cohort:pilot-one|dialogue|zk:scope',
    );
  });
});
