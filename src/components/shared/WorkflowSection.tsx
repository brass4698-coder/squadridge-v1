import type { LucideIcon } from 'lucide-react';
import { SectionLabel } from './SectionLabel';
import { StepCard, type StepCardProps } from './StepCard';

export interface WorkflowSectionProps {
  label: string;
  title: string;
  description: string;
  steps: StepCardProps[];
  icon: LucideIcon;
}

export function WorkflowSection({
  label,
  title,
  description,
  steps,
  icon: Icon,
}: WorkflowSectionProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-3xl">
        <SectionLabel text={label} />
        <div className="flex items-start gap-3">
          <Icon className="mt-1 size-5 shrink-0 text-ink-faint" strokeWidth={1.75} aria-hidden />
          <div>
            <h3 className="text-h2 text-ink">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary md:text-base">
              {description}
            </p>
          </div>
        </div>
      </div>
      <ol className="grid gap-4 md:grid-cols-2">
        {steps.map((step) => (
          <StepCard key={step.number} {...step} />
        ))}
      </ol>
    </div>
  );
}
