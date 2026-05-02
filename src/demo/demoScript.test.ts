import { describe, expect, it } from 'vitest';
import { DEMO_MAIN_STEPS, locationMatchesStep, pathsEqual, resolveStepActions } from './demoScript';
import { DEMO_SCENARIOS, DEFAULT_DEMO_SCENARIO_ID, getDemoScenarioById } from './demoScenarios';

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

describe('resolveStepActions', () => {
  it('threads scenario persona text into typed intent input', () => {
    const intentStep = DEMO_MAIN_STEPS.find((s) => s.id === 'intent');
    expect(intentStep).toBeDefined();
    for (const scenario of DEMO_SCENARIOS) {
      const actions = resolveStepActions(intentStep!, scenario);
      const typed = actions.find(
        (a) => a.kind === 'type' && a.selector === '[data-demo="intent-input"]',
      );
      expect(typed).toBeDefined();
      if (typed && typed.kind === 'type') {
        expect(typed.text).toBe(scenario.intentText);
      }
    }
  });

  it('threads scenario persona role into onboarding identity click', () => {
    const idStep = DEMO_MAIN_STEPS.find((s) => s.id === 'onboarding_identity');
    expect(idStep).toBeDefined();
    for (const scenario of DEMO_SCENARIOS) {
      const actions = resolveStepActions(idStep!, scenario);
      const clickRole = actions.find(
        (a) => a.kind === 'click' && a.selector.startsWith('[data-demo="onboarding-role-'),
      );
      expect(clickRole).toBeDefined();
      if (clickRole && clickRole.kind === 'click') {
        expect(clickRole.selector).toBe(`[data-demo="onboarding-role-${scenario.persona.role}"]`);
      }
    }
  });

  it('returns empty list for purely navigational steps', () => {
    const verifyStep = DEMO_MAIN_STEPS.find((s) => s.id === 'verify_standalone');
    expect(verifyStep).toBeDefined();
    const scenario = getDemoScenarioById(DEFAULT_DEMO_SCENARIO_ID);
    expect(resolveStepActions(verifyStep!, scenario)).toEqual([]);
  });
});

describe('presenter notes', () => {
  it('every step has a non-empty talk-track', () => {
    for (const step of DEMO_MAIN_STEPS) {
      expect(step.presenterNotes, `step ${step.id} missing presenterNotes`).toBeTruthy();
      expect((step.presenterNotes ?? '').length).toBeGreaterThan(20);
    }
  });
});
