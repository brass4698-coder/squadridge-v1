/**
 * Verbatim onboarding copy (source of truth for screens).
 * Target: concise, briefing-room tone; ~50 words or fewer per screen for body blocks.
 */

export function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function countChars(s: string): number {
  return s.length;
}

export const COPY = {
  mission: {
    title: 'Mission brief',
    p1: 'SquadRidge builds verified-anonymous squads for high-stakes cross-border strategy.',
    p2: 'Not casual chat — infrastructure for conflict.',
    p3: "This space is for serious work. Continue only if you're ready to treat it that way.",
    decline: 'Leave',
    proceed: 'Enter briefing',
  },
  identity: {
    title: 'Identity model',
    lead: 'Set your callsign and lane. Nothing here reveals your name — just what the room needs to work with you.',
    requiredFieldsNotice: 'Fields marked with * are required.',
    callsignLabel: 'Callsign',
    callsignWhy: 'Callsign — how the room addresses you without using your real name.',
    callsignHint: 'How others address you in the room.',
    roleLabel: 'Role',
    roleWhy: 'Role helps squads understand how to work with you.',
    roleOptionsHint:
      'Strategist (plans campaigns), Analyst (works with data, OSINT), Policy (law, doctrine), Field (operates on the ground), Mediator, or Other.',
    roleOtherLabel: 'Describe your role.',
    roleOtherHint:
      "Briefly describe your lane (e.g., 'humanitarian negotiator', 'OSINT hobbyist').",
    roleOtherTooShort: 'Enter at least 8 characters.',
    eraLabel: 'Era / affiliation lens',
    eraHint:
      'Optional: pick the context you mostly work from (e.g., Cold War, Contemporary, Futures). Used only to improve matching.',
  },
  rules: {
    title: 'Rules & safety',
    /** First sentence of the lead (plain text). */
    leadOpen: "What's said here stays here. ",
    /** Second sentence — paired with collapsible explainer in RulesScreen. */
    leadVerifiedPhrase: 'Verified anonymity is enforced.',
    /** Short policy explainer (ZK / verification model); shown on demand under the lead. */
    verifiedAnonymityExplainer:
      'We confirm participants are real and eligible without exposing who you are in the room. Checks may be lighter in early phases; zero-knowledge verification applies where the stack is live. This is a gate for serious dialogue—not a dossier or background file.',
    verifiedAnonymityTriggerAriaLabel: 'More about verified anonymity',
    /** Shown after the explainer; links to `/verify`. */
    verifiedAnonymityLinkLabel: 'Verification step',
    verifiedAnonymityLinkAfter: ' (main app, when you are ready).',
    b1: 'No real names, units, or live operational details.',
    b2: 'Challenge ideas, not people. Assume everything here is sensitive.',
    b3: 'Misuse endangers everyone in the room.',
    checkbox: 'I accept these rules for every session.',
  },
  placement: {
    title: 'Placement (optional)',
    lead:
      'Share only what helps us place you in the right squads and time bands. Skip anything you prefer to withhold.',
    languageLabel: 'Language',
    languageHint: 'e.g. English, Arabic, French.',
    regionLabel: 'Region / focus band',
    regionHintScope: 'Broad lane only — not a street-level pin.',
    regionHintExamples: 'e.g. West Africa, Eastern Europe, Pacific.',
    timezoneLabel: 'Time-zone window',
    timezoneHintWhen: "When you're usually available.",
    timezoneHintExamples: 'e.g. CET business hours, evenings PT.',
    skip: 'Skip for now',
  },
  verification: {
    title: 'Verification',
    leadLine1: 'We confirm you are real and eligible—without building a profile on you.',
    /** U+2011 in "sign‑in" keeps the compound from breaking across lines. */
    leadLine2:
      'Phase 1 uses account sign\u2011in; a zero-knowledge proofs layer comes next.',
    /** Shown in badge block before zkGateRest; rendered strong in VerificationScreen. */
    zkGateEmphasis: 'ZK gate',
    zkGateRest: ' is simulated in Phase 1. Proofs stay bound to your device until you release them.',
    /** Shown when Supabase keys are missing (dev / offline). */
    devNoticeLabel: 'Dev notice',
    devSupabaseNotice:
      'Supabase env not configured yet — we store preferences on\u2011device only until auth is connected.',
    emailPlaceholder: 'you@domain.org',
    sendLink: 'Send secure link',
    signedIn: 'Session active',
    continue: 'Continue',
    checkEmail: 'Check your email for the sign-in link.',
  },
  room: {
    title: 'Dry run: practice under guardrails',
    leadLine1:
      'A 60-second simulation of a live squad room. Same guardrails as real sessions.',
    leadLine2: 'Nothing you type here touches any live ledger.',
    guidance:
      'Treat this like a real room: focus on de-escalation, not blame or threats.',
    sessionBarLeft: 'Practice session',
    timerPrefix: 'Simulation ends in',
    topicLabel: 'Topic anchor — simulation',
    scenario:
      'Scenario: A cross-border water dispute is escalating.\nYour squad has 10 minutes to propose steps that avoid military confrontation.',
    inputLabel: 'Your first move',
    placeholder:
      'Type a possible first step your squad could take. Avoid real names, locations, or live operations.',
    stepOut: 'Step out of simulation',
    finishDryRun: 'Finish dry run',
    skipHint: 'Prefer to skip? You can review the summary without practice.',
    summaryLead:
      "You're ready for real work. In live rooms, the same guardrails apply — but the stakes are real.",
  },
  commitment: {
    title: 'Commitment',
    paragraphs: [
      'You are entering verified\u2011anonymous infrastructure.',
      'Missteps here can harm people you will never meet.',
      'Enter only if you intend to hold the line.',
    ],
    checkbox: 'I understand the stakes and accept responsibility.',
    backLabel: 'Back',
    cta: 'Enter squad room',
    ctaDisabledHint: 'Acknowledge the commitment to proceed.',
  },
} as const;

