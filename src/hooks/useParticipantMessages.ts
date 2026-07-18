import { useCallback, useEffect, useRef, useState } from 'react';
import {
  participantListMessages,
  participantSendMessage,
  type ParticipantMessageRow,
} from '../lib/participantToken';

export type ParticipantMessageStatus = 'syncing' | 'live' | 'offline' | 'error';

const POLL_MS = 2_000;
const POLL_MS_BACKGROUND = 8_000;

export function useParticipantMessages(token: string | undefined) {
  const [messages, setMessages] = useState<ParticipantMessageRow[]>([]);
  const [status, setStatus] = useState<ParticipantMessageStatus>('syncing');
  const [error, setError] = useState<string | null>(null);
  const lastFingerprintRef = useRef('');

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
    if (fp !== lastFingerprintRef.current) {
      lastFingerprintRef.current = fp;
      setMessages(rows);
    }
    setStatus(navigator.onLine ? 'live' : 'offline');
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
    const result = await participantSendMessage(token, body.trim());
    if (!result.valid) {
      setError(result.error ?? 'Send failed');
      return { ok: false as const, error: result.error };
    }
    await loadMessages();
    return { ok: true as const };
  }

  return { messages, status, error, send, refresh: loadMessages };
}
