import { useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

type DraftStatus = 'drafting' | 'in-review' | 'approved' | 'released';

type Approver = {
  id: string;
  name: string;
  role: string;
  status: 'pending' | 'approved' | 'declined';
  respondedAt?: string;
};

type Version = { version: number; savedAt: string; preview: string };

const mockApprovers: Approver[] = [
  { id: 'a1', name: 'Amara Nwosu',    role: 'Lead Participant',    status: 'approved', respondedAt: 'Jun 18, 10:42 AM' },
  { id: 'a2', name: 'Jonas Berglund', role: 'Participant',         status: 'pending' },
  { id: 'a3', name: 'Priya Chandran', role: 'Observer — Inst.',    status: 'pending' },
  { id: 'a4', name: 'Leila Ahmadi',   role: 'Participant',         status: 'declined', respondedAt: 'Jun 18, 11:04 AM' },
];

const initialDraft = `JOINT STATEMENT OF PRINCIPLES
Northern Watershed Consultation — June 18, 2024

The undersigned parties, having participated in a facilitated dialogue convened under the MENDguild platform, hereby record the following agreed principles:

1. All future land-use consultations in the northern watershed region will include representation from riparian communities prior to any planning application approval.

2. An independent technical review panel will be established within 90 days to assess the environmental impact baseline data presented during this consultation.

3. The parties commit to a follow-up session within six months to review implementation progress against these principles.

This statement was produced through a structured facilitated process. The deliberations that produced this text remain confidential to participants.`;

export function OutcomeDraftingPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId') ?? 'sess-001';

  const [draftStatus, setDraftStatus] = useState<DraftStatus>('drafting');
  const [draftText, setDraftText] = useState(initialDraft);
  const [savedText, setSavedText] = useState(initialDraft);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [approvers, setApprovers] = useState<Approver[]>(mockApprovers);
  const [versions] = useState<Version[]>([
    { version: 1, savedAt: 'Jun 18, 9:15 AM',  preview: 'Initial draft from session notes.' },
    { version: 2, savedAt: 'Jun 18, 10:30 AM', preview: 'Revised principle #2 after facilitator note.' },
  ]);
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [released, setReleased] = useState(false);
  const [activeTab, setActiveTab] = useState<'draft' | 'approvals' | 'history'>('draft');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDirty = draftText !== savedText;

  function saveDraft() {
    setSaving(true);
    setTimeout(() => {
      setSavedText(draftText);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  }

  function sendForReview() {
    saveDraft();
    setDraftStatus('in-review');
  }

  function releaseToLedger() {
    setDraftStatus('released');
    setReleased(true);
    setConfirmRelease(false);
  }

  const allApproved = approvers.every((a) => a.status === 'approved');
  const approvedCount = approvers.filter((a) => a.status === 'approved').length;

  const statusBadgeVariant: Record<DraftStatus, 'draft' | 'pending' | 'approved' | 'released'> = {
    drafting:   'draft',
    'in-review': 'pending',
    approved:   'approved',
    released:   'released',
  };

  const tabStyles = (active: boolean) => ({
    borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
    color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
    fontWeight: active ? '500' : '400',
  });

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-4">
          <div>
            <h1
              className="text-base font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Outcome Drafting
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Northern Watershed Consultation &middot; Session {sessionId}
            </p>
          </div>
          <StatusBadge variant={statusBadgeVariant[draftStatus]}>
            {draftStatus === 'drafting' ? 'Drafting'
              : draftStatus === 'in-review' ? 'In Review'
              : draftStatus === 'approved' ? 'Approved'
              : 'Released'}
          </StatusBadge>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && !released && (
            <button
              onClick={saveDraft}
              disabled={saving}
              className="rounded border px-4 py-2 text-sm transition-opacity hover:opacity-70 disabled:opacity-50"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Draft'}
            </button>
          )}
          {draftStatus === 'drafting' && !released && (
            <button
              onClick={sendForReview}
              className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Send for Approval
            </button>
          )}
          {draftStatus === 'in-review' && allApproved && !released && (
            <button
              onClick={() => setConfirmRelease(true)}
              className="rounded px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-success)' }}
            >
              Release to Ledger
            </button>
          )}
          {released && (
            <Link
              to="/ledger/demo-proposal-001"
              className="text-sm font-medium underline transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-accent)' }}
            >
              View Public Record →
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex border-b"
        role="tablist"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        {(['draft', 'approvals', 'history'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className="px-6 py-3 text-sm capitalize transition-colors"
            style={tabStyles(activeTab === tab)}
          >
            {tab === 'approvals' ? `Approvals (${approvedCount}/${approvers.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* Draft tab */}
        {activeTab === 'draft' && (
          <div className="flex h-full flex-col px-6 py-6">
            {released ? (
              <div
                className="rounded-lg border p-8"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-ledger-bg)',
                }}
              >
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-success)' }}
                >
                  Released to Public Ledger
                </p>
                <pre
                  className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}
                >
                  {savedText}
                </pre>
              </div>
            ) : (
              <>
                <p className="mb-3 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {draftStatus === 'in-review'
                    ? 'This draft is with approvers. Edit to create a new revision, then resend for review.'
                    : 'Write the outcome document. Only approved text will be published.'}
                </p>
                <textarea
                  ref={textareaRef}
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  className="flex-1 rounded border p-6 font-mono text-sm leading-relaxed outline-none transition-colors"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono)',
                    resize: 'none',
                    minHeight: '400px',
                  }}
                  aria-label="Outcome document draft"
                />
                <p className="mt-2 text-right text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {draftText.length} characters &middot; {draftText.split('\n').filter(Boolean).length} lines
                </p>
              </>
            )}
          </div>
        )}

        {/* Approvals tab */}
        {activeTab === 'approvals' && (
          <div className="px-6 py-6">
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {draftStatus === 'drafting'
                ? 'Approvers will be notified once you send the draft for review.'
                : `${approvedCount} of ${approvers.length} approvers have responded.`}
            </p>
            <div
              className="overflow-hidden rounded-lg border"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                    {['Name', 'Role', 'Status', 'Responded'].map((h) => (
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
                  {approvers.map((a) => (
                    <tr key={a.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--color-text-primary)' }}>{a.name}</td>
                      <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{a.role}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge variant={a.status === 'approved' ? 'approved' : a.status === 'declined' ? 'declined' : 'pending'}>
                          {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                        </StatusBadge>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {a.respondedAt ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {draftStatus === 'in-review' && !allApproved && (
              <p className="mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Waiting for {approvers.filter((a) => a.status === 'pending').length} more approval{approvers.filter((a) => a.status === 'pending').length !== 1 ? 's' : ''} before release is available.
              </p>
            )}
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div className="px-6 py-6">
            <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Every saved version is recorded. Only the released version is public.
            </p>
            <ol className="flex flex-col gap-4">
              {[...versions].reverse().map((v) => (
                <li
                  key={v.version}
                  className="flex items-start justify-between gap-4 rounded-lg border p-5"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <div>
                    <p
                      className="mb-1 text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      Version {v.version}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {v.savedAt} &middot; {v.preview}
                    </p>
                  </div>
                  <button
                    className="shrink-0 text-xs underline transition-opacity hover:opacity-70"
                    style={{ color: 'var(--color-accent)' }}
                    onClick={() => {
                      setDraftText(initialDraft);
                      setActiveTab('draft');
                    }}
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Confirm release modal */}
      {confirmRelease && (
        <ConfirmModal
          title="Release this outcome to the public ledger?"
          body="Once released, this document will be publicly visible with a verification anchor. The session itself remains private. This action cannot be undone."
          confirmLabel="Release to Ledger"
          cancelLabel="Not Yet"
          onConfirm={releaseToLedger}
          onCancel={() => setConfirmRelease(false)}
        />
      )}
    </div>
  );
}