/** Human-readable stats for design review / compliance checks. */
export const COPY_SCREEN_STATS = [
  {
    id: 'mission',
    titleChars: COPY.mission.title.length,
    bodyWords: countWords(`${COPY.mission.p1} ${COPY.mission.p2} ${COPY.mission.p3}`),
  },
  {
    id: 'identity',
    titleChars: COPY.identity.title.length,
    bodyWords: countWords(
      `${COPY.identity.lead} ${COPY.identity.requiredFieldsNotice} ${COPY.identity.callsignWhy} ${COPY.identity.callsignHint} ${COPY.identity.roleWhy} ${COPY.identity.roleOptionsHint} ${COPY.identity.roleOtherHint} ${COPY.identity.eraHint}`,
    ),
  },
  {
    id: 'rules',
    titleChars: COPY.rules.title.length,
    bodyWords: countWords(
      `${COPY.rules.leadOpen}${COPY.rules.leadVerifiedPhrase} ${COPY.rules.verifiedAnonymityExplainer} ${COPY.rules.verifiedAnonymityLinkLabel} ${COPY.rules.b1} ${COPY.rules.b2} ${COPY.rules.b3}`,
    ),
  },
  {
    id: 'placement',
    titleChars: COPY.placement.title.length,
    bodyWords: countWords(
      `${COPY.placement.lead} ${COPY.placement.languageHint} ${COPY.placement.regionHintScope} ${COPY.placement.regionHintExamples} ${COPY.placement.timezoneHintWhen} ${COPY.placement.timezoneHintExamples}`,
    ),
  },
  {
    id: 'verification',
    titleChars: COPY.verification.title.length,
    bodyWords: countWords(
      `${COPY.verification.leadLine1} ${COPY.verification.leadLine2} ${COPY.verification.zkGateEmphasis}${COPY.verification.zkGateRest} ${COPY.verification.devSupabaseNotice}`,
    ),
  },
  {
    id: 'room',
    titleChars: COPY.room.title.length,
    bodyWords: countWords(
      `${COPY.room.leadLine1} ${COPY.room.leadLine2} ${COPY.room.guidance} ${COPY.room.scenario.replace(/\n/g, ' ')}`,
    ),
  },
  {
    id: 'commitment',
    titleChars: COPY.commitment.title.length,
    bodyWords: countWords(
      `${COPY.commitment.paragraphs.join(' ')} ${COPY.commitment.checkbox} ${COPY.commitment.ctaDisabledHint}`,
    ),
  },
] as const;

