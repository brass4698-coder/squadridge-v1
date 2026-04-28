/**
 * Typed parsing for `verify-zk-proof` / `zk-verify` Edge responses.
 * Supports `{ ok: true, proof }` (preferred) and legacy flat {@link ZKProof} bodies.
 */
import { z } from 'zod';
import type { ZKProof } from './zkVerifier';

export const zkProofPayloadSchema = z.object({
  proofId: z.string(),
  credentialType: z.string(),
  nullifierHash: z.string(),
  commitment: z.string(),
  verifiedAt: z.string(),
  isStub: z.boolean().optional(),
});

const wrappedOkSchema = z.object({
  ok: z.literal(true),
  proof: zkProofPayloadSchema,
});

const wrappedErrSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
  errorCode: z.string().optional(),
});

const legacyErrSchema = z.object({
  error: z.string(),
});

export class VerifyZkProofParseError extends Error {
  constructor(message = 'Invalid verification response') {
    super(message);
    this.name = 'VerifyZkProofParseError';
  }
}

/** Normalize Edge payload to {@link ZKProof}. */
export function parseVerifyZkProofResponse(data: unknown): ZKProof {
  const wrapped = wrappedOkSchema.safeParse(data);
  if (wrapped.success) {
    const p = wrapped.data.proof;
    return {
      proofId: p.proofId,
      credentialType: p.credentialType,
      nullifierHash: p.nullifierHash,
      commitment: p.commitment,
      verifiedAt: p.verifiedAt,
      ...(p.isStub !== undefined ? { isStub: p.isStub } : {}),
    };
  }
  const legacy = zkProofPayloadSchema.safeParse(data);
  if (legacy.success) {
    const p = legacy.data;
    return {
      proofId: p.proofId,
      credentialType: p.credentialType,
      nullifierHash: p.nullifierHash,
      commitment: p.commitment,
      verifiedAt: p.verifiedAt,
      ...(p.isStub !== undefined ? { isStub: p.isStub } : {}),
    };
  }
  throw new VerifyZkProofParseError();
}

export type VerifyZkProofInvokeError = {
  message: string;
  /** Machine-readable when Edge sends wrapped errors. */
  errorCode?: string;
};

/** Parse error JSON body from Edge (wrapped or legacy `{ error }` only). */
export function parseVerifyZkProofErrorBody(data: unknown): VerifyZkProofInvokeError | null {
  const w = wrappedErrSchema.safeParse(data);
  if (w.success) {
    return { message: w.data.error, errorCode: w.data.errorCode };
  }
  const leg = legacyErrSchema.safeParse(data);
  if (leg.success) {
    return { message: leg.data.error };
  }
  return null;
}
