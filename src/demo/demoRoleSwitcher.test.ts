import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearDemoRoleOverride,
  DEMO_ROLE_STORAGE_KEY,
  getDemoRoleOverride,
  setDemoRoleOverride,
} from './demoRoleSwitcher';

describe('demoRoleSwitcher', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('stores and clears session-only role override', () => {
    expect(getDemoRoleOverride()).toBeNull();
    setDemoRoleOverride('mediator');
    expect(sessionStorage.getItem(DEMO_ROLE_STORAGE_KEY)).toBe('mediator');
    expect(getDemoRoleOverride()).toBe('mediator');
    clearDemoRoleOverride();
    expect(getDemoRoleOverride()).toBeNull();
  });

  it('ignores invalid stored values', () => {
    sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, 'not-a-role');
    expect(getDemoRoleOverride()).toBeNull();
  });
});
