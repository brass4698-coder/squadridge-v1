/**
 * Local pacing signals — privacy-preserving behavioral cues only.
 * Never inspects message body content for scoring or storage.
 */

export type PaceSignalKind = 'rapid_send' | 'composer_thrash' | 'repeated_retract' | 'manual';

export type PaceSuggestion = {
  kind: PaceSignalKind;
  /** Soft chip copy — never shaming */
  prompt: string;
  at: number;
};

const RAPID_SEND_WINDOW_MS = 20_000;
const RAPID_SEND_THRESHOLD = 4;
const THRASH_DELETE_RATIO = 0.55;
const THRASH_MIN_KEYSTROKES = 24;
const RETRACT_WINDOW_MS = 120_000;
const RETRACT_THRESHOLD = 2;

export type PaceSignalState = {
  sendTimestamps: number[];
  keystrokes: number;
  deletes: number;
  retractTimestamps: number[];
  lastSuggestion: PaceSuggestion | null;
  dismissedUntil: number;
};

export function createPaceSignalState(): PaceSignalState {
  return {
    sendTimestamps: [],
    keystrokes: 0,
    deletes: 0,
    retractTimestamps: [],
    lastSuggestion: null,
    dismissedUntil: 0,
  };
}

function canSuggest(state: PaceSignalState, now: number): boolean {
  return now >= state.dismissedUntil;
}

export function recordSend(state: PaceSignalState, now = Date.now()): PaceSuggestion | null {
  const recent = state.sendTimestamps.filter((t) => now - t < RAPID_SEND_WINDOW_MS);
  recent.push(now);
  state.sendTimestamps = recent;
  state.keystrokes = 0;
  state.deletes = 0;

  if (!canSuggest(state, now)) return null;
  if (recent.length >= RAPID_SEND_THRESHOLD) {
    const suggestion: PaceSuggestion = {
      kind: 'rapid_send',
      prompt: 'You are sending quickly. A short pause can help — take a Slow down when ready.',
      at: now,
    };
    state.lastSuggestion = suggestion;
    return suggestion;
  }
  return null;
}

export function recordComposerInput(
  state: PaceSignalState,
  nextValue: string,
  prevValue: string,
  now = Date.now(),
): PaceSuggestion | null {
  const delta = nextValue.length - prevValue.length;
  if (delta > 0) state.keystrokes += delta;
  if (delta < 0) state.deletes += -delta;

  if (!canSuggest(state, now)) return null;
  if (
    state.keystrokes >= THRASH_MIN_KEYSTROKES &&
    state.deletes / state.keystrokes >= THRASH_DELETE_RATIO
  ) {
    const suggestion: PaceSuggestion = {
      kind: 'composer_thrash',
      prompt: 'Take a breath? Slow down clears the draft and gives you a short cooldown.',
      at: now,
    };
    state.lastSuggestion = suggestion;
    return suggestion;
  }
  return null;
}

export function recordRetract(state: PaceSignalState, now = Date.now()): PaceSuggestion | null {
  const recent = state.retractTimestamps.filter((t) => now - t < RETRACT_WINDOW_MS);
  recent.push(now);
  state.retractTimestamps = recent;

  if (!canSuggest(state, now)) return null;
  if (recent.length >= RETRACT_THRESHOLD) {
    const suggestion: PaceSuggestion = {
      kind: 'repeated_retract',
      prompt: 'You have pulled back more than once. A Slow down may help before the next send.',
      at: now,
    };
    state.lastSuggestion = suggestion;
    return suggestion;
  }
  return null;
}

export function dismissSuggestion(state: PaceSignalState, now = Date.now(), coolMs = 60_000): void {
  state.dismissedUntil = now + coolMs;
  state.lastSuggestion = null;
}

export function clearSuggestion(state: PaceSignalState): void {
  state.lastSuggestion = null;
}
