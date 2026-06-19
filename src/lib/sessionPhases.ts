/**
 * SquadRidge Session Phase State Machine
 *
 * Defines the structured dialogue pipeline:
 *   WAITING → INPUT → REVEAL → NEGOTIATION → ANALYSIS → COMPLETE
 *
 * Each phase has duration constraints, interaction rules, and transition guards.
 * The orchestrator component reads these to enforce the dialogue protocol.
 */

// ── Phase types ─────────────────────────────────────────────────────

export const SESSION_PHASES = [
  'waiting',
  'input',
  'reveal',
  'negotiation',
  'analysis',
  'complete',
] as const;

export type SessionPhase = (typeof SESSION_PHASES)[number];

export interface PhaseConfig {
  readonly phase: SessionPhase;
  /** Human-readable phase name */
  readonly label: string;
  /** Short description shown in the phase bar */
  readonly description: string;
  /** Default duration in ms. `null` = untimed (waits for external trigger). */
  readonly defaultDurationMs: number | null;
  /** Whether the free-form chat composer is enabled */
  readonly allowChat: boolean;
  /** Whether participants can write/edit their session input */
  readonly allowInputEdit: boolean;
  /** Whether all session inputs are visible to all participants */
  readonly inputsVisible: boolean;
  /** Next phase in the pipeline, or null if terminal */
  readonly next: SessionPhase | null;
  /** Icon hint for the UI (lucide icon name) */
  readonly icon: string;
}

export const PHASE_CONFIGS: Record<SessionPhase, PhaseConfig> = {
  waiting: {
    phase: 'waiting',
    label: 'Waiting',
    description: 'Waiting for participants to join the room.',
    defaultDurationMs: null,
    allowChat: false,
    allowInputEdit: false,
    inputsVisible: false,
    next: 'input',
    icon: 'Users',
  },
  input: {
    phase: 'input',
    label: 'Input',
    description: 'Write your response. Others cannot see your input yet.',
    defaultDurationMs: 20 * 60 * 1000, // 20 minutes
    allowChat: false,
    allowInputEdit: true,
    inputsVisible: false,
    next: 'reveal',
    icon: 'PenLine',
  },
  reveal: {
    phase: 'reveal',
    label: 'Reveal',
    description: 'All inputs revealed simultaneously. Read before discussing.',
    defaultDurationMs: 45 * 1000, // 45-second reading hold
    allowChat: false,
    allowInputEdit: false,
    inputsVisible: true,
    next: 'negotiation',
    icon: 'Eye',
  },
  negotiation: {
    phase: 'negotiation',
    label: 'Negotiate',
    description: 'Discuss and negotiate toward a shared resolution.',
    defaultDurationMs: 30 * 60 * 1000, // 30 minutes
    allowChat: true,
    allowInputEdit: false,
    inputsVisible: true,
    next: 'analysis',
    icon: 'MessageSquare',
  },
  analysis: {
    phase: 'analysis',
    label: 'Analysis',
    description: 'AI is evaluating proposals through stakeholder lenses.',
    defaultDurationMs: null, // Waits for Edge Function to complete
    allowChat: false,
    allowInputEdit: false,
    inputsVisible: true,
    next: 'complete',
    icon: 'Brain',
  },
  complete: {
    phase: 'complete',
    label: 'Complete',
    description: 'Feasibility analysis ready. Review and publish to the ledger.',
    defaultDurationMs: null,
    allowChat: false,
    allowInputEdit: false,
    inputsVisible: true,
    next: null,
    icon: 'CheckCircle2',
  },
} as const;

// ── Transition logic ────────────────────────────────────────────────

export interface TransitionGuard {
  canAdvance: boolean;
  reason: string | null;
}

/**
 * Determines whether the session can advance from `currentPhase` to the next phase.
 *
 * @param currentPhase  The squad's current phase.
 * @param memberCount   Total squad members present.
 * @param minParticipants Minimum participants required (from squad config).
 * @param finalInputCount Number of participants who have finalized their input.
 * @param timerExpired  Whether the phase timer has expired.
 */
