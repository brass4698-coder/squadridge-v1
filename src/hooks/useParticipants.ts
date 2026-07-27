import { useEffect, useState, useCallback } from 'react';
// TODO(supabase-types): see useAccessRequest.
import { supabase } from '../lib/supabase';
import type { Participant } from '../lib/supabaseTypes';
import { isRoomAtCapacity, roomCapacityErrorMessage } from '../lib/roomCapacity';

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
    const { data, error: err } = await supabase.rpc('facilitator_set_participant_verification', {
      p_participant_id: participantId,
      p_status: status,
    });
    if (err) throw err;
    const result = data as { ok?: boolean; error?: string };
    if (!result?.ok) throw new Error(result?.error ?? 'Update failed');
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId
          ? {
              ...p,
              verification_status: status,
              admitted_at: status === 'verified' ? new Date().toISOString() : p.admitted_at,
            }
          : p,
      ),
    );
  }

  async function addParticipant(
    input: {
      codename: string;
      invite_token: string;
      email_hash?: string | null;
      participation_reason?: string | null;
    },
    maxParticipants?: number,
  ) {
    if (!sessionId) throw new Error('No session');
    if (
      typeof maxParticipants === 'number' &&
      isRoomAtCapacity(participants.length, maxParticipants)
    ) {
      throw new Error(roomCapacityErrorMessage(maxParticipants));
    }
    const { data, error: err } = await supabase
      .from('participants')
      .insert({
        session_id: sessionId,
        codename: input.codename,
        invite_token: input.invite_token,
        email_hash: input.email_hash ?? null,
        participation_reason: input.participation_reason?.trim() || null,
      })
      .select()
      .single();
    if (err) {
      const msg = err.message ?? '';
      if (msg.includes('ROOM_FULL')) {
        throw new Error(roomCapacityErrorMessage(maxParticipants ?? 12));
      }
      throw err;
    }
    const row = data as Participant;
    setParticipants((prev) => [...prev, row]);
    return row;
  }

  return { participants, loading, error, setVerificationStatus, addParticipant, refetch: fetch };
}
