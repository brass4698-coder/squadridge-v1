import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell';
import { FormField } from '../../components/ui/FormField';
import { FormPanel } from '../../components/ui/FormPanel';
import { Input } from '../../components/ui/Input';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useParticipants } from '../../hooks/useParticipants';
import { useSession } from '../../hooks/useSessions';
import { appRoutes } from '../../lib/appRoutes';
import { buildParticipantInviteUrl } from '../../lib/participantRoutes';
import { generateInviteToken, hashEmail } from '../../lib/participantToken';
import {
  inviteAboveRecommendedWarning,
  isRoomAtCapacity,
  MAX_ROOM_PARTICIPANTS,
  RECOMMENDED_MAX_PARTICIPANTS,
  roomCapacityErrorMessage,
} from '../../lib/roomCapacity';

export function ParticipantInvitePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { participants, loading, addParticipant } = useParticipants(sessionId);
  const [codename, setCodename] = useState('');
  const [email, setEmail] = useState('');
  const [inviteReason, setInviteReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inviteWarning = inviteAboveRecommendedWarning(participants.length);

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!codename.trim()) return;
    setError(null);
    const max = session?.max_participants ?? MAX_ROOM_PARTICIPANTS;
    if (isRoomAtCapacity(participants.length, max)) {
      setError(roomCapacityErrorMessage(max));
      return;
    }
    try {
      const token = generateInviteToken();
      const emailHash = email.trim() ? await hashEmail(email) : null;
      const row = await addParticipant(
        {
          codename: codename.trim(),
          invite_token: token,
          email_hash: emailHash,
          participation_reason: inviteReason.trim() || null,
        },
        max,
      );
      setLastLink(buildParticipantInviteUrl(row.invite_token));
      setCodename('');
      setEmail('');
      setInviteReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add participant');
    }
  }

  function copyLink(link: string) {
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <AuthenticatedShell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="mb-1 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Invite participants
          </p>
          <h1 className="text-xl font-semibold text-ink">
            {sessionLoading ? 'Loading…' : (session?.title ?? 'Session')}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Add participants with a codename and a unique invite link. Recommended room size is 4–
            {RECOMMENDED_MAX_PARTICIPANTS}; this session is limited to{' '}
            {session?.max_participants ?? MAX_ROOM_PARTICIPANTS} people ({participants.length}{' '}
            invited). Hard ceiling {MAX_ROOM_PARTICIPANTS}.
          </p>
          {inviteWarning ? (
            <p className="mt-2 text-sm text-sem-warning" role="status">
              {inviteWarning}
            </p>
          ) : null}
        </div>

        <FormPanel
          className="mb-8"
          eyebrow="New participant"
          title="Generate invite link"
          description="Codename is shown in-room. Email is hashed for your records only."
          data-demo="session-invite"
        >
          <form onSubmit={(e) => void handleAddParticipant(e)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="codename" label="Codename" instrument>
                <Input
                  id="codename"
                  required
                  value={codename}
                  onChange={(e) => setCodename(e.target.value)}
                  placeholder="Participant A"
                />
              </FormField>
              <FormField id="email" label="Email (optional, hashed only)" instrument>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="for your records only"
                />
              </FormField>
            </div>
            <FormField
              id="invite-reason"
              label="Why this person is in the room (optional prefill)"
              hint="Standing or relationship to the matter. Participant confirms or edits on accept."
              instrument
            >
              <Input
                id="invite-reason"
                value={inviteReason}
                onChange={(e) => setInviteReason(e.target.value)}
                placeholder="e.g. Watershed stewardship partner named in the brief"
              />
            </FormField>
            {error ? (
              <p className="text-sm text-sem-danger" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isRoomAtCapacity(
                participants.length,
                session?.max_participants ?? MAX_ROOM_PARTICIPANTS,
              )}
              className="btn-institutional btn-institutional--primary text-sm disabled:opacity-50"
            >
              Add participant &amp; generate link
            </button>
            {lastLink ? (
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={lastLink}
                  className="flex-1 font-mono text-xs"
                  aria-label="Latest invite link"
                />
                <button
                  type="button"
                  onClick={() => copyLink(lastLink)}
                  className="btn-institutional btn-institutional--ghost shrink-0"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            ) : null}
          </form>
        </FormPanel>

        <section aria-labelledby="participant-list-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id="participant-list-heading" className="text-base font-semibold text-ink">
              Participants ({participants.length})
            </h2>
            {sessionId ? (
              <Link
                to={appRoutes.sessionParticipants(sessionId)}
                className="text-sm font-medium text-brand hover:underline"
              >
                Review verification →
              </Link>
            ) : null}
          </div>
          {loading ? (
            <p className="text-sm text-ink-secondary">Loading participants…</p>
          ) : participants.length === 0 ? (
            <p className="text-sm text-ink-secondary">No participants yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {participants.map((p) => {
                const link = buildParticipantInviteUrl(p.invite_token);
                return (
                  <li
                    key={p.id}
                    className="sr-form-tile flex flex-wrap items-center justify-between gap-3 !p-4"
                  >
                    <div>
                      <p className="font-medium text-ink">{p.codename}</p>
                      <p className="font-mono text-xs text-ink-faint">{link}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge variant={p.verification_status}>
                        {p.verification_status}
                      </StatusBadge>
                      <button
                        type="button"
                        onClick={() => copyLink(link)}
                        className="text-xs text-brand hover:underline"
                      >
                        Copy link
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </AuthenticatedShell>
  );
}
