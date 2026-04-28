/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import type { ErrorEvent as SentryErrorEvent } from '@sentry/react';
import { beforeSendSentryEvent } from './sentry';

function event(partial: Partial<SentryErrorEvent>): SentryErrorEvent {
  return { ...(partial as SentryErrorEvent) };
}

describe('beforeSendSentryEvent', () => {
  it('passes a minimal event through unchanged', () => {
    const e = event({ contexts: { react: { componentStack: 'short stack' } } });
    const out = beforeSendSentryEvent(e);
    expect(out).toBe(e);
  });

  it('drops session_boundary.user_id when it is not the salted-hash form', () => {
    const e = event({
      contexts: {
        session_boundary: {
          squad_id: 'squad-abc',
          user_id: '11111111-1111-1111-1111-111111111111',
        },
      },
    });
    const out = beforeSendSentryEvent(e);
    expect(out).not.toBeNull();
    const sb = out!.contexts?.session_boundary as { squad_id?: string; user_id?: string };
    expect(sb.squad_id).toBe('squad-abc');
    expect('user_id' in sb).toBe(false);
  });

  it('keeps session_boundary.user_id when it matches the salted-hash form', () => {
    const e = event({
      contexts: {
        session_boundary: {
          squad_id: 'squad-abc',
          user_id: '0123456789abcdef',
        },
      },
    });
    const out = beforeSendSentryEvent(e);
    const sb = out!.contexts?.session_boundary as { user_id?: string };
    expect(sb.user_id).toBe('0123456789abcdef');
  });

  it('redacts overlong strings in extra and contexts (defense-in-depth)', () => {
    const big = 'X'.repeat(2048);
    const e = event({
      extra: { dump: big, short: 'ok' },
      contexts: {
        debug: { body: big },
      },
    });
    const out = beforeSendSentryEvent(e);
    expect((out!.extra as Record<string, string>).dump).toMatch(/^\[redacted: >\d+b\]$/);
    expect((out!.extra as Record<string, string>).short).toBe('ok');
    expect((out!.contexts as Record<string, Record<string, string>>).debug.body).toMatch(
      /^\[redacted: >\d+b\]$/,
    );
  });

  it('drops user_id from session_boundary when value is empty string', () => {
    const e = event({
      contexts: {
        session_boundary: { squad_id: 'squad-abc', user_id: '' },
      },
    });
    const out = beforeSendSentryEvent(e);
    const sb = out!.contexts?.session_boundary as { user_id?: string };
    expect('user_id' in sb).toBe(false);
  });
});
