/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({})),
  addBreadcrumb: vi.fn(),
}));

import * as Sentry from '@sentry/react';
import { addZkProofBreadcrumb, initSentry } from './sentry';

describe('addZkProofBreadcrumb', () => {
  beforeEach(() => {
    vi.stubEnv(
      'VITE_SENTRY_DSN',
      'https://examplePublicKey@o4500000000000000.ingest.sentry.io/4500000000000000',
    );
    vi.mocked(Sentry.addBreadcrumb).mockClear();
    initSentry();
  });

  it('sends only credentialType and errorCode in breadcrumb data (no raw Edge text)', () => {
    addZkProofBreadcrumb('invoke_verify_edge', 'error', {
      credentialType: 'session_attribute',
      errorCode: 'response_invalid',
    });
    expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(1);
    const payload = vi.mocked(Sentry.addBreadcrumb).mock.calls[0][0];
    expect(payload.data).toEqual({
      credentialType: 'session_attribute',
      errorCode: 'response_invalid',
    });
    const json = JSON.stringify(payload);
    expect(json).not.toMatch(/attribute_scope|semaphore|@/i);
  });
});
