import { useMemo } from 'react';
import { useSessions } from './useSessions';
import { isV2MockDataEnabled } from '../lib/v2MockMode';
import { SESSION_FIXTURES } from '../pages/v2/sessionFixtures';
import type { Session } from '../lib/supabaseTypes';

export type FacilitatorSessionRow = {
  id: string;
  title: string;
  status: SessionFixtureStatus;
  participants: number;
  date: string;
  org: string;
};

type SessionFixtureStatus = (typeof SESSION_FIXTURES)[number]['status'];

function fixtureToRow(s: (typeof SESSION_FIXTURES)[number]): FacilitatorSessionRow {
  return {
    id: s.id,
    title: s.title,
    status: s.status,
    participants: s.participants,
    date: s.date,
    org: s.org,
  };
}

function dbToRow(s: Session): FacilitatorSessionRow {
  const statusMap: Record<Session['status'], SessionFixtureStatus> = {
    setup: 'draft',
    open: 'pending',
    live: 'live',
    paused: 'paused',
    ended: 'archived',
    released: 'released',
  };
  return {
    id: s.id,
    title: s.title,
    status: statusMap[s.status],
    participants: 0,
    date: new Date(s.created_at).toLocaleDateString(),
    org: '—',
  };
}

export function useFacilitatorSessions() {
  const real = useSessions();
  const useMock = isV2MockDataEnabled();

  const sessions = useMemo(() => {
    if (useMock) return SESSION_FIXTURES.map(fixtureToRow);
    if (real.sessions.length > 0) return real.sessions.map(dbToRow);
    if (real.error) return SESSION_FIXTURES.map(fixtureToRow);
    return [];
  }, [useMock, real.sessions, real.error]);

  return {
    sessions,
    loading: useMock ? false : real.loading,
    error: useMock ? null : real.error,
    createSession: real.createSession,
    refetch: real.refetch,
    isMock: useMock || Boolean(real.error),
  };
}

export function useDashboardMetrics(sessions: FacilitatorSessionRow[]) {
  return useMemo(() => {
    const active = sessions.filter((s) => s.status === 'live').length;
    const pending = sessions.filter((s) => s.status === 'pending').length;
    const released = sessions.filter((s) => s.status === 'released').length;
    const participants = sessions.reduce((sum, s) => sum + s.participants, 0);

    const sentimentTrend = [
      { label: 'W1', value: 62 },
      { label: 'W2', value: 68 },
      { label: 'W3', value: 71 },
      { label: 'W4', value: 74 },
    ];

    const statusMix = [
      { name: 'Live', value: active },
      { name: 'Pending', value: pending },
      { name: 'Draft', value: sessions.filter((s) => s.status === 'draft').length },
      { name: 'Released', value: released },
    ];

    return {
      kpis: [
        { label: 'Active sessions', value: String(active) },
        { label: 'Pending approvals', value: String(pending) },
        { label: 'Outcomes published', value: String(released) },
        { label: 'Participants', value: String(participants) },
      ],
      sentimentTrend,
      statusMix,
    };
  }, [sessions]);
}
