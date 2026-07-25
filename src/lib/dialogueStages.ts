/**
 * v2 Facilitated dialogue stages (inside Facilitate).
 * Lifecycle status remains Configure→Verify→Facilitate→Release (setup/live/ended/released).
 * These stages structure the room; they do not replace outcome approval/release.
 *
 * Maps to restorative / RSD-style phase language in
 * docs/product/institutional-credibility-research.md §6.
 */

export const DIALOGUE_STAGES = [
  'preparation',
  'opening',
  'story',
  'framing',
  'options',
  'review',
  'outcome_ready',
] as const;

export type DialogueStage = (typeof DIALOGUE_STAGES)[number];

export interface DialogueStageConfig {
  id: DialogueStage;
  label: string;
  /** Short facilitator-facing instruction */
  facilitatorPrompt: string;
  /** Short participant-facing instruction */
  participantPrompt: string;
  /** Manual workflow name this maps to */
  manualName: string;
  /** Participants may post staged contributions */
  allowParticipantPost: boolean;
}

export const DIALOGUE_STAGE_CONFIGS: Record<DialogueStage, DialogueStageConfig> = {
  preparation: {
    id: 'preparation',
    label: 'Preparation',
    manualName: 'Preparation',
    facilitatorPrompt: 'Confirm readiness, ground rules, and the issue brief before opening.',
    participantPrompt: 'The facilitator is preparing the room. Posting opens in later stages.',
    allowParticipantPost: false,
  },
  opening: {
    id: 'opening',
    label: 'Opening',
    manualName: 'Opening',
    facilitatorPrompt: 'State purpose, process, and consent boundaries. Invite calm presence.',
    participantPrompt:
      'Listen to the opening. The facilitator sets the frame before contributions.',
    allowParticipantPost: false,
  },
  story: {
    id: 'story',
    label: 'Story',
    manualName: 'Story / perspective',
    facilitatorPrompt: 'Invite each party to share their perspective — one contribution at a time.',
    participantPrompt: 'Share your perspective on the matter. Draft carefully before sending.',
    allowParticipantPost: true,
  },
  framing: {
    id: 'framing',
    label: 'Framing',
    manualName: 'Framing / synthesis',
    facilitatorPrompt: 'Synthesize themes. Name shared concerns without attributing blame.',
    participantPrompt: 'Respond to the frame. Clarify what was missed — avoid attacking people.',
    allowParticipantPost: true,
  },
  options: {
    id: 'options',
    label: 'Options',
    manualName: 'Option generation',
    facilitatorPrompt: 'Generate workable options. Prefer concrete next steps over positions.',
    participantPrompt: 'Propose options the room could live with. Keep them specific and testable.',
    allowParticipantPost: true,
  },
  review: {
    id: 'review',
    label: 'Review',
    manualName: 'Review / agreement',
    facilitatorPrompt: 'Test agreement language in-room before drafting the releasable instrument.',
    participantPrompt: 'Check the emerging agreement. Flag gaps now — before the release gate.',
    allowParticipantPost: true,
  },
  outcome_ready: {
    id: 'outcome_ready',
    label: 'Outcome',
    manualName: 'Outcome release',
    facilitatorPrompt: 'Room posting is closed. Draft the outcome and open participant review.',
    participantPrompt:
      'Room dialogue is closed. When review opens, you will verify the draft outcome.',
    allowParticipantPost: false,
  },
};

/** Product spine labels (session lifecycle) — not dialogue stages. */
export const PRODUCT_SPINE = ['Configure', 'Verify', 'Facilitate', 'Release'] as const;

export function isDialogueStage(value: string | null | undefined): value is DialogueStage {
  return Boolean(value && (DIALOGUE_STAGES as readonly string[]).includes(value));
}

export function parseDialogueStage(value: string | null | undefined): DialogueStage {
  return isDialogueStage(value) ? value : 'preparation';
}

export function dialogueStageIndex(stage: DialogueStage): number {
  return DIALOGUE_STAGES.indexOf(stage);
}

export function nextDialogueStage(stage: DialogueStage): DialogueStage | null {
  const i = dialogueStageIndex(stage);
  if (i < 0 || i >= DIALOGUE_STAGES.length - 1) return null;
  return DIALOGUE_STAGES[i + 1] ?? null;
}

export function previousDialogueStage(stage: DialogueStage): DialogueStage | null {
  const i = dialogueStageIndex(stage);
  if (i <= 0) return null;
  return DIALOGUE_STAGES[i - 1] ?? null;
}

export function stageAllowsParticipantPost(stage: DialogueStage): boolean {
  return DIALOGUE_STAGE_CONFIGS[stage].allowParticipantPost;
}

/** Map lifecycle status + dialogue stage onto the Configure→Verify→Facilitate→Release spine. */
export function spinePhaseForSession(input: {
  status: string;
  dialogueStage?: DialogueStage;
}): (typeof PRODUCT_SPINE)[number] {
  if (input.status === 'released') return 'Release';
  if (input.status === 'ended' || input.dialogueStage === 'outcome_ready') return 'Release';
  if (input.status === 'setup') return 'Configure';
  if (input.status === 'open') return 'Verify';
  return 'Facilitate';
}
