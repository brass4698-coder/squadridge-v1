import { useCallback, useEffect, useRef, useState } from 'react';
import { isDemoParticipantToken } from '../lib/participantDemo';
import {
  participantListMessages,
  participantSendMessage,
  type ParticipantMessageRow,
} from '../lib/participantToken';
import {
  decryptSessionMessageBodies,
  encryptSessionMessageBody,
} from '../lib/sessionMessageCrypto';
import { fetchParticipantRoomKey } from '../lib/sessionRoomKey';

export type ParticipantMessageStatus = 'syncing' | 'live' | 'offline' | 'error';

export type ParticipantRoomPrivacyState =
  | 'loading'
  | 'sealed_app_layer'
  | 'demo_local'
  | 'key_error';

const POLL_MS = 2_000;
const POLL_MS_BACKGROUND = 8_000;

export function useParticipantMessages(token: string | undefined) {
  const [messages, setMessages] = useState<ParticipantMessageRow[]>([]);
  const [status, setStatus] = useState<ParticipantMessageStatus>('syncing');
  const [error, setError] = useState<string | null>(null);
  const [privacyState, setPrivacyState] = useState<ParticipantRoomPrivacyState>('loading');
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  const lastFingerprintRef = useRef('');
  const keyBase64Ref = useRef<string | null>(null);

  const ensureRoomKey = useCallback(async (): Promise<string | null> => {
    if (!token) return null;
    if (isDemoParticipantToken(token)) {
      setPrivacyState('demo_local');
      return null;
    }
    if (keyBase64Ref.current) return keyBase64Ref.current;
    const result = await fetchParticipantRoomKey(token);
    if (!result.ok) {
      setPrivacyState('key_error');
      setCryptoError(result.error);
      return null;
    }
    keyBase64Ref.current = result.keyBase64;
    setPrivacyState('sealed_app_layer');
    setCryptoError(null);
    return result.keyBase64;
  }, [token]);

  const loadMessages = useCallback(async () => {
    if (!token) return;
    const result = await participantListMessages(token);
    if (!result.valid) {
      setError(result.error ?? 'Messages unavailable');
      setStatus('error');
      return;
    }
    setError(null);
    const rows = result.messages ?? [];
    const fp = rows.map((m) => `${m.id}:${m.sent_at}`).join('|');
    if (fp === lastFingerprintRef.current) {
      setStatus(navigator.onLine ? 'live' : 'offline');
      return;
    }
    lastFingerprintRef.current = fp;

    if (isDemoParticipantToken(token)) {
      setMessages(rows);
      setPrivacyState('demo_local');
    } else {
      const key = await ensureRoomKey();
      const decrypted = await decryptSessionMessageBodies(rows, key);
      setMessages(decrypted.map(({ decryptStatus: _s, ...row }) => row));
    }
    setStatus(navigator.onLine ? 'live' : 'offline');
  }, [token, ensureRoomKey]);

  useEffect(() => {
    keyBase64Ref.current = null;
    setPrivacyState('loading');
    setCryptoError(null);
    lastFingerprintRef.current = '';
    setMessages([]);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void loadMessages();

    const poll = () => {
      const interval =
        document.visibilityState === 'visible' && navigator.onLine ? POLL_MS : POLL_MS_BACKGROUND;
      return window.setInterval(() => void loadMessages(), interval);
    };

    let intervalId = poll();

    const onVisibility = () => {
      clearInterval(intervalId);
      void loadMessages();
      intervalId = poll();
    };
    const onOnline = () => void loadMessages();
    const onOffline = () => setStatus('offline');

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [token, loadMessages]);

  async function send(body: string) {
    if (!token || !body.trim()) return { ok: false as const };
    if (isDemoParticipantToken(token)) {
      const result = await participantSendMessage(token, body.trim());
      if (!result.valid) {
        setError(result.error ?? 'Send failed');
        return { ok: false as const, error: result.error };
      }
      lastFingerprintRef.current = '';
      await loadMessages();
      return { ok: true as const };
    }

    const key = await ensureRoomKey();
    if (!key) {
      const err = cryptoError ?? 'ROOM_KEY_MISSING';
      setError(err);
      return { ok: false as const, error: err };
    }

    let ciphertext: string;
    try {
      ciphertext = await encryptSessionMessageBody(body.trim(), key);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ENCRYPT_FAILED';
      setCryptoError(message);
      setError(message);
      return { ok: false as const, error: message };
    }

    const result = await participantSendMessage(token, ciphertext);
    if (!result.valid) {
      setError(result.error ?? 'Send failed');
      return { ok: false as const, error: result.error };
    }
    lastFingerprintRef.current = '';
    await loadMessages();
    return { ok: true as const };
  }

  return {
    messages,
    status,
    error,
    send,
    refresh: loadMessages,
    privacyState,
    cryptoError,
  };
}
