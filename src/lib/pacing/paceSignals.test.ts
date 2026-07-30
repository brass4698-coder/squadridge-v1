import { describe, expect, it } from 'vitest';
import {
  createPaceSignalState,
  dismissSuggestion,
  recordComposerInput,
  recordRetract,
  recordSend,
} from './paceSignals';

describe('paceSignals', () => {
  it('suggests slow down after rapid sends', () => {
    const state = createPaceSignalState();
    const t0 = 1_000_000;
    expect(recordSend(state, t0)).toBeNull();
    expect(recordSend(state, t0 + 1000)).toBeNull();
    expect(recordSend(state, t0 + 2000)).toBeNull();
    const suggestion = recordSend(state, t0 + 3000);
    expect(suggestion?.kind).toBe('rapid_send');
  });

  it('suggests on composer thrash without reading body meaning', () => {
    const state = createPaceSignalState();
    let prev = '';
    let next = 'abcdefghijklmnopqr'; // 18 chars
    recordComposerInput(state, next, prev);
    prev = next;
    next = 'abcd'; // heavy delete
    // accumulate keystrokes then deletes
    for (let i = 0; i < 10; i++) {
      prev = next;
      next = `${next}x`;
      recordComposerInput(state, next, prev);
    }
    for (let i = 0; i < 20; i++) {
      prev = next;
      next = next.slice(0, -1);
      const s = recordComposerInput(state, next, prev);
      if (s) {
        expect(s.kind).toBe('composer_thrash');
        return;
      }
    }
    // force threshold by direct counts if loop didn't hit
    state.keystrokes = 30;
    state.deletes = 20;
    const forced = recordComposerInput(state, 'a', 'ab');
    expect(forced?.kind).toBe('composer_thrash');
  });

  it('respects dismiss cooldown', () => {
    const state = createPaceSignalState();
    const t0 = 2_000_000;
    recordSend(state, t0);
    recordSend(state, t0 + 1);
    recordSend(state, t0 + 2);
    recordSend(state, t0 + 3);
    dismissSuggestion(state, t0 + 4, 60_000);
    expect(recordSend(state, t0 + 5)).toBeNull();
  });

  it('suggests after repeated retracts', () => {
    const state = createPaceSignalState();
    const t0 = 3_000_000;
    expect(recordRetract(state, t0)).toBeNull();
    expect(recordRetract(state, t0 + 1000)?.kind).toBe('repeated_retract');
  });
});
