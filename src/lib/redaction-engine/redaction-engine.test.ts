import { describe, expect, it } from 'vitest';
import { runDeterministicLayer } from './detectors/runDeterministic';
import { detectSensitiveEntities, redactContent } from './pipelines/redactContent';

const baseCtx = {
  roomId: 'room-1',
  roomPseudonymSecret: 'test-secret',
  allowlistTerms: ['MENDguild'],
};

describe('redaction-engine', () => {
  it('redacts direct self-doxxing in participant live_chat', async () => {
    const raw = 'Email me at whistle@agency.gov or call 415-555-0101.';
    const r = await redactContent({
      text: raw,
      mode: 'live_chat',
      audience: 'participant',
      contentType: 'live_message',
      context: baseCtx,
      actorLabel: 'test',
    });
    expect(r.redactedText).not.toContain('whistle@agency.gov');
    expect(r.redactedText).not.toContain('415-555-0101');
    expect(r.redactedText).toContain('[REDACTED_EMAIL]');
    expect(r.redactedText).toContain('[REDACTED_PHONE]');
    expect(r.originalContentHash).toHaveLength(64);
    expect(r.audit.contentHash).toBe(r.originalContentHash);
    expect(r.humanReviewRecommended).toBe(true);
  });

  it('preserves allowlisted product terms in heuristic NER path', async () => {
    const raw = 'We use MENDguild and also worry about Jane Smith from HR.';
    const r = await redactContent({
      text: raw,
      mode: 'upload_ocr',
      audience: 'participant',
      contentType: 'ocr_text',
      context: baseCtx,
    });
    expect(r.redactedText).toContain('MENDguild');
    expect(r.redactedText).toContain('[POSSIBLE_NAME_GENERALIZED]');
  });

  it('differentiates trust admin vs participant for direct identifiers', async () => {
    const raw = 'reach me at a@b.com';
    const r = await redactContent({
      text: raw,
      mode: 'live_chat',
      audience: 'participant',
      contentType: 'live_message',
      context: baseCtx,
    });
    expect(r.viewsByAudience.participant).toContain('[REDACTED_EMAIL]');
    expect(r.viewsByAudience.trust_safety_admin).toContain('[AVAILABLE_IN_TRUST_LAYER]');
  });

  it('stable pseudonyms for same room inputs', async () => {
    const r1 = await redactContent({
      text: 'hello',
      mode: 'live_chat',
      audience: 'participant',
      contentType: 'live_message',
      context: baseCtx,
      roomParticipantUserIds: ['u1', 'u2'],
    });
    const r2 = await redactContent({
      text: 'hello',
      mode: 'live_chat',
      audience: 'participant',
      contentType: 'live_message',
      context: baseCtx,
      roomParticipantUserIds: ['u1', 'u2'],
    });
    expect(r1.pseudonymMap).toEqual(r2.pseudonymMap);
  });

  it('detectSensitiveEntities merges deterministic hits', async () => {
    const raw = 'Contact x@y.com and https://linkedin.com/in/example';
    const hits = await detectSensitiveEntities(raw, baseCtx, 'upload_ocr');
    const kinds = new Set(hits.map((h) => h.kind));
    expect(kinds.has('direct_email')).toBe(true);
    expect(kinds.has('direct_social_url')).toBe(true);
  });

  it('runDeterministicLayer is bounded for short strings (perf sanity)', () => {
    const raw = 'hi';
    const t0 = performance.now();
    for (let i = 0; i < 200; i++) runDeterministicLayer(raw, 'live_chat');
    const ms = performance.now() - t0;
    expect(ms).toBeLessThan(200);
  });
});
