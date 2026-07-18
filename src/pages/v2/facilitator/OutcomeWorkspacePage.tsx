import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthenticatedShell } from '../../../components/layout/AuthenticatedShell';
import { useOutcomeRecord } from '../../../hooks/useOutcomeRecord';
import { useParticipants } from '../../../hooks/useParticipants';
import { appRoutes } from '../../../lib/appRoutes';

export function OutcomeWorkspacePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const importState = location.state as { agreedTermsImport?: string } | null;
  const { outcome, loading, saveDraft, submitForRelease, seedApprovals, approvals } =
    useOutcomeRecord(sessionId);
  const { participants } = useParticipants(sessionId);
  const [form, setForm] = useState({
    summary: '',
    agreedTerms: '',
    pendingItems: '',
    facilitatorNotes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!outcome) return;
    setForm({
      summary: outcome.summary ?? '',
      agreedTerms: outcome.agreed_terms ?? '',
      pendingItems: outcome.pending_items ?? '',
      facilitatorNotes: outcome.facilitator_notes ?? '',
    });
  }, [outcome]);

  useEffect(() => {
    if (!importState?.agreedTermsImport) return;
    setForm((f) => ({
      ...f,
      agreedTerms: f.agreedTerms.trim() ? f.agreedTerms : (importState.agreedTermsImport ?? ''),
    }));
    navigate(location.pathname, { replace: true, state: null });
  }, [importState?.agreedTermsImport, location.pathname, navigate]);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    try {
      await saveDraft({
        summary: form.summary,
        agreed_terms: form.agreedTerms || undefined,
        pending_items: form.pendingItems || undefined,
        facilitator_notes: form.facilitatorNotes || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
    setSaving(false);
  }

  async function handleSubmitForRelease() {
    setSaving(true);
    setError(null);
    try {
      await saveDraft({
        summary: form.summary,
        agreed_terms: form.agreedTerms || undefined,
        pending_items: form.pendingItems || undefined,
        facilitator_notes: form.facilitatorNotes || undefined,
      });
      await submitForRelease();
      if (approvals.length === 0) {
        const labels = [
          ...participants
            .filter((p) => p.verification_status === 'verified')
            .map((p) => p.codename),
          'Facilitator',
        ];
        await seedApprovals(labels);
      }
      navigate(appRoutes.sessionRelease(sessionId ?? ''));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
      setSaving(false);
    }
  }

  return (
    <AuthenticatedShell>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-secondary">
            Outcome workspace
          </p>
          <h1 className="text-xl font-semibold text-ink">Draft the public record</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Only facilitator-authored fields may be published. The session room and the public
            record are separate by design — room dialogue cannot be copied into this document.
          </p>
        </div>

        <div
          className="mb-6 rounded-lg border border-line bg-surface-sunken px-4 py-3 text-sm text-ink-secondary"
          role="note"
        >
          Write the outcome in your own words. There is no import from the room; anything said in
          dialogue stays in the room unless you deliberately summarise it here.
        </div>

        {loading ? (
          <p className="text-sm text-ink-secondary">Loading draft…</p>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">
                Outcome summary <span aria-hidden>*</span>
              </label>
              <textarea
                required
                rows={4}
                value={form.summary}
                onChange={(e) => set('summary', e.target.value)}
                className="w-full rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">
                Agreed terms
              </label>
              <textarea
                rows={5}
                value={form.agreedTerms}
                onChange={(e) => set('agreedTerms', e.target.value)}
                className="w-full rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">
                Pending items
              </label>
              <textarea
                rows={3}
                value={form.pendingItems}
                onChange={(e) => set('pendingItems', e.target.value)}
                className="w-full rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-secondary">
                Facilitator notes (never published)
              </label>
              <textarea
                rows={3}
                value={form.facilitatorNotes}
                onChange={(e) => set('facilitatorNotes', e.target.value)}
                className="w-full rounded border border-line bg-surface px-3 py-2.5 text-sm text-ink"
              />
            </div>
            {error ? (
              <p className="text-sm text-sem-danger" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveDraft()}
                className="flex-1 rounded border border-line py-3 text-sm font-medium text-ink"
              >
                Save draft
              </button>
              <button
                type="button"
                disabled={saving || !form.summary.trim()}
                onClick={() => void handleSubmitForRelease()}
                className="flex-1 btn-pill btn-pill--primary text-sm"
              >
                Submit for release
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedShell>
  );
}
