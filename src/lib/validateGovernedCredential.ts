/** Governed credential validation — demo hashes + invite token routing. */

import { DEMO_GOVERNED_CREDENTIALS } from '../data/demoCredentials';

/** @deprecated Use DEMO_GOVERNED_CREDENTIALS */
export const DEMO_CREDENTIALS = DEMO_GOVERNED_CREDENTIALS;

export type CredentialFailReason =
  | 'not_found'
  | 'expired'
  | 'already_used'
  | 'revoked'
  | 'wrong_role'
  | 'room_archived'
  | 'facilitator_pending'
  | 'demo_required';

export type CredentialSummary = {
  accessType: string;
  matterLabel: string;
  role: string;
  issuedBy: string;
  expiry: string;
  status: string;
};

export type CredentialValidation =
  | {
      ok: true;
      summary: CredentialSummary;
      continueHref: string;
      demo: boolean;
    }
  | {
      ok: false;
      reason: CredentialFailReason;
      message: string;
    };

const ERROR_TOKENS: Record<string, CredentialFailReason> = {
  'err-expired': 'expired',
  'err-redeemed': 'already_used',
  'err-wrong-role': 'wrong_role',
  'err-archived': 'room_archived',
  'err-pending': 'facilitator_pending',
};

export async function validateGovernedCredential(raw: string): Promise<CredentialValidation> {
  const token = raw.trim();
  if (!token) {
    return { ok: false, reason: 'not_found', message: 'Enter a credential to continue.' };
  }

  const demo = DEMO_GOVERNED_CREDENTIALS.find((c) => c.token === token);
  if (demo) {
    return {
      ok: true,
      summary: { ...demo.summary },
      continueHref: demo.continueHref,
      demo: true,
    };
  }

  const err = ERROR_TOKENS[token];
  if (err) {
    return {
      ok: false,
      reason: err,
      message: 'This credential cannot be used.',
    };
  }

  // Participant tokens before generic long staff tokens (long p_* must not hit staff accept).
  if (token.startsWith('p_') || /^p[-_]/i.test(token)) {
    return {
      ok: true,
      summary: {
        accessType: 'Participant invitation',
        matterLabel: 'Assigned participant room',
        role: 'Participant',
        issuedBy: 'Facilitator',
        expiry: 'Per invite policy',
        status: 'Continue to participant acceptance',
      },
      continueHref: `/p/invite/${encodeURIComponent(token)}`,
      demo: false,
    };
  }

  // Staff / platform invite tokens are typically long opaque strings.
  if (token.length >= 32) {
    return {
      ok: true,
      summary: {
        accessType: 'Invitation link token',
        matterLabel: 'Assigned room (server-validated on continue)',
        role: 'As issued',
        issuedBy: 'Facilitator or institution admin',
        expiry: 'Per invite policy',
        status: 'Format valid — continue to accept flow',
      },
      continueHref: `/invite/accept/${encodeURIComponent(token)}`,
      demo: false,
    };
  }

  if (token.length >= 24) {
    return {
      ok: true,
      summary: {
        accessType: 'Participant invitation',
        matterLabel: 'Assigned participant room',
        role: 'Participant',
        issuedBy: 'Facilitator',
        expiry: 'Per invite policy',
        status: 'Continue to participant acceptance',
      },
      continueHref: `/p/invite/${encodeURIComponent(token)}`,
      demo: false,
    };
  }

  return {
    ok: false,
    reason: 'not_found',
    message: 'Credential not recognized. Check the value or request a new invitation.',
  };
}

export { DEMO_GOVERNED_CREDENTIALS };
