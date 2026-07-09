import { describe, it, expect } from 'vitest';
import { appRoutes } from './appRoutes';

describe('appRoutes', () => {
  it('sessionNew points to real setup wizard', () => {
    expect(appRoutes.sessionNew).toBe('/app/sessions/new/setup');
  });
});
