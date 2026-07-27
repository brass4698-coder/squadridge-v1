import { StatusBadge } from '../ui/StatusBadge';
import { severityBadgeVariant } from '../../lib/incident/badges';
import { INCIDENT_SEVERITY_LABELS, type IncidentSeverityTier } from '../../lib/incident/types';

type IncidentSeverityBadgeProps = {
  tier: IncidentSeverityTier;
  className?: string;
};

export function IncidentSeverityBadge({ tier, className }: IncidentSeverityBadgeProps) {
  return (
    <StatusBadge variant={severityBadgeVariant(tier)} className={className}>
      {INCIDENT_SEVERITY_LABELS[tier]}
    </StatusBadge>
  );
}
