import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { appRoutes } from '../../../lib/appRoutes';

type VerificationStatus = 'pending' | 'verified' | 'denied';

interface Participant {
  id: string;
  codename: string;
  invitedAt: string;
  verificationStatus: VerificationStatus;
  documentSubmitted: boolean;
}

const SEED_PARTICIPANTS: Participant[] = [
  {
    id: 'p1',
    codename: 'Participant A',
    invitedAt: '2026-06-17 09:14',
    verificationStatus: 'verified',
    documentSubmitted: true,
  },
  {
    id: 'p2',
    codename: 'Participant B',
    invitedAt: '2026-06-17 09:21',
    verificationStatus: 'pending',
    documentSubmitted: true,
  },
  {
    id: 'p3',
    codename: 'Participant C',
    invitedAt: '2026-06-17 10:05',
    verificationStatus: 'pending',
    documentSubmitted: false,
  },
];

export function ParticipantsReviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>(SEED_PARTICIPANTS);

  function setStatus(id: string, status: VerificationStatus) {
    setParticipants((ps) =>
      ps.map((p) => (p.id === id ? { ...p, verificationStatus: status } : p)),
    );
  }

  const allVerified = participants.every((p) => p.verificationStatus === 'verified');

  return (
    <AuthenticatedShell>
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p
              className="mb-1 text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Session {sessionId}
            </p>
            <h1
              className="text-xl font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Participant review
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Review submitted documents and approve or deny each participant before starting the
              session.
            </p>
          </div>
          <button
            disabled={!allVerified}
            onClick={() => navigate(appRoutes.sessionControl(sessionId ?? ''))}
            className="shrink-0 rounded px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Open room
          </button>
        </div>

        {/* Participant list */}
        <div className="flex flex-col gap-4">
          {participants.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border p-5"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {p.codename}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    Invited {p.invitedAt}
                  </p>
                </div>
                <StatusBadge variant={p.verificationStatus}>
                  {p.verificationStatus.charAt(0).toUpperCase() + p.verificationStatus.slice(1)}
                </StatusBadge>
              </div>

              <div
                className="mb-4 rounded p-3 text-xs"
                style={{
                  backgroundColor: p.documentSubmitted
                    ? 'var(--color-accent-light)'
                    : 'var(--color-border)',
                  color: p.documentSubmitted
                    ? 'var(--color-accent)'
                    : 'var(--color-text-secondary)',
                }}
              >
                {p.documentSubmitted
                  ? '✓ Identity document submitted'
                  : '○ No document submitted yet'}
              </div>

              {p.verificationStatus !== 'verified' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStatus(p.id, 'denied')}
                    className="flex-1 rounded border py-2 text-xs font-medium transition-opacity hover:opacity-70"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      backgroundColor: 'transparent',
                    }}
                  >
                    Deny
                  </button>
                  <button
                    disabled={!p.documentSubmitted}
                    onClick={() => setStatus(p.id, 'verified')}
                    className="flex-1 rounded py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    Approve
                  </button>
                </div>
              )}
              {p.verificationStatus === 'verified' && (
                <button
                  onClick={() => setStatus(p.id, 'pending')}
                  className="text-xs underline transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Undo approval
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </AuthenticatedShell>
  );
}
