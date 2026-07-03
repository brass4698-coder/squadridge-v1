export type SessionFixtureStatus =
  | 'live'
  | 'pending'
  | 'draft'
  | 'released'
  | 'archived'
  | 'paused';

export type SessionFixture = {
  id: string;
  title: string;
  status: SessionFixtureStatus;
  participants: number;
  date: string;
  org: string;
};

/** Shared mock sessions until Phase 4 wires Supabase hooks. */
export const SESSION_FIXTURES: SessionFixture[] = [
  {
    id: 'sess-001',
    title: 'Northern Watershed Consultation',
    status: 'live',
    participants: 12,
    date: 'Jun 18, 2024',
    org: 'Regional Mediation Centre',
  },
  {
    id: 'sess-002',
    title: 'Urban Housing Policy Working Group',
    status: 'pending',
    participants: 8,
    date: 'Jun 18, 2024',
    org: 'City Planning Consortium',
  },
  {
    id: 'sess-003',
    title: 'Regional Trade Framework — Round 2',
    status: 'draft',
    participants: 6,
    date: 'Jun 19, 2024',
    org: 'Trade Facilitation Office',
  },
  {
    id: 'sess-004',
    title: 'Community Land Use — Joint Statement',
    status: 'released',
    participants: 12,
    date: 'Mar 14, 2024',
    org: 'Regional Mediation Centre',
  },
  {
    id: 'sess-005',
    title: 'Coastal Zone Management Dialogue',
    status: 'archived',
    participants: 9,
    date: 'Feb 2, 2024',
    org: 'Coastal Authority',
  },
];

export function findSessionFixture(sessionId: string | undefined): SessionFixture | undefined {
  if (!sessionId) return undefined;
  return SESSION_FIXTURES.find((s) => s.id === sessionId);
}
