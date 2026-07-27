/** Structured intervention proposals for v2 facilitator sessions. */

export type SessionResolutionStatus = 'proposed' | 'shortlisted' | 'archived';

export interface SessionResolutionItem {
  id: string;
  session_id: string;
  title: string;
  description: string | null;
  owner_org: string | null;
  target_days: number | null;
  support_count: number;
  rank_order: number | null;
  status: SessionResolutionStatus;
  proposed_by_label: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParticipantResolutionItem {
  id: string;
  title: string;
  description: string | null;
  owner_org: string | null;
  target_days: number | null;
  support_count: number;
  rank_order: number | null;
  status: SessionResolutionStatus;
  supported: boolean;
}

export interface SuggestedResolutionProposal {
  title: string;
  description?: string;
  owner_org?: string;
  target_days?: number;
}

export interface SessionSetupConfig {
  suggestedOutcomeStructure?: string;
  requiredApprovals?: 'all_verified' | 'facilitator_plus_parties';
  groundRules?: string[];
  resolutionWorkflow?: boolean;
  suggestedProposals?: SuggestedResolutionProposal[];
}

export function parseSessionSetupConfig(raw: unknown): SessionSetupConfig {
  if (!raw || typeof raw !== 'object') return {};
  return raw as SessionSetupConfig;
}

export function sessionUsesResolutionWorkflow(
  templateId: string | null | undefined,
  setupConfig: unknown,
): boolean {
  const config = parseSessionSetupConfig(setupConfig);
  return templateId === 'city_community_safety' || config.resolutionWorkflow === true;
}

/** Format ranked shortlist for outcome workspace agreed_terms field. */
export function formatResolutionShortlistForOutcome(items: SessionResolutionItem[]): string {
  const shortlisted = items
    .filter((i) => i.status === 'shortlisted')
    .sort((a, b) => (a.rank_order ?? 99) - (b.rank_order ?? 99));

  if (shortlisted.length === 0) {
    const top = [...items]
      .filter((i) => i.status === 'proposed')
      .sort((a, b) => b.support_count - a.support_count || a.created_at.localeCompare(b.created_at))
      .slice(0, 5);
    if (top.length === 0) return '';
    return top.map((item, idx) => formatCommitmentLine(idx + 1, item)).join('\n');
  }

  return shortlisted.map((item) => formatCommitmentLine(item.rank_order ?? 0, item)).join('\n');
}

function formatCommitmentLine(rank: number, item: SessionResolutionItem): string {
  const owner = item.owner_org ? ` — ${item.owner_org}` : '';
  const timeline = item.target_days ? ` (${item.target_days} days)` : '';
  const support =
    item.support_count > 0
      ? ` · ${item.support_count} participant support${item.support_count === 1 ? '' : 's'}`
      : '';
  return `${rank}. ${item.title}${owner}${timeline}${support}`;
}
