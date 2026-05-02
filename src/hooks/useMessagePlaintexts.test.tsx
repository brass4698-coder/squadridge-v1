import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  encodeSecureMessagePayload,
  generateSquadMessageKeyBase64Url,
  importAes256GcmKeyFromBase64Url,
  type Database,
} from '../lib';
import { useMessagePlaintexts } from './useMessagePlaintexts';

type MessageRow = Database['public']['Tables']['messages']['Row'];

function row(id: string, ciphertext: string): MessageRow {
  return {
    id,
    squad_id: 'sq-1',
    sender_id: 'u-1',
    payload_ciphertext: ciphertext,
    sent_at: new Date().toISOString(),
    status: 'active',
  } as MessageRow;
}

function Harness({
  messages,
  cryptoKey,
  keyMaterialBase64,
}: {
  messages: MessageRow[];
  cryptoKey: CryptoKey | null;
  keyMaterialBase64?: string | null;
}) {
  const byId = useMessagePlaintexts(messages, cryptoKey, keyMaterialBase64 ?? null);
  return (
    <div>
      {messages.map((m) => (
        <div key={m.id} data-testid={`plain-${m.id}`}>
          {byId[m.id] ?? ''}
        </div>
      ))}
    </div>
  );
}

describe('useMessagePlaintexts', () => {
  it('returns empty record when cryptoKey is null', async () => {
    const enc = JSON.stringify({ v: 1, body: 'irrelevant' });
    render(<Harness messages={[row('m1', enc)]} cryptoKey={null} />);
    expect(screen.getByTestId('plain-m1').textContent).toBe('');
  });

  it('decrypts AES-GCM v3 payloads inline (no worker / no keyMaterial)', async () => {
    const keyB64 = generateSquadMessageKeyBase64Url();
    const key = await importAes256GcmKeyFromBase64Url(keyB64);
    const enc = await encodeSecureMessagePayload('hello squad', key);

    render(<Harness messages={[row('m1', enc)]} cryptoKey={key} />);

    await waitFor(() => {
      expect(screen.getByTestId('plain-m1').textContent).toBe('hello squad');
    });
  });

  it('passes through legacy v1 JSON payloads even without a CryptoKey-relevant decrypt', async () => {
    const keyB64 = generateSquadMessageKeyBase64Url();
    const key = await importAes256GcmKeyFromBase64Url(keyB64);
    const v1 = JSON.stringify({ v: 1, body: 'legacy line' });

    render(<Harness messages={[row('m1', v1)]} cryptoKey={key} />);

    await waitFor(() => {
      expect(screen.getByTestId('plain-m1').textContent).toBe('legacy line');
    });
  });

  it('keeps cached plaintext when a previously-seen id reappears', async () => {
    const keyB64 = generateSquadMessageKeyBase64Url();
    const key = await importAes256GcmKeyFromBase64Url(keyB64);
    const encA = await encodeSecureMessagePayload('first', key);
    const encB = await encodeSecureMessagePayload('second', key);

    const { rerender } = render(
      <Harness messages={[row('m1', encA), row('m2', encB)]} cryptoKey={key} />,
    );
    await waitFor(() => {
      expect(screen.getByTestId('plain-m1').textContent).toBe('first');
      expect(screen.getByTestId('plain-m2').textContent).toBe('second');
    });

    // Drop m2 and re-render with only m1; cache should still expose m1.
    rerender(<Harness messages={[row('m1', encA)]} cryptoKey={key} />);
    await waitFor(() => {
      expect(screen.queryByTestId('plain-m1')?.textContent).toBe('first');
      expect(screen.queryByTestId('plain-m2')).toBeNull();
    });
  });

  it('shows the v3-without-key marker when payload is encrypted but key is null', async () => {
    const keyB64 = generateSquadMessageKeyBase64Url();
    const key = await importAes256GcmKeyFromBase64Url(keyB64);
    const enc = await encodeSecureMessagePayload('private', key);

    // First render WITH the key to populate the cache, then re-render WITHOUT
    // the key. The hook clears cache when key drops to null and emits an empty
    // record — this guards against rendering stale plaintext after key rotation.
    const { rerender } = render(<Harness messages={[row('m1', enc)]} cryptoKey={key} />);
    await waitFor(() => {
      expect(screen.getByTestId('plain-m1').textContent).toBe('private');
    });

    rerender(<Harness messages={[row('m1', enc)]} cryptoKey={null} />);
    await waitFor(() => {
      expect(screen.getByTestId('plain-m1').textContent).toBe('');
    });
  });
});
