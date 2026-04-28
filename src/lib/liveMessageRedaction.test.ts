import { describe, expect, it } from 'vitest';
import { redactOutgoingLiveMessage } from './liveMessageRedaction';

describe('redactOutgoingLiveMessage', () => {
  it('removes obvious emails before ciphertext round-trip (aligned with ingest-message)', async () => {
    const out = await redactOutgoingLiveMessage(
      'Reach me at alice@example.com later.',
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
    );
    expect(out.toLowerCase()).not.toContain('alice@example.com');
    expect(out.length).toBeGreaterThan(0);
  });
});
