import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_DEMO_SCENARIO_ID,
  DEMO_SCENARIOS,
  DEMO_SCENARIO_STORAGE_KEY,
  getDemoScenarioById,
  persistDemoScenarioId,
  readStoredDemoScenarioId,
} from './demoScenarios';

afterEach(() => {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(DEMO_SCENARIO_STORAGE_KEY);
  }
});

describe('demo scenarios', () => {
  it('exposes three named scenarios', () => {
    expect(DEMO_SCENARIOS).toHaveLength(3);
    const ids = DEMO_SCENARIOS.map((s) => s.id);
    expect(ids).toContain('cross-border-corridor');
    expect(ids).toContain('workplace-mediation');
    expect(ids).toContain('veterans-dialogue');
  });

  it('default id resolves to cross-border-corridor', () => {
    expect(DEFAULT_DEMO_SCENARIO_ID).toBe('cross-border-corridor');
    const scenario = getDemoScenarioById(DEFAULT_DEMO_SCENARIO_ID);
    expect(scenario.persona.callsign).toBe('Northstar-7');
  });

  it('getDemoScenarioById falls back to default for unknown ids', () => {
    const fallback = getDemoScenarioById('not-a-real-scenario');
    expect(fallback.id).toBe(DEFAULT_DEMO_SCENARIO_ID);
  });

  it('persists and reads stored scenario id', () => {
    persistDemoScenarioId('workplace-mediation');
    expect(readStoredDemoScenarioId()).toBe('workplace-mediation');
  });

  it('reads default when storage is empty', () => {
    expect(readStoredDemoScenarioId()).toBe(DEFAULT_DEMO_SCENARIO_ID);
  });

  it('every scenario has a unique persona callsign', () => {
    const callsigns = DEMO_SCENARIOS.map((s) => s.persona.callsign);
    expect(new Set(callsigns).size).toBe(callsigns.length);
  });

  it('every scenario seed includes at least three messages', () => {
    for (const s of DEMO_SCENARIOS) {
      expect(s.seedMessages.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('every scenario provides scripted incoming + intervention copy', () => {
    for (const s of DEMO_SCENARIOS) {
      expect(s.scriptedIncoming.length).toBeGreaterThan(0);
      expect(s.interventionLine.length).toBeGreaterThan(10);
      expect(s.translationReveal.source.length).toBeGreaterThan(0);
      expect(s.translationReveal.translated.length).toBeGreaterThan(0);
    }
  });
});
