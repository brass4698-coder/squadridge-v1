import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib';
import {
  createIncidentItem,
  createIncidentMessage,
  createIncidentThread,
  fetchIncidentRoomBySlug,
  fetchIncidentRooms,
  updateIncidentItemModeration,
  updateIncidentThreadStatus,
  type CreateIncidentItemInput,
} from '../lib/incident/queries';
import type { IncidentItemRow, IncidentRoomRow, IncidentThreadRow } from '../lib/incident/types';
import { queryKeys } from '../lib/queryKeys';

export function useIncidentRooms(filters?: {
  status?: IncidentRoomRow['status'];
  severity?: IncidentRoomRow['severity_tier'];
}) {
  const { supabase } = useAuth();

  return useQuery({
    queryKey: queryKeys.incident.rooms(filters),
    queryFn: () => {
      if (!supabase) return Promise.resolve([]);
      return fetchIncidentRooms(supabase, filters);
    },
    enabled: isSupabaseConfigured() && !!supabase,
  });
}

export function useIncidentRoom(slug: string | undefined) {
  const { supabase, user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.incident.room(slug),
    queryFn: () => {
      if (!supabase || !slug) return Promise.resolve(null);
      return fetchIncidentRoomBySlug(supabase, slug, user?.id);
    },
    enabled: isSupabaseConfigured() && !!supabase && !!slug,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.incident.room(slug) });

  const addItem = useMutation({
    mutationFn: (input: Omit<CreateIncidentItemInput, 'authorId' | 'roomId'>) => {
      if (!supabase || !user?.id || !query.data?.room.id) {
        throw new Error('Unable to add item.');
      }
      return createIncidentItem(supabase, {
        ...input,
        roomId: query.data.room.id,
        authorId: user.id,
      });
    },
    onSuccess: () => void invalidate(),
  });

  const moderateItem = useMutation({
    mutationFn: (input: {
      itemId: string;
      patch: Pick<
        IncidentItemRow,
        'moderation_state' | 'moderation_note' | 'verification_status' | 'lane'
      >;
    }) => {
      if (!supabase || !user?.id) throw new Error('Unable to moderate item.');
      return updateIncidentItemModeration(supabase, input.itemId, user.id, input.patch);
    },
    onSuccess: () => void invalidate(),
  });

  const openThread = useMutation({
    mutationFn: (input: { topic: string; itemId?: string | null }) => {
      if (!supabase || !query.data?.room.id) throw new Error('Unable to open thread.');
      return createIncidentThread(supabase, {
        roomId: query.data.room.id,
        topic: input.topic,
        itemId: input.itemId,
      });
    },
    onSuccess: () => void invalidate(),
  });

  const sendMessage = useMutation({
    mutationFn: (input: { threadId: string; body: string; isFacilitator: boolean }) => {
      if (!supabase || !user?.id) throw new Error('Unable to send message.');
      return createIncidentMessage(supabase, {
        threadId: input.threadId,
        body: input.body,
        authorId: user.id,
        isFacilitator: input.isFacilitator,
      });
    },
    onSuccess: () => void invalidate(),
  });

  const setThreadStatus = useMutation({
    mutationFn: (input: { threadId: string; status: IncidentThreadRow['status'] }) => {
      if (!supabase) throw new Error('Unable to update thread.');
      return updateIncidentThreadStatus(supabase, input.threadId, input.status);
    },
    onSuccess: () => void invalidate(),
  });

  const isStaff =
    query.data?.participantRole === 'facilitator' || query.data?.participantRole === 'moderator';
  const isModerator = query.data?.participantRole === 'moderator';

  return {
    ...query,
    isStaff,
    isModerator,
    addItem,
    moderateItem,
    openThread,
    sendMessage,
    setThreadStatus,
  };
}
