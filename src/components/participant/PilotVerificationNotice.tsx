/** Honest disclosure for pilot participant verification (facilitator-reviewed, not automated KYC). */
export function PilotVerificationNotice() {
  return (
    <div
      className="mb-6 rounded-lg border px-4 py-3 text-left text-xs leading-relaxed"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-accent-light)',
        color: 'var(--color-text-secondary)',
      }}
      role="note"
    >
      <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Pilot verification — facilitator review
      </p>
      <p className="mt-1">
        In this pilot, you confirm an organisational email (stored as a one-way hash) and may upload
        a document for your facilitator to review. Automated identity verification is not active.
        Your facilitator approves or denies access on the participant review screen before the room
        opens.
      </p>
    </div>
  );
}
