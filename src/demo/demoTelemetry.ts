import type { EnvMode } from './demoScript';

export type DemoTelemetryPayload = Record<string, unknown>;

function getEnvMode(): EnvMode {
  if (import.meta.env.DEV) return 'local';
  if (import.meta.env.PROD) return 'prod';
  return 'staging';
}

/**
 * Minimal demo analytics — replace or extend in one place when product analytics lands.
 * Dispatches a window event and no-ops quietly if listeners throw.
 */
export function emitDemoTelemetry(event: string, payload: DemoTelemetryPayload = {}): void {
  const envMode = getEnvMode();
  const merged = { ...payload, envMode, ts: Date.now() };
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- intentional demo/debug channel
    console.debug(`[demo] ${event}`, merged);
  }
  try {
    window.dispatchEvent(new CustomEvent('squadridge:demo', { detail: { event, ...merged } }));
  } catch {
    /* ignore */
  }
}

export function emitDemoPageView(stepId: string | null): void {
  emitDemoTelemetry('page_view', { demo: true, stepId });
}

export function emitDemoStepNav(stepId: string, direction: 'next' | 'back'): void {
  emitDemoTelemetry('demo_step', { stepId, direction, envMode: getEnvMode() });
}