/** Per-field character counts (design / compliance). */
export const COPY_CHAR_MANIFEST = {
  mission: {
    title: COPY.mission.title.length,
    p1: COPY.mission.p1.length,
    p2: COPY.mission.p2.length,
    p3: COPY.mission.p3.length,
  },
  identity: {
    title: COPY.identity.title.length,
    lead: COPY.identity.lead.length,
    requiredFieldsNotice: COPY.identity.requiredFieldsNotice.length,
    callsignWhy: COPY.identity.callsignWhy.length,
    callsignHint: COPY.identity.callsignHint.length,
    roleWhy: COPY.identity.roleWhy.length,
    roleOptionsHint: COPY.identity.roleOptionsHint.length,
    roleOtherHint: COPY.identity.roleOtherHint.length,
    eraHint: COPY.identity.eraHint.length,
  },
  rules: {
    title: COPY.rules.title.length,
    leadOpen: COPY.rules.leadOpen.length,
    leadVerifiedPhrase: COPY.rules.leadVerifiedPhrase.length,
    verifiedAnonymityExplainer: COPY.rules.verifiedAnonymityExplainer.length,
    verifiedAnonymityLinkLabel: COPY.rules.verifiedAnonymityLinkLabel.length,
    verifiedAnonymityLinkAfter: COPY.rules.verifiedAnonymityLinkAfter.length,
    b1: COPY.rules.b1.length,
    b2: COPY.rules.b2.length,
    b3: COPY.rules.b3.length,
  },
  placement: {
    title: COPY.placement.title.length,
    lead: COPY.placement.lead.length,
    languageLabel: COPY.placement.languageLabel.length,
    languageHint: COPY.placement.languageHint.length,
    regionLabel: COPY.placement.regionLabel.length,
    regionHintScope: COPY.placement.regionHintScope.length,
    regionHintExamples: COPY.placement.regionHintExamples.length,
    timezoneLabel: COPY.placement.timezoneLabel.length,
    timezoneHintWhen: COPY.placement.timezoneHintWhen.length,
    timezoneHintExamples: COPY.placement.timezoneHintExamples.length,
    skip: COPY.placement.skip.length,
  },
  verification: {
    title: COPY.verification.title.length,
    leadLine1: COPY.verification.leadLine1.length,
    leadLine2: COPY.verification.leadLine2.length,
    zkGateEmphasis: COPY.verification.zkGateEmphasis.length,
    zkGateRest: COPY.verification.zkGateRest.length,
    devNoticeLabel: COPY.verification.devNoticeLabel.length,
    devSupabaseNotice: COPY.verification.devSupabaseNotice.length,
  },
  room: {
    title: COPY.room.title.length,
    leadLine1: COPY.room.leadLine1.length,
    leadLine2: COPY.room.leadLine2.length,
    guidance: COPY.room.guidance.length,
    topicLabel: COPY.room.topicLabel.length,
    scenario: COPY.room.scenario.length,
    inputLabel: COPY.room.inputLabel.length,
    placeholder: COPY.room.placeholder.length,
  },
  commitment: {
    title: COPY.commitment.title.length,
    paragraphs: COPY.commitment.paragraphs.map((p) => p.length),
    checkbox: COPY.commitment.checkbox.length,
    backLabel: COPY.commitment.backLabel.length,
    cta: COPY.commitment.cta.length,
    ctaDisabledHint: COPY.commitment.ctaDisabledHint.length,
  },
} as const;
