import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParticipantToken } from '../../../hooks/useParticipantToken';

const disclosures = [
  {
    id: 'privacy',
    heading: 'Your participation is confidential',
    body: 'Your contributions within the session room will not be recorded, published, or attributed to you without your explicit consent. The room is private by design.',
  },
  {
    id: 'outcome',
    heading: 'Only approved outcomes may become public',
    body: 'If a joint outcome document is produced, it will only be released to the public ledger after all designated approvers have consented. You will be notified and given the opportunity to review it before release.',
  },
  {
    id: 'identity',
    heading: 'Your identity is protected within the room',
    body: 'Participants are identified to each other only by the display name and role agreed during onboarding. No personal contact information is shared with other participants.',
  },
  {
    id: 'exit',
    heading: 'You may withdraw at any time',
    body: 'You are not obligated to continue participation. You may leave the session or withdraw consent at any point. Withdrawing after the session begins does not affect any outcome already agreed prior to your withdrawal.',
  },
  {
    id: 'facilitation',
    heading: 'The session is facilitated, not moderated for content',
    body: 'The facilitator ensures procedural integrity. They do not editorially control the dialogue, but they may pause or redirect the session if safety or process concerns arise.',
  },
];

export function ConsentPage() {
  const token = useParticipantToken();
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  function proceed() {
    if (!checked) return;
    setAccepted(true);
    setTimeout(() => navigate(`/p/briefing/${token}`), 500);
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-xl">
        <p
          className="mb-4 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-accent)' }}
        >
          Before you proceed
        </p>
        <h1
          className="mb-3 text-2xl font-semibold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Participation disclosure
        </h1>
        <p
          className="mb-8 text-sm leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Please read the following carefully. These are the conditions under which your
          participation in this session takes place. They are not legal boilerplate — they describe
          what is actually happening.
        </p>

        <dl className="mb-8 flex flex-col gap-5">
          {disclosures.map((d) => (
            <div
              key={d.id}
              className="rounded-lg border p-6"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
              }}
            >
              <dt
                className="mb-2 text-sm font-semibold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {d.heading}
              </dt>
              <dd
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {d.body}
              </dd>
            </div>
          ))}
        </dl>

        <label
          className="mb-6 flex cursor-pointer items-start gap-4 rounded-lg border p-5"
          style={{
            borderColor: checked ? 'var(--color-accent)' : 'var(--color-border)',
            backgroundColor: checked ? 'var(--color-accent-light)' : 'var(--color-surface)',
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ accentColor: 'var(--color-accent)' }}
          />
          <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
            I have read and understood the above. I agree to participate under these conditions.
          </span>
        </label>

        <button
          onClick={proceed}
          disabled={!checked || accepted}
          className="w-full rounded py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          {accepted ? 'Confirmed — loading briefing…' : 'Confirm & Continue to Briefing'}
        </button>

        <p className="mt-4 text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          Your confirmation is recorded. You may review these terms again from the session briefing
          page.
        </p>
      </div>
    </div>
  );
}
