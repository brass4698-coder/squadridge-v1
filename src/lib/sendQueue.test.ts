import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  enqueuePendingSend,
  forgetPendingPlaintext,
  listPendingSendsForSquad,
  readPendingPlaintext,
  rememberPendingPlaintext,
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

  it('round-trips ciphertext-only record in memory when IndexedDB is unavailable', async () => {
    const r: PendingSendRecord = {
      localId: 'id-1',
      squadId: 'squad-a',
      senderId: 'user-1',
      payload_ciphertext: 'enc',
      createdAt: new Date().toISOString(),
    };
    await enqueuePendingSend(r);
    const list = await listPendingSendsForSquad('squad-a');
    expect(list).toHaveLength(1);
    expect(list[0]?.payload_ciphertext).toBe('enc');
    await removePendingSend('id-1');
    expect(await listPendingSendsForSquad('squad-a')).toHaveLength(0);
  });

  it('rejects records that smuggle a plaintext field at the type boundary', () => {
    // Compile-time check: PendingSendRecord must not allow `plainBody`.
    // @ts-expect-error — `plainBody` is forbidden on persisted records (security: no plaintext on disk).
    const bad: PendingSendRecord = {
      localId: 'id-x',
      squadId: 'squad-a',
      senderId: 'user-1',
      payload_ciphertext: 'enc',
      plainBody: 'should not be allowed',
      createdAt: new Date().toISOString(),
    };
    void bad;
  });

  it('mirrors plaintext in tab-local memory only and clears it on remove', () => {
    rememberPendingPlaintext('id-1', 'hello world');
    expect(readPendingPlaintext('id-1')).toBe('hello world');
    forgetPendingPlaintext('id-1');
    expect(readPendingPlaintext('id-1')).toBeUndefined();
  });

  it('removePendingSend also forgets the plaintext mirror', async () => {
    rememberPendingPlaintext('id-2', 'private');
    await enqueuePendingSend({
      localId: 'id-2',
      squadId: 'squad-a',
      senderId: 'user-1',
      payload_ciphertext: 'enc',
      createdAt: new Date().toISOString(),
    });
    await removePendingSend('id-2');
    expect(readPendingPlaintext('id-2')).toBeUndefined();
  });

  it('listed records contain no plaintext field, even if memory layer was tampered with', async () => {
    await enqueuePendingSend({
      localId: 'id-3',
      squadId: 'squad-a',
      senderId: 'user-1',
      payload_ciphertext: 'enc',
      createdAt: new Date().toISOString(),
    });
    rememberPendingPlaintext('id-3', 'secret body');
    const rows = await listPendingSendsForSquad('squad-a');
    expect(rows).toHaveLength(1);
    expect(Object.keys(rows[0]!)).not.toContain('plainBody');
    expect(JSON.stringify(rows[0])).not.toContain('secret body');
  });

  it('computes capped exponential backoff for send retries', () => {
    expect(sendRetryDelayMs(0)).toBe(1_000);
    expect(sendRetryDelayMs(1)).toBe(2_000);
    expect(sendRetryDelayMs(10)).toBe(30_000);
  });
});
