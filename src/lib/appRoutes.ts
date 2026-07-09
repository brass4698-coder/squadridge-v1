/** Canonical authenticated app paths (Phase 2 namespace). */
export const appRoutes = {
  dashboard: '/app',
  sessions: '/app/sessions',
  sessionNew: '/app/sessions/new/setup',
  session: (id: string) => `/app/sessions/${encodeURIComponent(id)}`,
  sessionInvite: (id: string) => `/app/sessions/${encodeURIComponent(id)}/invite`,
  sessionRoom: (id: string) => `/app/sessions/${encodeURIComponent(id)}/room`,
  sessionParticipants: (id: string) => `/app/sessions/${encodeURIComponent(id)}/participants`,
  sessionControl: (id: string) => `/app/sessions/${encodeURIComponent(id)}/control`,
  sessionOutcome: (id: string) => `/app/sessions/${encodeURIComponent(id)}/outcome`,
  sessionRelease: (id: string) => `/app/sessions/${encodeURIComponent(id)}/release`,
  participants: '/app/participants',
  insights: '/app/insights',
  outcomes: '/app/outcomes',
  outcomeNew: '/app/outcomes/new',
  outcome: (id: string) => `/app/outcomes/${encodeURIComponent(id)}`,
  settings: '/app/settings',
} as const;
