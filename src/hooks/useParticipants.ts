import { useEffect, useState, useCallback } from 'react';
// TODO(supabase-types): see useAccessRequest.
import { supabase } from '../lib/supabase';
import type { Participant } from '../lib/supabaseTypes';

export function useParticipants(sessionId: string | undefined) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('participants')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    if (err) setError(err.message);
    else setParticipants((data ?? []) as Participant[]);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Real-time subscription
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`participants:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetch();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetch]);

  async function setVerificationStatus(
    participantId: string,
    status: Participant['verification_status'],
  ) {
    const { error: err } = await supabase
      .from('participants')
      .update({ verification_status: status })
      .eq('id', participantId);
    if (err) throw err;
    setParticipants((prev) =>
      prev.map((p) => (p.id === participantId ? { ...p, verification_status: status } : p)),
    );
  }

  return { participants, loading, error, setVerificationStatus, refetch: fetch };
}
