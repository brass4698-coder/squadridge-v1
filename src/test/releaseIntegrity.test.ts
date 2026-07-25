import { describe, expect, it } from 'vitest';
import {
  describeReleaseBlock,
  parseReleaseBlockReason,
  releaseErrorMessage,
  shortContentSha,
  staleApprovalNotice,
  type ReleaseReadiness,
} from '../lib/releaseIntegrity';

function readiness(overrides: Partial<ReleaseReadiness> = {}): ReleaseReadiness {
  return {
    ok: true,
    authorshipAttested: true,
    approvalsTotal: 3,
    approvalsApproved: 3,
    approvalsRejected: 0,
    approvalsStale: 0,
    verbatimConflict: false,
    canRelease: true,
    blockingReason: null,
    ...overrides,
  };
}

describe('releaseIntegrity', () => {
  it('parses only known blocking reasons', () => {
    expect(parseReleaseBlockReason('CONTENT_CHANGED_AFTER_APPROVAL')).toBe(
      'CONTENT_CHANGED_AFTER_APPROVAL',
    );
    expect(parseReleaseBlockReason('SOMETHING_ELSE')).toBeNull();
    expect(parseReleaseBlockReason(undefined)).toBeNull();
  });

  it('describes drift and attestation blocks in facilitator language', () => {
    expect(describeReleaseBlock('CONTENT_CHANGED_AFTER_APPROVAL')).toMatch(/different text/i);
    expect(describeReleaseBlock('ATTESTATION_STALE')).toMatch(/re-attest/i);
    expect(describeReleaseBlock('AUTHORSHIP_ATTESTATION_REQUIRED')).toMatch(/attestation/i);
    expect(describeReleaseBlock(null)).toBeNull();
  });

  it('falls back to the raw code for unmapped release errors', () => {
    expect(releaseErrorMessage('APPROVALS_PENDING')).toMatch(/approve this exact text/i);
    expect(releaseErrorMessage('UNEXPECTED')).toBe('UNEXPECTED');
    expect(releaseErrorMessage(undefined)).toBe('Release failed');
  });

  it('shortens a content hash without inventing one', () => {
    const sha = 'a'.repeat(32) + 'b'.repeat(32);
    expect(shortContentSha(sha)).toBe('aaaaaaaa…bbbbbbbb');
    expect(shortContentSha('abc')).toBe('abc');
    expect(shortContentSha(null)).toBe('—');
  });

  it('reports stale approvals only when the database counted some', () => {
    expect(staleApprovalNotice(readiness())).toBeNull();
    expect(staleApprovalNotice(readiness({ approvalsStale: 1 }))).toMatch(/1 approval recorded/i);
    expect(staleApprovalNotice(readiness({ approvalsStale: 2 }))).toMatch(/2 approvals recorded/i);
    expect(staleApprovalNotice(null)).toBeNull();
  });
});
