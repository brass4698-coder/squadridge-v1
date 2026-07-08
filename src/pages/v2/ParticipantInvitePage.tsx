import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthenticatedShell } from '../../components/layout/AuthenticatedShell';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useParticipants } from '../../hooks/useParticipants';
import { useSession } from '../../hooks/useSessions';
import { appRoutes } from '../../lib/appRoutes';
import { buildParticipantInviteUrl } from '../../lib/participantRoutes';
import { generateInviteToken, hashEmail } from '../../lib/participantToken';

export function ParticipantInvitePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, loading: sessionLoading } = useSession(sessionId);
  const { participants, loading, addParticipant } = useParticipants(sessionId);
  const [codename, setCodename] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!codename.trim()) return;
    setError(null);
    try {
      const token = generateInviteToken();
      const emailHash = email.trim() ? await hashEmail(email) : null;
      const row = await addParticipant({
        codename: codename.trim(),
        invite_token: token,
        email_hash: emailHash,
      });
      setLastLink(buildParticipantInviteUrl(row.invite_token));
      setCodename('');
      setEmail('');
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
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
            Invite participants
          </p>
          <h1 className="text-xl font-semibold text-ink">
            {sessionLoading ? 'Loading…' : (session?.title ?? 'Session')}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Add participants with a codename. Each receives a unique invite link for verification
            and consent.
          </p>
        </div>

        <form
          onSubmit={(e) => void handleAddParticipant(e)}
          className="mb-8 rounded-lg border border-line bg-surface-elevated p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="codename"
                className="mb-1 block text-xs font-medium text-ink-secondary"
              >
                Codename <span aria-hidden>*</span>
              </label>
              <input
                id="codename"
                required
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                placeholder="Participant A"
                className="w-full rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-ink-secondary">
                Email (optional, hashed only)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="for your records only"
                className="w-full rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink"
              />
            </div>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-sem-danger" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="btn-pill btn-pill--primary mt-4 text-sm">
            Add participant &amp; generate link
          </button>
          {lastLink ? (
            <div className="mt-4 flex gap-2">
              <input
                readOnly
                value={lastLink}
                className="flex-1 rounded border border-line bg-surface-sunken px-3 py-2 font-mono text-xs text-ink-secondary"
                aria-label="Latest invite link"
              />
              <button
                type="button"
                onClick={() => copyLink(lastLink)}
                className="rounded border border-line px-3 py-2 text-xs font-medium text-ink"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          ) : null}
        </form>

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
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-elevated p-4"
                  >
                    <div>
                      <p className="font-medium text-ink">{p.codename}</p>
                      <p className="text-xs text-ink-faint font-mono">{link}</p>
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
