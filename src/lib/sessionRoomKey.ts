/**
 * Fetch the per-session AES key for v2 facilitated rooms.
 * Keys remain operator-readable in Postgres — see threat-model §5.
 */

import { supabase } from './supabase';

export type SessionRoomKeyResult =
  | { ok: true; keyBase64: string; keyEpoch: number }
  | { ok: false; error: string };

type RoomKeyRpcRow = {
  valid?: boolean;
  error?: string;
  message_encryption_key?: string;
  key_epoch?: number;
};

export async function fetchFacilitatorRoomKey(sessionId: string): Promise<SessionRoomKeyResult> {
  const { data, error } = await supabase.rpc('facilitator_get_or_create_room_key', {
    p_session_id: sessionId,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as RoomKeyRpcRow;
  if (!row?.valid || !row.message_encryption_key) {
    return { ok: false, error: row?.error ?? 'ROOM_KEY_MISSING' };
  }
  return {
    ok: true,
    keyBase64: row.message_encryption_key,
    keyEpoch: row.key_epoch ?? 1,
  };
}

export async function fetchParticipantRoomKey(token: string): Promise<SessionRoomKeyResult> {
  const { data, error } = await supabase.rpc('participant_get_room_key', {
    p_token: token,
  });
  if (error) return { ok: false, error: error.message };
  const row = data as RoomKeyRpcRow;
  if (!row?.valid || !row.message_encryption_key) {
    return { ok: false, error: row?.error ?? 'ROOM_KEY_MISSING' };
  }
  return {
    ok: true,
    keyBase64: row.message_encryption_key,
    keyEpoch: row.key_epoch ?? 1,
  };
}
