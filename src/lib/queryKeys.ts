/**
 * Centralized TanStack Query keys for server state (auth, profile, messages).
 */
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  profile: (userId: string | null | undefined) => ['profile', userId ?? 'none'] as const,
  squad: (squadId: string | undefined) => ['squad', squadId ?? 'none'] as const,
  squadPeers: (squadId: string | undefined) => ['squad', 'peers', squadId ?? 'none'] as const,
  moderator: (userId: string | null | undefined) => ['moderator', userId ?? 'none'] as const,
  messages: {
    list: (squadId: string | undefined) => ['messages', 'list', squadId ?? 'none'] as const,
  },
} as const;
