import { describe, expect, it } from 'vitest';
import { mainContentPaddingClass } from './appLayoutPadding';

describe('mainContentPaddingClass', () => {
  it('uses tight padding for home and session routes', () => {
    expect(mainContentPaddingClass('/')).toBe('pt-0 pb-xl');
    expect(mainContentPaddingClass('/session/x')).toBe('pt-0 pb-xl');
    expect(mainContentPaddingClass('/find-squad')).toBe('pt-0 pb-xl');
    expect(mainContentPaddingClass('/intent')).toBe('pt-0 pb-xl');
  });

  it('uses default vertical padding for other routes', () => {
    expect(mainContentPaddingClass('/mod')).toBe('py-xl');
  });

  it('uses tight padding for pitch hub', () => {
    expect(mainContentPaddingClass('/pitch-deck-hub')).toBe('pt-0 pb-xl');
  });
});
