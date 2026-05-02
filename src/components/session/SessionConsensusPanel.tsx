import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  useCastLedgerVote,
  useCreateLedgerDraft,
  useIsModerator,
  useLedgerProposalVoteSummary,
  useMyLedgerVote,
  usePublishLedgerProposal,
  useSquadDraftProposal,
} from '../../hooks';
import type { LedgerProposalVote } from '../../lib';

/**
 * In-room consensus panel — turns the discussion into a citable ledger record.
 *
 * Lifecycle:
 *   1. Any squad member drafts a proposal (1-5 consensus bullets, optional tags).
 *      Insert is allowed by `ledger_proposals_member_draft_insert` RLS.
 *   2. Squad members vote `approve` / `reject` / `abstain` via
 *      `ledger_proposal_votes`. The unique `(proposal_id, user_id)` index
 *      converts a re-vote into an upsert.
 *   3. A moderator triggers `publish-ledger-proposal` Edge Function once the
 *      participation + approval threshold is met.
 *
 * The panel intentionally hides the publish button from non-moderators so the
 * UX stays honest about who can flip a proposal to public.
 */
export function SessionConsensusPanel({
  squadId,
  archived,
}: {
  squadId: string;
  archived: boolean;
}) {
  const draftQ = useSquadDraftProposal(squadId);
  const draft = draftQ.data ?? null;
  const summaryQ = useLedgerProposalVoteSummary(draft?.id);
  const myVoteQ = useMyLedgerVote(draft?.id);
  const createDraft = useCreateLedgerDraft();
  const castVote = useCastLedgerVote();
  const publish = usePublishLedgerProposal();
  const { data: isMod = false } = useIsModerator();

  if (archived) return null;

  return (
    <section
      aria-labelledby="session-consensus-heading"
      className="rounded-[10px] border border-line bg-[#0c1219] px-4 py-4 sm:px-5 sm:py-5"
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2
          id="session-consensus-heading"
          className="font-heading text-[0.95rem] font-semibold text-ink"
        >
          Consensus record
        </h2>
        <p className="text-[0.78rem] text-[#94a3b8]">
          Draft a public outcome together. Nothing publishes until the squad votes and a moderator
          approves.
        </p>
      </header>

      <div className="mt-4">
        {draft ? (
          <ProposalView
            squadId={squadId}
            proposalId={draft.id}
            title={draft.title}
            summary={draft.summary}
            consensusItems={(draft.consensus_items as unknown as string[]) ?? []}
            tags={draft.tags ?? []}
            voteSummary={
              summaryQ.data
                ? {
                    approve: summaryQ.data.approve_count,
                    reject: summaryQ.data.reject_count,
                    abstain: summaryQ.data.abstain_count,
                    eligible: summaryQ.data.total_eligible,
                  }
                : null
            }
            myVote={myVoteQ.data?.vote ?? null}
            isMod={isMod}
            castVote={async (v) => {
              try {
                await castVote.mutateAsync({ proposalId: draft.id, squadId, vote: v });
                toast.success('Vote recorded.');
              } catch (e) {
                toast.error(
                  e instanceof Error ? e.message : 'Could not record your vote — try again.',
                );
              }
            }}
            publish={async () => {
              const result = await publish.mutateAsync(draft.id);
              if (result.ok) {
                toast.success('Outcome published to the ledger.');
                return;
              }
              switch (result.error_code) {
                case 'forbidden':
                  toast.error('Only a moderator can publish.');
                  break;
                case 'unauthorized':
                  toast.error('Sign in again to publish.');
                  break;
                case 'insufficient_participation':
                  toast.error(
                    'Not enough votes yet. At least two-thirds of the squad must vote first.',
                  );
                  break;
                case 'majority_not_approve':
                  toast.error('Majority did not approve. Revise the draft and re-poll.');
                  break;
                default:
                  toast.error('Could not publish — try again.');
              }
            }}
            castVoteBusy={castVote.isPending}
            publishBusy={publish.isPending}
          />
        ) : (
          <DraftForm
            busy={createDraft.isPending}
            onSubmit={async (input) => {
              try {
                await createDraft.mutateAsync({ squadId, ...input });
                toast.success('Draft posted. Squad can now vote.');
              } catch (e) {
                toast.error(
                  e instanceof Error ? e.message : 'Could not save the draft — try again.',
                );
              }
            }}
          />
        )}
      </div>
    </section>
  );
}

function DraftForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (input: {
    title: string;
    summary: string;
    consensusItems: string[];
    tags: string[];
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');
  const [item3, setItem3] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const items = useMemo(
    () => [item1, item2, item3].map((s) => s.trim()).filter(Boolean),
    [item1, item2, item3],
  );
  const titleOk = title.trim().length >= 6;
  const summaryOk = summary.trim().length >= 20;
  const itemsOk = items.length >= 1;
  const canSubmit = titleOk && summaryOk && itemsOk && !busy;

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        const tags = tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        void onSubmit({
          title: title.trim(),
          summary: summary.trim(),
          consensusItems: items,
          tags,
        });
      }}
    >
      <label className="block">
        <span className="block font-sans text-[0.78rem] font-medium text-[#94a3b8]">
          Outcome title
        </span>
        <input
          type="text"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Civilian protection protocols — corridor X"
          className="mt-1 block w-full rounded-md border border-[#1f2940] bg-[#070b13] px-3 py-2 font-sans text-[0.875rem] text-ink placeholder:text-[#475569] focus:border-teal/60 focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="block font-sans text-[0.78rem] font-medium text-[#94a3b8]">Summary</span>
        <textarea
          value={summary}
          maxLength={400}
          rows={2}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="One paragraph that a third party could cite."
          className="mt-1 block w-full resize-y rounded-md border border-[#1f2940] bg-[#070b13] px-3 py-2 font-sans text-[0.875rem] text-ink placeholder:text-[#475569] focus:border-teal/60 focus:outline-none"
        />
      </label>
      <fieldset className="space-y-2">
        <legend className="font-sans text-[0.78rem] font-medium text-[#94a3b8]">
          Consensus bullets (1-3)
        </legend>
        {[item1, item2, item3].map((value, idx) => (
          <input
            key={idx}
            type="text"
            value={value}
            maxLength={240}
            onChange={(e) => {
              const v = e.target.value;
              if (idx === 0) setItem1(v);
              if (idx === 1) setItem2(v);
              if (idx === 2) setItem3(v);
            }}
            placeholder={`Bullet ${idx + 1}`}
            className="block w-full rounded-md border border-[#1f2940] bg-[#070b13] px-3 py-2 font-sans text-[0.875rem] text-ink placeholder:text-[#475569] focus:border-teal/60 focus:outline-none"
          />
        ))}
      </fieldset>
      <label className="block">
        <span className="block font-sans text-[0.78rem] font-medium text-[#94a3b8]">
          Tags (comma-separated, optional)
        </span>
        <input
          type="text"
          value={tagsInput}
          maxLength={140}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. Climate, Displacement"
          className="mt-1 block w-full rounded-md border border-[#1f2940] bg-[#070b13] px-3 py-2 font-sans text-[0.875rem] text-ink placeholder:text-[#475569] focus:border-teal/60 focus:outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-teal/35 bg-teal/15 px-4 py-2 font-heading text-[0.85rem] font-semibold text-teal-light transition-colors hover:border-teal/55 hover:bg-teal/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Posting…' : 'Post draft'}
      </button>
    </form>
  );
}

function ProposalView({
  squadId: _squadId,
  proposalId: _proposalId,
  title,
  summary,
  consensusItems,
  tags,
  voteSummary,
  myVote,
  isMod,
  castVote,
  publish,
  castVoteBusy,
  publishBusy,
}: {
  squadId: string;
  proposalId: string;
  title: string;
  summary: string;
  consensusItems: string[];
  tags: string[];
  voteSummary: { approve: number; reject: number; abstain: number; eligible: number } | null;
  myVote: LedgerProposalVote | null;
  isMod: boolean;
  castVote: (v: LedgerProposalVote) => Promise<void>;
  publish: () => Promise<void>;
  castVoteBusy: boolean;
  publishBusy: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-heading text-[0.95rem] font-semibold text-ink">{title}</h3>
        <p className="mt-1 font-sans text-[0.85rem] leading-relaxed text-ink-secondary">
          {summary}
        </p>
        {consensusItems.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 font-sans text-[0.85rem] text-[#cbd5e1] marker:text-slate-600">
            {consensusItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : null}
        {tags.length ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-[#1f2940] bg-surface-elevated px-2 py-0.5 font-mono text-[0.7rem] text-[#94a3b8]"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <fieldset className="rounded-md border border-line bg-[#070b13] px-3 py-3">
        <legend className="px-1 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
          Your vote
        </legend>
        <div className="flex flex-wrap gap-2">
          {(['approve', 'reject', 'abstain'] as const).map((v) => (
            <button
              key={v}
              type="button"
              disabled={castVoteBusy}
              onClick={() => void castVote(v)}
              className={`min-h-[44px] rounded-md border px-3 py-2 font-sans text-[0.8rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                myVote === v
                  ? 'border-teal/60 bg-teal/15 text-teal-light'
                  : 'border-[#1f2940] bg-[#0c1219] text-ink-secondary hover:border-teal/40 hover:text-ink'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-[#070b13] px-3 py-2.5">
        <p className="font-mono text-[0.78rem] text-[#94a3b8]">
          {voteSummary
            ? `Approve ${voteSummary.approve} · Reject ${voteSummary.reject} · Abstain ${voteSummary.abstain} (of ${voteSummary.eligible} eligible)`
            : 'Loading vote tally…'}
        </p>
        {isMod ? (
          <button
            type="button"
            onClick={() => void publish()}
            disabled={publishBusy}
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-teal/45 bg-teal/15 px-3 py-2 font-heading text-[0.8rem] font-semibold text-teal-light transition-colors hover:border-teal/65 hover:bg-teal/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishBusy ? 'Publishing…' : 'Publish to ledger'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
