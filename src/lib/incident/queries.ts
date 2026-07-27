import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import type {
  IncidentItemRow,
  IncidentMessageRow,
  IncidentParticipantRole,
  IncidentRoomDetail,
  IncidentRoomRow,
  IncidentThreadRow,
} from './types';

type Client = SupabaseClient<Database>;

export async function fetchIncidentRooms(
  supabase: Client,
  filters?: { status?: IncidentRoomRow['status']; severity?: IncidentRoomRow['severity_tier'] },
): Promise<IncidentRoomRow[]> {
  let query = supabase.from('incident_rooms').select('*').order('updated_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.severity) {
    query = query.eq('severity_tier', filters.severity);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as IncidentRoomRow[];
}

export async function fetchIncidentRoomBySlug(
  supabase: Client,
  slug: string,
  userId: string | undefined,
): Promise<IncidentRoomDetail | null> {
  const { data: room, error: roomError } = await supabase
    .from('incident_rooms')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (roomError) throw new Error(roomError.message);
  if (!room) return null;

  const roomRow = room as IncidentRoomRow;

  const [itemsRes, threadsRes, participantRes] = await Promise.all([
    supabase
      .from('incident_items')
      .select('*')
      .eq('room_id', roomRow.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('incident_threads')
      .select('*')
      .eq('room_id', roomRow.id)
      .order('updated_at', { ascending: false }),
    userId
      ? supabase
          .from('incident_room_participants')
          .select('role')
          .eq('room_id', roomRow.id)
          .eq('user_id', userId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (itemsRes.error) throw new Error(itemsRes.error.message);
  if (threadsRes.error) throw new Error(threadsRes.error.message);
  if (participantRes.error) throw new Error(participantRes.error.message);

  const threads = (threadsRes.data ?? []) as IncidentThreadRow[];
  const threadIds = threads.map((t) => t.id);

  let messages: IncidentMessageRow[] = [];
  if (threadIds.length > 0) {
    const { data: messageRows, error: messagesError } = await supabase
      .from('incident_messages')
      .select('*')
      .in('thread_id', threadIds)
      .order('created_at', { ascending: true });
    if (messagesError) throw new Error(messagesError.message);
    messages = (messageRows ?? []) as IncidentMessageRow[];
  }

  return {
    room: roomRow,
    items: (itemsRes.data ?? []) as IncidentItemRow[],
    threads,
    messages,
    participantRole: (participantRes.data?.role as IncidentParticipantRole | undefined) ?? null,
  };
}

export type CreateIncidentItemInput = {
  roomId: string;
  lane: IncidentItemRow['lane'];
  title: string;
  body: string;
  sourceUrl?: string | null;
  sourceType: IncidentItemRow['source_type'];
  contentWarning?: string | null;
  authorId: string;
};

export async function createIncidentItem(
  supabase: Client,
  input: CreateIncidentItemInput,
): Promise<IncidentItemRow> {
  const { data, error } = await supabase
    .from('incident_items')
    .insert({
      room_id: input.roomId,
      lane: input.lane,
      title: input.title.trim(),
      body: input.body.trim(),
      source_url: input.sourceUrl?.trim() || null,
      source_type: input.sourceType,
      content_warning: input.contentWarning?.trim() || null,
      author_id: input.authorId,
      verification_status: input.sourceUrl?.trim() ? 'pending_review' : 'unverified',
      moderation_state: 'pending',
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as IncidentItemRow;
}

export async function updateIncidentItemModeration(
  supabase: Client,
  itemId: string,
  moderatorId: string,
  patch: Pick<
    IncidentItemRow,
    'moderation_state' | 'moderation_note' | 'verification_status' | 'lane'
  >,
): Promise<void> {
  const { error } = await supabase
    .from('incident_items')
    .update({
      moderation_state: patch.moderation_state,
      moderation_note: patch.moderation_note,
      verification_status: patch.verification_status,
      lane: patch.lane,
      moderator_id: moderatorId,
    })
    .eq('id', itemId);

  if (error) throw new Error(error.message);
}

export async function createIncidentThread(
  supabase: Client,
  input: { roomId: string; topic: string; itemId?: string | null },
): Promise<IncidentThreadRow> {
  const { data, error } = await supabase
    .from('incident_threads')
    .insert({
      room_id: input.roomId,
      topic: input.topic.trim(),
      item_id: input.itemId ?? null,
      status: 'open',
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as IncidentThreadRow;
}

export async function createIncidentMessage(
  supabase: Client,
  input: { threadId: string; body: string; authorId: string; isFacilitator: boolean },
): Promise<IncidentMessageRow> {
  const { data, error } = await supabase
    .from('incident_messages')
    .insert({
      thread_id: input.threadId,
      body: input.body.trim(),
      author_id: input.authorId,
      is_facilitator: input.isFacilitator,
      moderation_state: 'pending',
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as IncidentMessageRow;
}

export async function updateIncidentThreadStatus(
  supabase: Client,
  threadId: string,
  status: IncidentThreadRow['status'],
): Promise<void> {
  const { error } = await supabase.from('incident_threads').update({ status }).eq('id', threadId);
  if (error) throw new Error(error.message);
}
