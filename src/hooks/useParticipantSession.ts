import { useEffect, useState, useCallback } from 'react';
import { validateParticipantToken, type ParticipantTokenContext } from '../lib/participantToken';

export function useParticipantSession(token: string) {
  const [ctx, setCtx] = useState<ParticipantTokenContext | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const result = await validateParticipantToken(token);
    setCtx(result);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ctx, loading, refresh };
}
