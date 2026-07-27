import { describe, expect, it } from 'vitest';
import { howItWorksVignette } from '../data/howItWorksVignette';
import { PRODUCT_MECHANICS } from '../data/institutionalHome';

describe('howItWorksVignette', () => {
  it('supplies non-empty worked examples for every spine stage', () => {
    for (const step of PRODUCT_MECHANICS) {
      const examples = howItWorksVignette.steps.filter((s) => s.stage === step.title);
      expect(examples.length, `missing vignette for ${step.title}`).toBeGreaterThan(0);
      for (const ex of examples) {
        expect(ex.title.trim().length).toBeGreaterThan(0);
        expect(ex.body.trim().length).toBeGreaterThan(20);
      }
    }
  });
});
