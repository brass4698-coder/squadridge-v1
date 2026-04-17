# TanStack Query cache strategy

Central keys live in `src/lib/queryKeys.ts`. Default client options are in `src/lib/queryClient.ts` (`networkMode: 'offlineFirst'`, limited retries).

## Messages (`queryKeys.messages.list(squadId)`)

- **Source of truth:** `useRealtimeMessages` combines infinite queries with Supabase Realtime `postgres_changes` and optimistic updates.
- **Invalidation:** On successful subscribe / catch-up, the hook calls `invalidateQueries` for the list key so fetches stay aligned with the server. Treat any manual message mutation the same way: invalidate `['messages', 'list', squadId]` after writes that bypass the hook.
- **Stale data:** Realtime inserts/updates merge into the cache; if the channel is down, rely on refetch after reconnect or user-triggered refresh.

## Squad state (`queryKeys.squad(squadId)`, peer profiles)

- **Lifetime:** Cached for the active session route. When the user navigates away from a squad room, squad-specific queries are no longer subscribed; refetch on re-entry is cheap.
- **Invalidation:** After mutations that change squad metadata (e.g. archive, key rotation), invalidate `queryKeys.squad(squadId)` and `queryKeys.squadPeerProfiles(squadId)` as needed.

## User profile (`queryKeys.profile(userId)`)

- **Policy:** Loaded with auth; treat as **long-lived** until settings change.
- **Invalidation:** `useProfile` mutations call `invalidateQueries({ queryKey: queryKeys.profile(userId) })` after updates. On sign-out, `AuthContext.signOut` removes `profile` and `messages` queries to avoid cross-user leakage.

## Auth session (`queryKeys.auth.session`)

- **Policy:** `staleTime` / `gcTime` are infinite; `onAuthStateChange` writes the latest session into the cache. No manual invalidation in normal flow.

## Moderator dashboard (`['mod', ...]` keys)

- **Invalidation:** Mutations in `ModDashboardPage` invalidate overlapping keys (e.g. messages for an expanded squad, audit log). Follow the same pattern when adding new mod actions.
