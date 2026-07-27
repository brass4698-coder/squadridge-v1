/**
 * Centralized TanStack Query keys for server state (auth, profile, messages).
 */
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  profile: (userId: string | null | undefined) => ['profile', userId ?? 'none'] as const,
  squad: (squadId: string | undefined) => ['squad', squadId ?? 'none'] as const,
  squadPeerProfiles: (squadId: string | undefined) =>
    ['squad', 'peerProfiles', squadId ?? 'none'] as const,
  moderator: (userId: string | null | undefined) => ['moderator', userId ?? 'none'] as const,
  messages: {
    list: (squadId: string | undefined) => ['messages', 'list', squadId ?? 'none'] as const,
  },
  incident: {
    rooms: (filters?: { status?: string; severity?: string }) =>
      ['incident', 'rooms', filters?.status ?? 'all', filters?.severity ?? 'all'] as const,
    room: (slug: string | undefined) => ['incident', 'room', slug ?? 'none'] as const,
  },
} as const;
