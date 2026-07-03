import { describe, it, expect } from 'vitest';
import { resolveLocalDashboard } from './dashboardRouting';
import { ROLE_DASHBOARD_MAP } from '../types/roles';
import type { UserRole, RoleKey } from '../types/roles';

function role(key: RoleKey): UserRole {
  return {
    role_key: key,
    workspace_id: null,
    institution_id: null,
    granted_at: '2026-01-01T00:00:00Z',
  };
}

describe('resolveLocalDashboard', () => {
  it('falls back to /app when the user has no roles', () => {
    expect(resolveLocalDashboard([])).toBe('/app');
  });

  it('routes a facilitator to their scoped dashboard', () => {
    expect(resolveLocalDashboard([role('facilitator')])).toBe(ROLE_DASHBOARD_MAP.facilitator);
  });

  it('picks the highest-priority role when the user has several', () => {
    // Priority order: super_admin > institution_admin > facilitator > mediator > analyst > participant > observer
    expect(resolveLocalDashboard([role('participant'), role('facilitator')])).toBe(
      ROLE_DASHBOARD_MAP.facilitator,
    );
    expect(
      resolveLocalDashboard([role('observer'), role('facilitator'), role('super_admin')]),
    ).toBe(ROLE_DASHBOARD_MAP.super_admin);
  });

  it('picks super_admin over every other role', () => {
    expect(
      resolveLocalDashboard([role('super_admin'), role('institution_admin'), role('facilitator')]),
    ).toBe(ROLE_DASHBOARD_MAP.super_admin);
  });

  it('picks observer only when it is the only role', () => {
    expect(resolveLocalDashboard([role('observer')])).toBe(ROLE_DASHBOARD_MAP.observer);
  });
});

describe('ROLE_DASHBOARD_MAP', () => {
  it('has an entry for every RoleKey', () => {
    const allRoles: RoleKey[] = [
      'super_admin',
      'institution_admin',
      'facilitator',
      'mediator',
      'analyst',
      'participant',
      'observer',
    ];
    for (const r of allRoles) {
      expect(ROLE_DASHBOARD_MAP[r]).toMatch(/^\/app\//);
    }
  });
});
