import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type SessionAuditEvent = {
  event_type: string;
  actor_role: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export function useSessionAudit(sessionId: string | undefined) {
  const [events, setEvents] = useState<SessionAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    const { data, error: rpcError } = await supabase.rpc('export_session_audit_trail', {
      p_session_id: sessionId,
    });
    if (rpcError) {
      setError(rpcError.message);
      setEvents([]);
    } else {
      const row = data as { ok?: boolean; events?: SessionAuditEvent[]; error?: string };
      if (row?.ok && row.events) {
        setEvents(row.events);
      } else {
        setError(row?.error ?? 'Audit trail unavailable');
        setEvents([]);
      }
    }
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { events, loading, error, refetch: fetch };
}
