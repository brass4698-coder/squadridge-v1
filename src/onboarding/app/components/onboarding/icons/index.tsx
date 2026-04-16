export type { IconProps } from './iconProps';
export { AIOptionalNudgesIcon } from './AIOptionalNudgesIcon';
export { CheckmarkIcon } from './CheckmarkIcon';
export { HoldRetractIcon } from './HoldRetractIcon';
export { NodesShieldIcon } from './NodesShieldIcon';
export { PIIStrippedIcon } from './PIIStrippedIcon';
export { ShieldDialIcon } from './ShieldDialIcon';
export { StructuredTurnsIcon } from './StructuredTurnsIcon';
export { TimeboxedRoundsIcon } from './TimeboxedRoundsIcon';
export { TranslationIcon } from './TranslationIcon';
export { LightbulbIcon, type IconProps as LightbulbIconProps } from './LightbulbIcon';
export { SoundWaveIcon, type IconProps as SoundWaveIconProps } from './SoundWaveIcon';

// Step 1 icons
export function StopwatchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <circle cx="12" cy="14" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 14L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 14L15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 3H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function WaveformIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <path d="M3 12L3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 10L7 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 8L11 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 6L15 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19 9L19 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Step 2 icons
export function CheckmarkLinesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 3H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M3 21H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

/** @deprecated Prefer principle `NodesShieldIcon` from `./NodesShieldIcon` for new work. */
export function LegacyNodesShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <path
        d="M12 3L5 6V11C5 15.5 8 19 12 21C16 19 19 15.5 19 11V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="10" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" opacity="0.6" />
      <path d="M8 10L12 12L16 10" stroke="currentColor" strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

// Step 3 icons
/** @deprecated Prefer principle `ShieldDialIcon` from `./ShieldDialIcon` for new work. */
export function LegacyShieldDialIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <path
        d="M12 3L5 6V11C5 15.5 8 19 12 21C16 19 19 15.5 19 11V6L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 9V12L14 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DocumentProofIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <path
        d="M14 3H7C6 3 5 4 5 5V19C5 20 6 21 7 21H17C18 21 19 20 19 19V8L14 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 3V8H19" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 13L11 15L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Step 4 icons
export function CountdownRingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path
        d="M12 4C16.4 4 20 7.6 20 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 8V12L15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EqualBarsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <rect x="4" y="7" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="7" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function StrikethroughLinesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <path d="M4 8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 16H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CircuitBreakerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SpeechBubblesArrowsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <path
        d="M7 9C7 7 8.5 5 11 5H16C17.5 5 19 6.5 19 8V11C19 12.5 17.5 14 16 14H13L10 17V14H11C8.5 14 7 12 7 10V9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 9L13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 11L16 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DiamondDashedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-onboarding-accent">
      <path
        d="M12 3L19 12L12 21L5 12L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeDasharray="4 4"
        opacity="0.6"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
