import type { BadgeProps } from '../../components/ui/Badge';
import type { IncidentSeverityTier, IncidentVerificationStatus } from './types';

export function severityBadgeVariant(tier: IncidentSeverityTier): BadgeProps['variant'] {
  switch (tier) {
    case 'critical':
      return 'danger';
    case 'escalating':
      return 'warning';
    case 'de-escalating':
      return 'success';
    case 'monitoring':
    default:
      return 'info';
  }
}

export function verificationBadgeVariant(
  status: IncidentVerificationStatus,
): BadgeProps['variant'] {
  switch (status) {
    case 'corroborated':
      return 'verified';
    case 'disputed':
      return 'warning';
    case 'retracted':
      return 'declined';
    case 'unverified':
      return 'draft';
    case 'pending_review':
    default:
      return 'pending';
  }
}
