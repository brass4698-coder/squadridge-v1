import { describe, expect, it } from 'vitest';
import {
  DIALOGUE_STAGES,
  nextDialogueStage,
  parseDialogueStage,
  previousDialogueStage,
  spinePhaseForSession,
  stageAllowsParticipantPost,
} from '../lib/dialogueStages';

describe('dialogueStages', () => {
  it('orders preparation through outcome_ready without inventing a parallel spine', () => {
    expect(DIALOGUE_STAGES[0]).toBe('preparation');
    expect(DIALOGUE_STAGES[DIALOGUE_STAGES.length - 1]).toBe('outcome_ready');
    expect(nextDialogueStage('story')).toBe('framing');
    expect(previousDialogueStage('framing')).toBe('story');
    expect(nextDialogueStage('outcome_ready')).toBeNull();
  });

  it('gates participant posting to contribution stages only', () => {
    expect(stageAllowsParticipantPost('preparation')).toBe(false);
    expect(stageAllowsParticipantPost('opening')).toBe(false);
    expect(stageAllowsParticipantPost('story')).toBe(true);
    expect(stageAllowsParticipantPost('options')).toBe(true);
    expect(stageAllowsParticipantPost('outcome_ready')).toBe(false);
  });

  it('maps lifecycle onto Configure → Verify → Facilitate → Release', () => {
    expect(spinePhaseForSession({ status: 'setup' })).toBe('Configure');
    expect(spinePhaseForSession({ status: 'open' })).toBe('Verify');
    expect(spinePhaseForSession({ status: 'live', dialogueStage: 'story' })).toBe('Facilitate');
    expect(spinePhaseForSession({ status: 'ended' })).toBe('Release');
    expect(spinePhaseForSession({ status: 'live', dialogueStage: 'outcome_ready' })).toBe(
      'Release',
    );
  });

  it('falls back safely for unknown stage strings', () => {
    expect(parseDialogueStage('nope')).toBe('preparation');
    expect(parseDialogueStage('review')).toBe('review');
  });
});
