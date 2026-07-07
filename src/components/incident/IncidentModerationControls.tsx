import { useState } from 'react';
import { toast } from 'sonner';
import { INCIDENT_LANES, type IncidentItemRow } from '../../lib/incident/types';

type IncidentModerationControlsProps = {
  item: IncidentItemRow;
  disabled?: boolean;
  onSave: (
    patch: Pick<
      IncidentItemRow,
      'moderation_state' | 'moderation_note' | 'verification_status' | 'lane'
    >,
  ) => Promise<void>;
};

export function IncidentModerationControls({
  item,
  disabled,
  onSave,
}: IncidentModerationControlsProps) {
  const [lane, setLane] = useState(item.lane);
  const [verificationStatus, setVerificationStatus] = useState(item.verification_status);
  const [moderationState, setModerationState] = useState(item.moderation_state);
  const [note, setNote] = useState(item.moderation_note ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        lane,
        verification_status: verificationStatus,
        moderation_state: moderationState,
        moderation_note: note.trim() || null,
      });
      toast.success('Moderation update saved.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save moderation update.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      aria-label="Moderation controls"
      className="space-y-3 rounded-lg border border-line bg-surface-secondary p-4"
    >
      <h3 className="font-heading text-section-title font-semibold text-ink">Moderator review</h3>
      <p className="text-app-body text-ink-secondary">
        Re-categorize entries, attach verification notes, or remove content without deleting the
        audit trail.
      </p>

      <label className="block space-y-1">
        <span className="text-app-meta font-medium text-ink-secondary">Lane</span>
        <select
          value={lane}
          onChange={(event) => setLane(event.target.value as IncidentItemRow['lane'])}
          disabled={disabled || saving}
          className="focus-ring min-h-[44px] w-full rounded-md border border-line bg-surface px-3 text-app-body text-ink"
        >
          {INCIDENT_LANES.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-app-meta font-medium text-ink-secondary">Verification status</span>
        <select
          value={verificationStatus}
          onChange={(event) =>
            setVerificationStatus(event.target.value as IncidentItemRow['verification_status'])
          }
          disabled={disabled || saving}
          className="focus-ring min-h-[44px] w-full rounded-md border border-line bg-surface px-3 text-app-body text-ink"
        >
          <option value="pending_review">Pending review</option>
          <option value="corroborated">Corroborated</option>
          <option value="disputed">Disputed</option>
          <option value="unverified">Unverified</option>
          <option value="retracted">Retracted</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-app-meta font-medium text-ink-secondary">Moderation state</span>
        <select
          value={moderationState}
          onChange={(event) =>
            setModerationState(event.target.value as IncidentItemRow['moderation_state'])
          }
          disabled={disabled || saving}
          className="focus-ring min-h-[44px] w-full rounded-md border border-line bg-surface px-3 text-app-body text-ink"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="flagged">Flagged</option>
          <option value="removed">Removed</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-app-meta font-medium text-ink-secondary">Verification note</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={disabled || saving}
          rows={3}
          className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2 text-app-body text-ink"
          placeholder="Explain the verification decision for facilitators and partners."
        />
      </label>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={disabled || saving}
        className="focus-ring inline-flex min-h-[44px] items-center justify-center rounded-md border border-brand/40 bg-brand-soft px-4 text-app-button font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save moderation update'}
      </button>
    </section>
  );
}
