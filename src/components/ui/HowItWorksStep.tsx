export interface HowItWorksStepProps {
  number: string;
  heading: string;
  body: string;
}

export function HowItWorksStep({ number, heading, body }: HowItWorksStepProps) {
  return (
    <li className="relative flex min-h-[17rem] flex-col md:min-h-[19rem]">
      <span className="landing-how-step-number pointer-events-none block shrink-0 select-none leading-none" aria-hidden>
        {number}
      </span>
      <div className="relative z-10 mt-5 flex min-h-0 flex-1 flex-col md:mt-6">
        <h3 className="font-heading text-[1.1rem] font-bold leading-snug text-landing-ink">{heading}</h3>
        <p className="mt-3 font-sans text-onboarding-body font-normal leading-[1.65] text-landing-muted">{body}</p>
      </div>
    </li>
  );
}
