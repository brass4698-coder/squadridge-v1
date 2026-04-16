import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  enqueuePendingSend,
  listPendingSendsForSquad,
  removePendingSend,
  resetMessageSendQueueForTests,
  sendRetryDelayMs,
  type PendingSendRecord,
} from './sendQueue';

describe('sendQueue', () => {
  beforeEach(() => {
    resetMessageSendQueueForTests();
    vi.stubGlobal('indexedDB', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips in memory when IndexedDB is unavailable', async () => {
    const r: PendingSendRecord = {
      localId: 'id-1',
      squadId: 'squad-a',
      senderId: 'user-1',
      payload_ciphertext: 'enc',
      plainBody: 'hello',
      createdAt: new Date().toISOString(),
    };
    await enqueuePendingSend(r);
    const list = await listPendingSendsForSquad('squad-a');
    expect(list).toHaveLength(1);
    expect(list[0]?.plainBody).toBe('hello');
    await removePendingSend('id-1');
    expect(await listPendingSendsForSquad('squad-a')).toHaveLength(0);
  });

  it('computes capped exponential backoff for send retries', () => {
    expect(sendRetryDelayMs(0)).toBe(1_000);
    expect(sendRetryDelayMs(1)).toBe(2_000);
    expect(sendRetryDelayMs(10)).toBe(30_000);
  });
});
