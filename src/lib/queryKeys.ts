/**
 * Centralized TanStack Query keys for server state (auth, profile, messages).
 *
 * Each domain exposes:
 *   - factory functions that return a fully-qualified key (e.g. `profile(userId)`)
 *   - an `.all` prefix array for bulk operations like `removeQueries({ queryKey })`
 *
 * Always import from here — consult `docs/technical/react-query-cache.md` before
 * adding new top-level domains.
 */
const profileFn = (userId: string | null | undefined) => ['profile', userId ?? 'none'] as const;

const moderatorFn = (userId: string | null | undefined) => ['moderator', userId ?? 'none'] as const;

const squadFn = (squadId: string | undefined) => ['squad', squadId ?? 'none'] as const;

const squadPeerProfilesFn = (squadId: string | undefined) =>
  ['squad', 'peerProfiles', squadId ?? 'none'] as const;

export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  profile: Object.assign(profileFn, { all: ['profile'] as const }),
  squad: Object.assign(squadFn, { all: ['squad'] as const }),
  squadPeerProfiles: Object.assign(squadPeerProfilesFn, {
    all: ['squad', 'peerProfiles'] as const,
  }),
  moderator: Object.assign(moderatorFn, { all: ['moderator'] as const }),
  messages: {
    all: ['messages'] as const,
    list: (squadId: string | undefined) => ['messages', 'list', squadId ?? 'none'] as const,
  },
};
