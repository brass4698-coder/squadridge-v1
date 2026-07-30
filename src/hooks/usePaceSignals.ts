import { useCallback, useRef, useState } from 'react';
import {
  clearSuggestion,
  createPaceSignalState,
  dismissSuggestion,
  recordComposerInput,
  recordRetract,
  recordSend,
  type PaceSignalState,
  type PaceSuggestion,
} from '../lib/pacing/paceSignals';

/**
 * React wrapper around local pace-signal state.
 * Never reads message meaning — only behavioral metadata.
 */
export function usePaceSignals() {
  const stateRef = useRef<PaceSignalState>(createPaceSignalState());
  const [suggestion, setSuggestion] = useState<PaceSuggestion | null>(null);

  const onSend = useCallback(() => {
    const next = recordSend(stateRef.current);
    setSuggestion(next);
    return next;
  }, []);

  const onComposerChange = useCallback((nextValue: string, prevValue: string) => {
    const next = recordComposerInput(stateRef.current, nextValue, prevValue);
    if (next) setSuggestion(next);
    return next;
  }, []);

  const onRetract = useCallback(() => {
    const next = recordRetract(stateRef.current);
    setSuggestion(next);
    return next;
  }, []);

  const dismiss = useCallback(() => {
    dismissSuggestion(stateRef.current);
    setSuggestion(null);
  }, []);

  const clear = useCallback(() => {
    clearSuggestion(stateRef.current);
    setSuggestion(null);
  }, []);

  return {
    suggestion,
    onSend,
    onComposerChange,
    onRetract,
    dismiss,
    clear,
  };
}
