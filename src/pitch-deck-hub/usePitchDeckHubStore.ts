import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { INITIAL_STATE, buildInitialReadiness } from './initialState';
import type {
  ConfidenceBadge,
  DeckStatus,
  FinancialAssumptions,
  FinancialScenario,
  MessagingLayer,
  PitchDeck,
  PitchDeckHubState,
} from './types';

const STORAGE_KEY = 'squadridge-pitch-deck-hub-v1';

function loadState(): PitchDeckHubState {
  if (typeof window === 'undefined') return INITIAL_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<PitchDeckHubState>;
    if (parsed.version !== INITIAL_STATE.version) {
      // Auto-export the stale state so no edits are silently lost before reset.
      try {
        const blob = new Blob([raw], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Sanitize version from localStorage — only allow safe filename characters.
        const safeVersion = String(parsed.version ?? 'unknown').replace(/[^a-zA-Z0-9.-]/g, '_');
        a.download = `squadridge-pitch-deck-hub-backup-v${safeVersion}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        /* best-effort — carry on with reset */
      }
      return INITIAL_STATE;
    }
    const deckDefaults = new Map(INITIAL_STATE.decks.map((d) => [d.id, d]));
    const decksRaw = parsed.decks?.length ? parsed.decks : INITIAL_STATE.decks;
    const decks = decksRaw.map((d) => {
      const seed = deckDefaults.get(d.id);
      return {
        ...seed,
        ...d,
        narrativeEmphasis: d.narrativeEmphasis ?? seed?.narrativeEmphasis ?? '',
      } as PitchDeck;
    });
    const knownReady = new Set((parsed.readiness ?? []).map((r) => r.deckId));
    const extraReadiness = buildInitialReadiness(decks.filter((d) => !knownReady.has(d.id)));
    return {
      ...INITIAL_STATE,
      ...parsed,
      version: INITIAL_STATE.version,
      decks,
      messaging: { ...INITIAL_STATE.messaging, ...parsed.messaging },
      assumptions: { ...INITIAL_STATE.assumptions, ...parsed.assumptions },
      evidence: parsed.evidence?.length ? parsed.evidence : INITIAL_STATE.evidence,
      claims: parsed.claims?.length ? parsed.claims : INITIAL_STATE.claims,
      readiness: [...(parsed.readiness ?? []), ...extraReadiness],
    };
  } catch {
    return INITIAL_STATE;
  }
}

function saveState(state: PitchDeckHubState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function usePitchDeckHubStore() {
  const [state, setState] = useState<PitchDeckHubState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateMessaging = useCallback((partial: Partial<MessagingLayer>) => {
    setState((s) => ({ ...s, messaging: { ...s.messaging, ...partial } }));
  }, []);

  const updateAssumptions = useCallback((partial: Partial<FinancialAssumptions>) => {
    setState((s) => ({ ...s, assumptions: { ...s.assumptions, ...partial } }));
  }, []);

  const setActiveScenario = useCallback((sc: FinancialScenario) => {
    setState((s) => ({ ...s, activeScenario: sc }));
  }, []);

  const updateDeck = useCallback((id: string, partial: Partial<PitchDeck>) => {
    setState((s) => ({
      ...s,
      decks: s.decks.map((d) =>
        d.id === id ? { ...d, ...partial, lastUpdatedISO: new Date().toISOString() } : d,
      ),
    }));
  }, []);

  const duplicateDeck = useCallback((id: string) => {
    setState((s) => {
      const base = s.decks.find((d) => d.id === id);
      if (!base) return s;
      const newId = `${id}-copy-${Date.now()}`;
      const copy: PitchDeck = {
        ...base,
        id: newId,
        name: `${base.name} (copy)`,
        status: 'draft',
        lastUpdatedISO: new Date().toISOString(),
      };
      return {
        ...s,
        decks: [...s.decks, copy],
        readiness: [...s.readiness, buildInitialReadiness([copy])[0]],
      };
    });
    toast.success('Variant duplicated — update audience and outline.');
  }, []);

  const toggleReadiness = useCallback((deckId: string, itemId: string) => {
    setState((s) => ({
      ...s,
      readiness: s.readiness.map((r) =>
        r.deckId !== deckId
          ? r
          : {
              ...r,
              items: r.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)),
            },
      ),
    }));
  }, []);

  const markExternalReady = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      decks: s.decks.map((d) => {
        if (d.id !== id) return d;
        return {
          ...d,
          status: 'external_ready' as DeckStatus,
          // Only downgrade assumption_based → mixed; leave 'verified' and 'mixed' unchanged.
          confidence: d.confidence === 'assumption_based' ? 'mixed' : d.confidence,
          lastUpdatedISO: new Date().toISOString(),
        };
      }),
    }));
    toast.message('Marked external-ready — run checklist and consistency review first.');
  }, []);

  const resetHub = useCallback(() => {
    setState(INITIAL_STATE);
    toast.success('Hub reset to seeded structure.');
  }, []);

  const exportOutline = useCallback(() => {
    const text = state.decks
      .map((d) => {
        const weight = d.narrativeEmphasis ? `Story weight: ${d.narrativeEmphasis}\n\n` : '';
        return `## ${d.name}\n${weight}${d.sectionsOutline.map((x) => `- ${x}`).join('\n')}\n`;
      })
      .join('\n');
    void navigator.clipboard.writeText(text).then(() => {
      toast.success('Outline copied to clipboard.');
    });
  }, [state.decks]);

  const exportFullJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `squadridge-pitch-deck-hub-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Full hub state exported (JSON).');
  }, [state]);

  const meta = useMemo(() => {
    const lastReview = state.decks.reduce(
      (acc, d) => (d.lastUpdatedISO > acc ? d.lastUpdatedISO : acc),
      '',
    );
    const needsEvidence = state.evidence.filter(
      (e) => e.dataLabel === 'input_required' || !e.sourceUrl,
    ).length;
    const safeExternal = state.decks.filter((d) => d.status === 'external_ready').length;
    return { lastReview, needsEvidence, safeExternal };
  }, [state]);

  return {
    state,
    meta,
    updateMessaging,
    updateAssumptions,
    setActiveScenario,
    updateDeck,
    duplicateDeck,
    toggleReadiness,
    markExternalReady,
    resetHub,
    exportOutline,
    exportFullJson,
  };
}

export function labelForConfidence(c: ConfidenceBadge): string {
  switch (c) {
    case 'verified':
      return 'Verified';
    case 'assumption_based':
      return 'Assumption-based';
    case 'mixed':
      return 'Mixed';
    default:
      return c;
  }
}

export function labelForStatus(s: DeckStatus): string {
  switch (s) {
    case 'draft':
      return 'Draft';
    case 'internal':
      return 'Internal';
    case 'external_ready':
      return 'External-ready';
    case 'needs_review':
      return 'Needs review';
    default:
      return s;
  }
}
