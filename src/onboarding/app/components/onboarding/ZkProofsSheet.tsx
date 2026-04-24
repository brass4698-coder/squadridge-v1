import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { cn } from '../ui/utils';

export function ZkProofsLearnMore() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full">
      <CollapsibleTrigger
        type="button"
        className={cn(
          'group flex w-full items-center gap-2 rounded-md py-2 pr-1 text-left font-sans text-[11px] font-medium text-white/45 transition-colors hover:text-onboarding-accent',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-onboarding-accent/40',
        )}
      >
        <BookOpen className="size-3.5 shrink-0 opacity-70 transition-opacity group-hover:opacity-100" />
        <span className="min-w-0 flex-1">How zero-knowledge proofs work</span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 text-white/35 transition-[transform,opacity] duration-300 ease-out group-hover:text-white/50',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </CollapsibleTrigger>

      <CollapsibleContent
        className={cn(
          'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden',
          'motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none',
        )}
      >
        <div className="border-t border-white/[0.06] pt-4 font-sans text-[14px] leading-relaxed text-white/70 sm:text-[15px]">
          <p>
            A zero-knowledge proof lets you show that something is true without revealing the
            underlying data. In this context, you can demonstrate eligibility or attributes the room
            needs — without exposing raw documents or identity details to the platform or other
            members.
          </p>
          <p className="mt-4">
            The system receives a cryptographic commitment: enough to match you with the right
            squad, not enough to build a dossier or link your proof to your name in a reversible
            way.
          </p>
          <p className="mt-4 text-[13px] text-white/50">
            This is a simplified explanation; implementation details may vary.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
