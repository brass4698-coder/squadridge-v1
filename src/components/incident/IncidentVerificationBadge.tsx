import { StatusBadge } from '../ui/StatusBadge';
import { verificationBadgeVariant } from '../../lib/incident/badges';
import {
  INCIDENT_VERIFICATION_LABELS,
  type IncidentVerificationStatus,
} from '../../lib/incident/types';

type IncidentVerificationBadgeProps = {
  status: IncidentVerificationStatus;
  className?: string;
};

export function IncidentVerificationBadge({ status, className }: IncidentVerificationBadgeProps) {
  return (
    <StatusBadge variant={verificationBadgeVariant(status)} className={className}>
      {INCIDENT_VERIFICATION_LABELS[status]}
    </StatusBadge>
  );
}
