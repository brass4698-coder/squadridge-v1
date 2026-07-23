import { describe, it, expect } from 'vitest';
import { ROLE_DASHBOARD_MAP } from '../../types/roles';
import type { RoleKey } from '../../types/roles';

// Phase 4 (see docs/audit/auth-and-dashboards-audit.md §1): every RoleKey has
// a landing page mounted at `ROLE_DASHBOARD_MAP[role]`. Previously all seven
// entries pointed at routes that 404'd. This test locks that in so a future
// route change doesn't silently regress a role's post-signin landing.

// Keep this list in sync with the routes in `src/App.v2.tsx` inside the
// `/app/*` authenticated shell block.
const MOUNTED_APP_ROUTES = new Set<string>([
  '/app',
  '/app/admin',
  '/app/institution',
  '/app/facilitator',
  '/app/mediator',
  '/app/analyst',
  '/app/participant',
  '/app/observer',
  '/app/executive',
  '/app/release-gate',
  '/app/ledger',
  '/app/ombuds',
  '/app/sessions',
  '/app/sessions/new/setup',
  '/app/insights',
  '/app/participants',
  '/app/outcomes/new',
  '/app/settings',
  '/app/admin/invites',
]);

describe('per-role dashboard routes', () => {
  it('every RoleKey has a mounted landing route', () => {
    const roles: RoleKey[] = [
      'super_admin',
      'institution_admin',
      'facilitator',
      'mediator',
      'analyst',
      'participant',
      'observer',
    ];
    for (const role of roles) {
      const target = ROLE_DASHBOARD_MAP[role];
      expect(
        MOUNTED_APP_ROUTES.has(target),
        `ROLE_DASHBOARD_MAP.${role} = "${target}" is not a mounted route`,
      ).toBe(true);
    }
  });

  it('super_admin maps to /app/admin', () => {
    expect(ROLE_DASHBOARD_MAP.super_admin).toBe('/app/admin');
  });

  it('participant maps to /app/participant (not /app/participants, which is a facilitator view)', () => {
    expect(ROLE_DASHBOARD_MAP.participant).toBe('/app/participant');
    expect(ROLE_DASHBOARD_MAP.participant).not.toBe('/app/participants');
  });
});
