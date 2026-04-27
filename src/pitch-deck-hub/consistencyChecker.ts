import type { ConsistencyIssue, MessagingLayer, PitchDeckHubState } from './types';
import { buildFinancialModel } from './financialEngine';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

/** Lightweight narrative diff signals — not NLP; flags obvious mismatches. */
export function runConsistencyCheck(state: PitchDeckHubState): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const m: MessagingLayer = state.messaging;
  const problemNorm = normalize(m.problemStatement);
  const solNorm = normalize(m.solutionStatement);

  const investorDeck = state.decks.find((d) => d.id === 'core-investor');
  const finDeck = state.decks.find((d) => d.id === 'financial-appendix');

  // Ask vs model
  const model = buildFinancialModel(state.assumptions, state.activeScenario);
  const ask = state.assumptions.fundraisingAskUsd;
  const lastCash = model.monthly[model.monthly.length - 1]?.cashEndUsd;
  if (typeof lastCash === 'number' && lastCash < 0 && ask <= 0) {
    issues.push({
      severity: 'warning',
      code: 'runway_gap',
      message: 'Modeled cash goes negative in the horizon while fundraising ask is zero or unset.',
      hint: 'Update starting cash, reduce spend, extend horizon, or set ask in assumptions.',
    });
  }

  // Deck status vs evidence
  const externalReady = state.decks.filter((d) => d.status === 'external_ready');
  for (const d of externalReady) {
    const unapproved = state.evidence.filter((e) => !e.approvedForExternal);
    if (unapproved.length > 3) {
      issues.push({
        severity: 'warning',
        code: 'evidence_backlog',
        message: `Deck "${d.name}" is marked external-ready while many evidence items are not approved for external use.`,
        hint: 'Downgrade status or link claims to approved evidence.',
      });
      break;
    }
  }

  // Investor vs appendix deck ask alignment (prompt: ask consistent with model)
  if (
    investorDeck &&
    finDeck &&
    investorDeck.status === 'external_ready' &&
    finDeck.status !== 'external_ready'
  ) {
    issues.push({
      severity: 'warning',
      code: 'appendix_not_ready',
      message: 'Core investor deck is external-ready but financial appendix is not.',
      hint: 'Align both decks before external send.',
    });
  }

  // Problem / solution keyword drift (very light)
  if (
    problemNorm &&
    solNorm &&
    !problemNorm.split(' ').some((w) => w.length > 5 && solNorm.includes(w))
  ) {
    issues.push({
      severity: 'warning',
      code: 'problem_solution_drift',
      message:
        'Problem and solution statements share few distinctive terms — reviewers may see narrative drift.',
      hint: 'Tighten solution to directly answer the stated problem.',
    });
  }

  // Banned phrases list should stay substantive
  if (m.bannedPhrases.trim().length < 40) {
    issues.push({
      severity: 'warning',
      code: 'tone_rules_light',
      message: 'Banned phrases / overclaims list looks thin.',
      hint: 'Expand banned list to reduce slide regressions.',
    });
  }

  // Trust model should disclose operator visibility (aligns with /security, threat model)
  const trustNorm = normalize(m.trustModel);
  if (trustNorm.length > 0 && !trustNorm.includes('operator')) {
    issues.push({
      severity: 'warning',
      code: 'trust_operator_disclosure',
      message:
        'Trust model should mention operator visibility (e.g. operator-readable content) per the security disclosure.',
      hint: 'Do not describe the current release as server-blind E2EE; cite /security.',
    });
  }

  // Impact pillar: "lives saved" needs explicit defensibility (caveat, discipline, or “not a claim of…”)
  const impactN = m.impactMeasurement.toLowerCase();
  if (
    impactN.includes('lives saved') &&
    !/\bcaveat\b|not a claim|discipline|goal\b|hypothesis|pre-register|roadmap target/i.test(
      m.impactMeasurement,
    )
  ) {
    issues.push({
      severity: 'warning',
      code: 'impact_lives_saved_scope',
      message:
        '“Lives saved” in impact messaging should be paired with defensibility (pilot, pre-registration, or goal—not implied realized validation).',
      hint: 'Add caveat language or point to pre-registered metrics / third-party plan.',
    });
  }

  // Common overclaim substrings in short hero text (one-line, not the banned-phrase list itself)
  const heroBlob = `${m.masterPositioning} ${m.oneLine}`.toLowerCase();
  const overclaimPhrases = [
    'proven peace impact at scale',
    'operator-proof encryption',
    'full anonymity',
  ] as const;
  for (const phrase of overclaimPhrases) {
    if (heroBlob.includes(phrase)) {
      issues.push({
        severity: 'warning',
        code: 'hero_overclaim_pattern',
        message: `Hero messaging may echo a restricted phrase (“${phrase}”).`,
        hint: 'Remove or reframe per banned phrases and evidence boundaries.',
      });
    }
  }

  // ZK / AI overclaim hints in messaging (product uses verification — do not claim unscoped AI)
  const hype = ['revolution', 'disrupt', 'world-class', 'game-changing'];
  const blob = `${m.masterPositioning} ${m.oneLine}`.toLowerCase();
  for (const h of hype) {
    if (blob.includes(h)) {
      issues.push({
        severity: 'error',
        code: 'banned_jargon',
        message: `Messaging contains empty superlative territory (“${h}”).`,
        hint: 'Remove or replace with verifiable product language.',
      });
    }
  }

  // Financial mismatch: appendix slide count 0 while assumptions non-zero
  if (finDeck && finDeck.slideCount < 5 && state.assumptions.monthlyHorizonMonths > 0) {
    issues.push({
      severity: 'warning',
      code: 'appendix_thin',
      message:
        'Financial appendix has few slides while the model is populated — outline may be incomplete.',
    });
  }

  return issues;
}