export function canAdvancePhase(
  currentPhase: SessionPhase,
  memberCount: number,
  minParticipants: number,
  finalInputCount: number,
  timerExpired: boolean,
): TransitionGuard {
  switch (currentPhase) {
    case 'waiting':
      if (memberCount < minParticipants) {
        return {
          canAdvance: false,
          reason: `Need at least ${minParticipants} participants (${memberCount} joined).`,
        };
      }
      return { canAdvance: true, reason: null };

    case 'input':
      // Auto-advance if timer expired OR all participants submitted
      if (timerExpired) return { canAdvance: true, reason: null };
      if (finalInputCount >= memberCount && memberCount >= minParticipants) {
        return { canAdvance: true, reason: null };
      }
      return {
        canAdvance: false,
        reason: `${finalInputCount} of ${memberCount} have submitted.`,
      };

    case 'reveal':
      // Auto-advance after reading hold
      if (timerExpired) return { canAdvance: true, reason: null };
      return { canAdvance: false, reason: 'Reading hold — discussion begins shortly.' };

    case 'negotiation':
      // Auto-advance on timer OR facilitator can advance early
      if (timerExpired) return { canAdvance: true, reason: null };
      return { canAdvance: true, reason: null }; // Facilitator can always advance

    case 'analysis':
      // Advances when the Edge Function completes (sets phase to 'complete')
      return { canAdvance: false, reason: 'Analysis in progress…' };

    case 'complete':
      return { canAdvance: false, reason: null }; // Terminal

    default: {
      const _exhaustive: never = currentPhase;
      return { canAdvance: false, reason: `Unknown phase: ${_exhaustive}` };
    }
  }
}

// ── Timer helpers ───────────────────────────────────────────────────

/**
 * Calculates the remaining time for a phase.
 * Returns `null` for untimed phases.
 */
export function phaseTimeRemainingMs(
  phase: SessionPhase,
  phaseStartedAt: Date,
  customDurationMs?: number,
): number | null {
  const config = PHASE_CONFIGS[phase];
  const duration = customDurationMs ?? config.defaultDurationMs;
  if (duration === null) return null;

  const elapsed = Date.now() - phaseStartedAt.getTime();
  return Math.max(0, duration - elapsed);
}

/**
 * Formats milliseconds into a human-readable countdown: "12:45" or "0:03".
 */
export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Returns the phase index (0-based) for progress bar rendering.
 */
export function phaseIndex(phase: SessionPhase): number {
  return SESSION_PHASES.indexOf(phase);
}

// ── Stakeholder lenses (for AI analysis) ────────────────────────────

export const STAKEHOLDER_LENSES = [
  {
    id: 'government',
    label: 'Government & Institutional',
    description:
      'Feasibility within existing legal frameworks, policy mechanisms, and institutional capacity.',
    icon: 'Landmark',
  },
  {
    id: 'political',
    label: 'Political Landscape',
    description:
      'Political viability, coalition dynamics, and stakeholder buy-in across party lines.',
    icon: 'Vote',
  },
  {
    id: 'public',
    label: 'Public & Civil Society',
    description: 'Public sentiment, grassroots support potential, and community impact.',
    icon: 'Users',
  },
  {
    id: 'media',
    label: 'Media & Journalism',
    description: 'Narrative framing, transparency requirements, and accountability mechanisms.',
    icon: 'Newspaper',
  },
  {
    id: 'peace',
    label: 'Peacebuilding & Humanitarian',
    description:
      'Alignment with conflict resolution principles, humanitarian law, and long-term stability.',
    icon: 'Heart',
  },
] as const;

export type StakeholderLensId = (typeof STAKEHOLDER_LENSES)[number]['id'];

export interface LensAnalysis {
  lensId: StakeholderLensId;
  feasibilityScore: number; // 0-100
  rationale: string;
  risks: string[];
  opportunities: string[];
}

export interface SessionAnalysisResult {
  lenses: LensAnalysis[];
  rankedProposals: RankedProposal[];
  synthesisStatement: string;
  generatedAt: string;
}

export interface RankedProposal {
  rank: number;
  title: string;
  description: string;
  overallFeasibility: number; // 0-100
  sourceParticipants: string[]; // anonymous labels: "Participant A", "Participant B"
  actionItems: string[];
}
