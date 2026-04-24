import { describe, expect, it } from 'vitest';
import { DEMO_MAIN_STEPS, locationMatchesStep, pathsEqual } from './demoScript';

describe('pathsEqual', () => {
  it('matches same path and query', () => {
    expect(pathsEqual('/match?demo=1', '/match?demo=1')).toBe(true);
  });

  it('ignores query parameter order', () => {
    expect(pathsEqual('/x?a=1&b=2', '/x?b=2&a=1')).toBe(true);
  });

  it('distinguishes different paths', () => {
    expect(pathsEqual('/find-squad?demo=1', '/match?demo=1')).toBe(false);
  });
});

describe('locationMatchesStep', () => {
  it('matches DEMO_MAIN_STEPS paths', () => {
    for (const step of DEMO_MAIN_STEPS) {
      const u = new URL(step.path, 'https://example.com');
      expect(locationMatchesStep(u.pathname, u.search, step.path)).toBe(true);
    }
  });
});
