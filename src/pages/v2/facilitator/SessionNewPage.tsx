import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { FormField } from '../../../components/ui/FormField';
import { FormPanel } from '../../../components/ui/FormPanel';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import { useSessions } from '../../../hooks/useSessions';
import { appRoutes } from '../../../lib/appRoutes';
import {
  DEFAULT_PILOT_TEMPLATE_ID,
  SESSION_TEMPLATES,
  getSessionTemplate,
  type SessionTemplateId,
} from '../../../lib/sessionTemplates';
import {
  capacityAboveRecommendedWarning,
  DEFAULT_MAX_PARTICIPANTS,
  MAX_ROOM_PARTICIPANTS,
  MIN_ROOM_PARTICIPANTS,
  parseMaxParticipantsInput,
  RECOMMENDED_MAX_PARTICIPANTS,
} from '../../../lib/roomCapacity';

const CONFLICT_TYPES = [
  'Labour / employment',
  'Land & property',
  'Commercial / contractual',
  'Community & civic',
  'Family & interpersonal',
  'Environmental',
  'Political / governance',
  'Other',
];

const LANGUAGE_OPTIONS = [
  'English',
  'Arabic',
  'French',
  'Spanish',
  'Mandarin',
  'Swahili',
  'Portuguese',
  'Russian',
  'Hindi',
  'Other',
];

function formFromTemplate(id: SessionTemplateId) {
  const template = getSessionTemplate(id);
  if (!template) {
    return {
      title: '',
      conflictType: '',
      language: 'English',
      maxParticipants: '2',
      eligibilityNotes: '',
      issueGoal: '',
      riskNotes: '',
      disclosureBoundaries: '',
      outcomePublic: false,
      identityVerification: true,
    };
  }
  return {
    title: '',
    conflictType: template.conflictType,
    language: template.language,
    maxParticipants: String(template.maxParticipants),
    eligibilityNotes: template.eligibilityNotes,
    issueGoal: '',
    riskNotes: '',
    disclosureBoundaries: '',
    outcomePublic: template.outcomePublic,
    identityVerification: template.identityVerification,
  };
}

