import { useNavigate } from 'react-router-dom';
import { FormPanel } from '../../../components/ui/FormPanel';
import { DialogueStageMap } from '../../../components/session/DialogueStageMap';
import { RouteSkeleton } from '../../../components/system/RouteSkeleton';
import { TokenShell } from '../../../components/layout/TokenShell';
import { useParticipantToken } from '../../../hooks/useParticipantToken';
import { useParticipantSession } from '../../../hooks/useParticipantSession';
import { parseDialogueStage, participantNextActionHint } from '../../../lib/dialogueStages';
import { participantRoute } from '../../../lib/participantRoutes';
import { MAX_ROOM_PARTICIPANTS } from '../../../lib/roomCapacity';

const groundRules = [
  'All contributions within the room are confidential to participants.',
  'Speak from your own perspective. Avoid attributing views to others.',
  'The facilitator may pause the dialogue at any time to maintain process integrity.',
  'If tension rises, use Slow down. The facilitator may ask the room to Pull back or pause.',
  'If you need to withdraw, do so quietly. You are not required to explain.',
  'No recording, screenshotting, or note-sharing outside the session without facilitator approval.',
];

export function SessionBriefingPage() {
  const token = useParticipantToken();
  const navigate = useNavigate();
  const { ctx, loading } = useParticipantSession(token ?? '');

  function enter() {
    if (!token) return;
    navigate(participantRoute('waiting', token));
  }

  if (!token) return null;

  if (loading) {
    return (
      <TokenShell>
        <RouteSkeleton label="Loading briefing" />
      </TokenShell>
    );
  }

  if (ctx && ctx.valid === false) {
    return (
      <TokenShell>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
          <h1 className="mb-3 text-2xl font-semibold tracking-tight text-ink">Link unavailable</h1>
          <p className="max-w-sm text-sm text-ink-secondary">
            This briefing link is invalid or expired. Ask your facilitator for a fresh invite.
          </p>
        </div>
      </TokenShell>
    );
  }

  const title = ctx?.session_title ?? 'Protected dialogue session';
  const language = ctx?.session_language ?? '—';
  const conflictType = ctx?.conflict_type ?? '—';
  const maxParticipants = ctx?.max_participants ?? MAX_ROOM_PARTICIPANTS;
  const dialogueStage = parseDialogueStage(ctx?.dialogue_stage);
  const nextAction = participantNextActionHint(dialogueStage, {
    sessionStatus: ctx?.session_status,
    verificationStatus: ctx?.verification_status,
    roomReady: false,
  });
  const outcome =
    ctx?.outcome_public === false
      ? 'Private anchored record'
      : ctx?.outcome_public
        ? 'Approved public record (optional publish)'
        : 'Facilitator-approved outcome';

  return (
    <TokenShell>
      <div className="sr-form-atmosphere flex flex-1 flex-col items-center justify-center px-6 py-16">
        <FormPanel
          className="w-full max-w-xl"
          eyebrow="Session briefing"
          title={title}
          titleAs="h1"
          description="You are about to enter a protected written dialogue. Read the details below before proceeding."
        >
          <div className="mb-6 rounded-lg bg-surface-elevated p-4 shadow-sr-sm">
            <DialogueStageMap current={dialogueStage} compact />
            <p className="mt-3 text-xs leading-relaxed text-ink-secondary">
              <span className="font-medium text-ink">Next: </span>
              {nextAction} After this briefing, enter the waiting room.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            {[
              { label: 'Matter type', value: conflictType },
              { label: 'Language', value: language },
              { label: 'Max participants', value: String(maxParticipants) },
              { label: 'Outcome', value: outcome },
              { label: 'Your codename', value: ctx?.codename ?? '—' },
              {
                label: 'Your reason',
                value: ctx?.participation_reason?.trim() || 'Provided at invitation accept',
              },
              {
                label: 'Issue goal',
                value: ctx?.issue_goal?.trim() || 'Shared by facilitator at configure',
              },
              {
                label: 'Disclosure boundaries',
                value:
                  ctx?.disclosure_boundaries?.trim() ||
                  'Room dialogue stays private; only approved text may leave',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[var(--sr-radius-md)] bg-surface-elevated p-4 shadow-sr-sm"
              >
                <p className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-ink">{item.value}</p>
              </div>
            ))}
          </div>

          <section className="mb-8 rounded-[var(--sr-radius-lg)] bg-surface-elevated p-5 shadow-sr-card">
            <h2 className="mb-3 text-sm font-semibold text-ink">Ground rules</h2>
            <ul className="space-y-2">
              {groundRules.map((rule) => (
                <li key={rule} className="flex gap-2 text-sm leading-relaxed text-ink-secondary">
                  <span className="text-brand" aria-hidden>
                    ·
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            onClick={enter}
            className="btn-institutional btn-institutional--primary w-full"
          >
            Enter waiting room
          </button>
          <p className="mt-4 text-center text-xs text-ink-faint">
            Private room · Only the approved outcome may be published
          </p>
        </FormPanel>
      </div>
    </TokenShell>
  );
}
