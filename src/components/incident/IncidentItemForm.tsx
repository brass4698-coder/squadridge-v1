import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { contactInfoValidationMessage } from '../../utils/contactInfoPatterns';
import {
  INCIDENT_LANES,
  type IncidentItemRow,
  type IncidentSourceType,
} from '../../lib/incident/types';

const SOURCE_TYPES: readonly { value: IncidentSourceType; label: string }[] = [
  { value: 'document', label: 'Document' },
  { value: 'statement', label: 'Statement' },
  { value: 'news', label: 'News report' },
  { value: 'social', label: 'Social post' },
  { value: 'official', label: 'Official release' },
  { value: 'other', label: 'Other' },
];

type IncidentItemFormProps = {
  disabled?: boolean;
  onSubmit: (input: {
    lane: IncidentItemRow['lane'];
    title: string;
    body: string;
    sourceUrl?: string | null;
    sourceType: IncidentSourceType;
    contentWarning?: string | null;
  }) => Promise<void>;
};

export function IncidentItemForm({ disabled, onSubmit }: IncidentItemFormProps) {
  const [lane, setLane] = useState<IncidentItemRow['lane']>('verified_evidence');
  const [sourceType, setSourceType] = useState<IncidentSourceType>('document');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [contentWarning, setContentWarning] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const contactError = contactInfoValidationMessage(body);
    if (contactError) {
      toast.error(contactError);
      return;
    }
    if (!title.trim() || !body.trim()) {
      toast.error('Add a title and summary before sharing.');
      return;
    }
    if (!sourceUrl.trim()) {
      toast.error('Every factual claim needs a source link or must stay in unverified leads.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        lane,
        title,
        body,
        sourceUrl: sourceUrl.trim(),
        sourceType,
        contentWarning: contentWarning.trim() || null,
      });
      setTitle('');
      setBody('');
      setSourceUrl('');
      setContentWarning('');
      toast.success('Entry submitted for review.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not add entry.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4 rounded-lg border border-line bg-surface-secondary p-4"
    >
      <div>
        <h3 className="font-heading text-section-title font-semibold text-ink">
          Share a verified source
        </h3>
        <p className="mt-1 text-app-body text-ink-secondary">
          Use calm, specific language. Avoid naming private individuals unless the source is an
          verified institution.
        </p>
      </div>

      <label className="block space-y-1">
        <span className="text-app-meta font-medium text-ink-secondary">Lane</span>
        <select
          value={lane}
          onChange={(event) => setLane(event.target.value as IncidentItemRow['lane'])}
          disabled={disabled || submitting}
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
        <span className="text-app-meta font-medium text-ink-secondary">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={disabled || submitting}
          className="focus-ring min-h-[44px] w-full rounded-md border border-line bg-surface px-3 text-app-body text-ink"
          placeholder="Brief, neutral summary"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-app-meta font-medium text-ink-secondary">Summary</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={disabled || submitting}
          rows={4}
          className="focus-ring w-full rounded-md border border-line bg-surface px-3 py-2 text-app-body text-ink"
          placeholder="What does this source establish? Keep detail proportional to verification status."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-app-meta font-medium text-ink-secondary">Source URL</span>
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            disabled={disabled || submitting}
            type="url"
            className="focus-ring min-h-[44px] w-full rounded-md border border-line bg-surface px-3 text-app-body text-ink"
            placeholder="https://"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-app-meta font-medium text-ink-secondary">Source type</span>
          <select
            value={sourceType}
            onChange={(event) => setSourceType(event.target.value as IncidentSourceType)}
            disabled={disabled || submitting}
            className="focus-ring min-h-[44px] w-full rounded-md border border-line bg-surface px-3 text-app-body text-ink"
          >
            {SOURCE_TYPES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-app-meta font-medium text-ink-secondary">
          Content warning (optional)
        </span>
        <input
          value={contentWarning}
          onChange={(event) => setContentWarning(event.target.value)}
          disabled={disabled || submitting}
          className="focus-ring min-h-[44px] w-full rounded-md border border-line bg-surface px-3 text-app-body text-ink"
          placeholder="Note sensitive themes without graphic detail"
        />
      </label>

      <button
        type="submit"
        disabled={disabled || submitting}
        className="focus-ring btn-primary inline-flex min-h-[44px] items-center justify-center px-4 py-2 text-app-button font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Add verified source'}
      </button>
    </form>
  );
}