export function SessionNewPage() {
  const navigate = useNavigate();
  const { createSession } = useSessions();
  const [templateId, setTemplateId] = useState<SessionTemplateId>(DEFAULT_PILOT_TEMPLATE_ID);
  const [form, setForm] = useState(() => formFromTemplate(DEFAULT_PILOT_TEMPLATE_ID));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyTemplate(id: SessionTemplateId) {
    const template = getSessionTemplate(id);
    if (!template || template.pilotFocus === 'deferred') return;
    setTemplateId(id);
    setForm(formFromTemplate(id));
  }

  function set(key: string, value: unknown) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const parsedMaxParticipants = parseMaxParticipantsInput(
    form.maxParticipants,
    DEFAULT_MAX_PARTICIPANTS,
  );
  const capacityWarning = capacityAboveRecommendedWarning(parsedMaxParticipants);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const template = templateId ? getSessionTemplate(templateId) : undefined;
      const row = await createSession({
        title: form.title,
        conflict_type: form.conflictType,
        language: form.language,
        max_participants: parsedMaxParticipants,
        eligibility_notes: form.eligibilityNotes || null,
        issue_goal: form.issueGoal.trim() || null,
        risk_notes: form.riskNotes.trim() || null,
        disclosure_boundaries: form.disclosureBoundaries.trim() || null,
        identity_verification_required: form.identityVerification,
        outcome_public: form.outcomePublic,
        status: 'setup',
        dialogue_stage: 'preparation',
        template_id: templateId || null,
        setup_config: template?.setupConfig ?? {},
      });
      navigate(appRoutes.sessionInvite(row.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create session');
      setSaving(false);
    }
  }

  return (
    <AuthenticatedShell>
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <p className="mb-1 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint">
            New session
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Configure session</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Capture the issue brief, eligibility, and disclosure boundaries before inviting
            participants. This is intake — not an open chat room.
          </p>
        </div>

        <div className="mb-8">
          <p className="mb-1.5 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.12em] text-ink-faint">
            Session template
          </p>
          <p className="mb-2 text-xs text-ink-secondary">
            Pilot default: NGO internal deliberation with a private anchored decision memo. Public
            ledger publish is optional.
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {SESSION_TEMPLATES.map((template) => {
              const deferred = template.pilotFocus === 'deferred';
              const selected = templateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  disabled={deferred}
                  onClick={() => applyTemplate(template.id)}
                  aria-disabled={deferred}
                  title={
                    deferred
                      ? 'Not pilot focus — available after first private releases'
                      : undefined
                  }
                  className={`sr-form-tile focus-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected ? 'border-brand/50 shadow-sr-sm' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink">{template.label}</p>
                    {template.pilotFocus === 'primary' ? (
                      <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-wide text-brand">
                        Pilot default
                      </span>
                    ) : null}
                    {deferred ? (
                      <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-secondary">
                        Later
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-ink-secondary">
                    {deferred
                      ? 'Not pilot focus. Use NGO deliberation or community mediation for first runs.'
                      : template.audience}
                  </p>
                  {!deferred && !template.outcomePublic ? (
                    <p className="mt-2 text-xs text-brand">Private anchored outcome by default</p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <FormPanel
          className="mb-8"
          eyebrow="Parameters"
          title="Session configuration"
          description="Eligibility and policies for this governed room."
          data-demo="session-new"
        >
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5">
            <FormField id="session-title" label="Session title" instrument>
              <Input
                id="session-title"
                required
                placeholder="e.g. Q1 community safety coordination — March 2026"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </FormField>

            <FormField id="conflict-type" label="Conflict type" instrument>
              <Select
                id="conflict-type"
                required
                value={form.conflictType}
                onChange={(e) => set('conflictType', e.target.value)}
              >
                <option value="">Select…</option>
                {CONFLICT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField id="language" label="Primary language" instrument>
              <Select
                id="language"
                value={form.language}
                onChange={(e) => set('language', e.target.value)}
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              id="max-participants"
              label="Maximum participants"
              hint={`Recommended 4–${RECOMMENDED_MAX_PARTICIPANTS} for high-stakes dialogue. Hard ceiling ${MAX_ROOM_PARTICIPANTS}. Above ${RECOMMENDED_MAX_PARTICIPANTS} is for co-facilitated institutional cases.`}
              instrument
            >
              <Input
                id="max-participants"
                type="number"
                min={MIN_ROOM_PARTICIPANTS}
                max={MAX_ROOM_PARTICIPANTS}
                value={form.maxParticipants}
                onChange={(e) => set('maxParticipants', e.target.value)}
              />
            </FormField>
            {capacityWarning ? (
              <p className="text-sm text-sem-warning" role="status">
                {capacityWarning}
              </p>
            ) : null}

            <FormField
              id="issue-goal"
              label="Issue goal"
              hint="What a successful outcome looks like for this room."
              instrument
            >
              <Textarea
                id="issue-goal"
                rows={2}
                required
                placeholder="e.g. Agree a private decision memo the board can act on without naming speakers."
                value={form.issueGoal}
                onChange={(e) => set('issueGoal', e.target.value)}
              />
            </FormField>

            <FormField
              id="risk-notes"
              label="Risk notes"
              hint="Known tension, escalation factors, or crisis boundaries (facilitator-facing)."
              instrument
            >
              <Textarea
                id="risk-notes"
                rows={2}
                placeholder="e.g. Two parties have a recent public dispute; pause early if personal attacks appear."
                value={form.riskNotes}
                onChange={(e) => set('riskNotes', e.target.value)}
              />
            </FormField>

            <FormField
              id="eligibility"
              label="Participant criteria"
              hint="Who belongs in this room — standing, role, or organisational representation."
              instrument
            >
              <Textarea
                id="eligibility"
                rows={3}
                placeholder="Any screening criteria or context notes for this session…"
                value={form.eligibilityNotes}
                onChange={(e) => set('eligibilityNotes', e.target.value)}
              />
            </FormField>

            <FormField
              id="disclosure-boundaries"
              label="Disclosure boundaries"
              hint="What must stay in the room vs what may enter an approved record."
              instrument
            >
              <Textarea
                id="disclosure-boundaries"
                rows={2}
                placeholder="e.g. No names or attributions on any released text; operational details stay private."
                value={form.disclosureBoundaries}
                onChange={(e) => set('disclosureBoundaries', e.target.value)}
              />
            </FormField>

            <div className="rounded-[var(--sr-radius-lg)] bg-surface-secondary/80 p-5 shadow-sr-sm">
              <p className="mb-4 font-mono text-[length:var(--text-label)] font-medium uppercase tracking-[0.14em] text-ink-faint">
                Session policies
              </p>
              <div className="flex flex-col gap-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-brand"
                    checked={form.identityVerification}
                    onChange={(e) => set('identityVerification', e.target.checked)}
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">Require identity verification</p>
                    <p className="text-xs text-ink-secondary">
                      Participants must complete document upload before entering the room.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-brand"
                    checked={form.outcomePublic}
                    onChange={(e) => set('outcomePublic', e.target.checked)}
                  />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      Also publish to the public ledger
                    </p>
                    <p className="text-xs text-ink-secondary">
                      Leave unchecked for a private partner-shared anchored record (recommended for
                      first pilots). When checked, approved outcome text appears at /ledger —
                      identities stay private either way.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {error ? (
              <p className="text-sm text-sem-danger" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(appRoutes.sessions)}
                className="btn-institutional btn-institutional--ghost flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-institutional btn-institutional--primary flex-1 disabled:opacity-50"
              >
                {saving ? 'Creating…' : 'Create session'}
              </button>
            </div>
          </form>
        </FormPanel>
      </div>
    </AuthenticatedShell>
  );
}
