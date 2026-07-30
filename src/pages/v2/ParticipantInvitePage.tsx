import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';

type InviteMethod = 'email' | 'link';

type Participant = {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
};

// Mock data
const mockParticipants: Participant[] = [
  { id: 'p1', name: 'Amara Nwosu',    email: 'amara@ngo-partners.org',  status: 'approved', submittedAt: 'Jun 17' },
  { id: 'p2', name: 'Jonas Berglund', email: 'j.berglund@mediation.se', status: 'pending',  submittedAt: 'Jun 18' },
  { id: 'p3', name: 'Priya Chandran', email: 'p.chandran@institute.in', status: 'pending',  submittedAt: 'Jun 18' },
  { id: 'p4', name: 'Kwame Asante',   email: 'kwame@civilsociety.gh',   status: 'declined', submittedAt: 'Jun 16' },
];

export function ParticipantInvitePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [method, setMethod] = useState<InviteMethod>('email');
  const [emailInput, setEmailInput] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [emailError, setEmailError] = useState('');
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://mendguild.app/invite/${sessionId ?? 'sess-001'}?token=demo-token-abc123`;

  function addEmail() {
    const raw = emailInput.trim();
    if (!raw) return;
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(raw)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    if (emailList.includes(raw)) {
      setEmailError('Already added.');
      return;
    }
    setEmailList((l) => [...l, raw]);
    setEmailInput('');
    setEmailError('');
  }

  function removeEmail(email: string) {
    setEmailList((l) => l.filter((e) => e !== email));
  }

  function sendInvites() {
    // Replace with real API call
    alert(`Invitations sent to: ${emailList.join(', ')}`);
    setEmailList([]);
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function updateStatus(id: string, status: Participant['status']) {
    setParticipants((ps) => ps.map((p) => (p.id === id ? { ...p, status } : p)));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1
          className="mb-1 text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Invite Participants
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Session: <span style={{ color: 'var(--color-text-primary)' }}>Northern Watershed Consultation</span>
        </p>
      </div>

      {/* Method tabs */}
      <div
        className="mb-8 inline-flex rounded-lg border p-1"
        role="tablist"
        aria-label="Invitation method"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        {(['email', 'link'] as const).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={method === m}
            onClick={() => setMethod(m)}
            className="rounded px-5 py-2 text-sm font-medium capitalize transition-colors"
            style={{
              backgroundColor: method === m ? 'var(--color-accent)' : 'transparent',
              color: method === m ? '#fff' : 'var(--color-text-secondary)',
            }}
          >
            {m === 'email' ? 'Email invites' : 'Invite link'}
          </button>
        ))}
      </div>

      {/* Email method */}
      {method === 'email' && (
        <section
          className="mb-10 rounded-lg border p-6"
          aria-label="Email invitations"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="email-input" className="sr-only">Email address</label>
              <input
                id="email-input"
                type="email"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setEmailError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } }}
                placeholder="colleague@organisation.org"
                className="w-full rounded border px-4 py-2.5 text-sm outline-none transition-colors"
                style={{
                  borderColor: emailError ? 'var(--color-danger)' : 'var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-text-primary)',
                }}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" role="alert" className="mt-1 text-xs" style={{ color: 'var(--color-danger)' }}>
                  {emailError}
                </p>
              )}
            </div>
            <button
              onClick={addEmail}
              className="shrink-0 rounded px-4 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Add
            </button>
          </div>

          {emailList.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {emailList.length} recipient{emailList.length > 1 ? 's' : ''} queued
              </p>
              <ul className="flex flex-wrap gap-2">
                {emailList.map((email) => (
                  <li
                    key={email}
                    className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  >
                    {email}
                    <button
                      onClick={() => removeEmail(email)}
                      aria-label={`Remove ${email}`}
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={sendInvites}
                className="mt-4 rounded px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                Send Invitations →
              </button>
            </div>
          )}
        </section>
      )}

      {/* Link method */}
      {method === 'link' && (
        <section
          className="mb-10 rounded-lg border p-6"
          aria-label="Invite link"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Share this link with anyone you want to invite. They will still need to complete verification before gaining access.
          </p>
          <div className="flex gap-3">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 rounded border px-4 py-2.5 font-mono text-xs outline-none"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text-secondary)',
              }}
              aria-label="Invite link"
            />
            <button
              onClick={copyLink}
              className="shrink-0 rounded px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: copied ? 'var(--color-success)' : 'var(--color-accent)' }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </section>
      )}

      {/* Participant list */}
      <section aria-labelledby="participant-list-heading">
        <h2
          id="participant-list-heading"
          className="mb-4 text-base font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Applications ({participants.length})
        </h2>
        <div
          className="overflow-hidden rounded-lg border"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                {['Name', 'Email', 'Status', 'Applied', 'Actions'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>{p.name}</td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{p.email}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge variant={p.status}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </StatusBadge>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{p.submittedAt}</td>
                  <td className="px-5 py-3.5">
                    {p.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateStatus(p.id, 'approved')}
                          className="text-xs font-medium underline transition-opacity hover:opacity-70"
                          style={{ color: 'var(--color-success)' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(p.id, 'declined')}
                          className="text-xs font-medium underline transition-opacity hover:opacity-70"
                          style={{ color: 'var(--color-danger)' }}
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {p.status !== 'pending' && (
                      <button
                        onClick={() => updateStatus(p.id, 'pending')}
                        className="text-xs underline transition-opacity hover:opacity-70"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
