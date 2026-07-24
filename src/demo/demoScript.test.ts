import { describe, expect, it } from 'vitest';
import { DEMO_MAIN_STEPS, locationMatchesStep, pathsEqual } from './demoScript';

describe('pathsEqual', () => {
  it('matches same path and query', () => {
    expect(pathsEqual('/app?demo=1', '/app?demo=1')).toBe(true);
  });

  it('ignores query parameter order', () => {
    expect(pathsEqual('/x?a=1&b=2', '/x?b=2&a=1')).toBe(true);
  });

  it('ignores demo query flag', () => {
    expect(pathsEqual('/app?demo=1', '/app')).toBe(true);
    expect(pathsEqual('/how-it-works?demo=1', '/how-it-works')).toBe(true);
  });

  it('distinguishes different paths', () => {
    expect(pathsEqual('/how-it-works?demo=1', '/security?demo=1')).toBe(false);
  });

  it('still distinguishes non-demo query params', () => {
    expect(pathsEqual('/app?demo=1&tour=done', '/app?demo=1')).toBe(false);
  });
});

describe('locationMatchesStep', () => {
  it('matches DEMO_MAIN_STEPS paths', () => {
    for (const step of DEMO_MAIN_STEPS) {
      const u = new URL(step.path, 'https://example.com');
      expect(locationMatchesStep(u.pathname, u.search, step.path)).toBe(true);
    }
  });

  it('covers the institutional facilitator spine', () => {
    const ids = DEMO_MAIN_STEPS.map((s) => s.id);
    expect(ids).toContain('welcome');
    expect(ids).toContain('facilitator_dashboard');
    expect(ids).toContain('participant_dashboard');
    expect(ids).toContain('moderator_dashboard');
    expect(ids).toContain('session_configure');
    expect(ids).toContain('session_invite');
    expect(ids).toContain('session_verify');
    expect(ids).toContain('session_control');
    expect(ids).toContain('session_release');
    expect(ids).toContain('tour_complete');
    expect(ids.indexOf('facilitator_dashboard')).toBeLessThan(ids.indexOf('participant_dashboard'));
    expect(ids.indexOf('participant_dashboard')).toBeLessThan(ids.indexOf('moderator_dashboard'));
    expect(ids.indexOf('moderator_dashboard')).toBeLessThan(ids.indexOf('sessions_list'));
    expect(ids.indexOf('session_configure')).toBeLessThan(ids.indexOf('session_invite'));
    expect(ids.indexOf('session_invite')).toBeLessThan(ids.indexOf('session_verify'));
    expect(ids.indexOf('session_verify')).toBeLessThan(ids.indexOf('session_control'));
  });
});
