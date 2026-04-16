import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  enqueuePendingSend,
  listPendingSendsForSquad,
  removePendingSend,
  resetMessageSendQueueForTests,
  type PendingSendRecord,
} from './messageSendQueue';

describe('messageSendQueue', () => {
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
      encrypted_content: 'enc',
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
});
