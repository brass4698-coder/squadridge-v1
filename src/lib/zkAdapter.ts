import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { addZkProofBreadcrumb, type ZkProofBreadcrumbErrorCode } from './sentry';
import type { CredentialType, ZKProof } from './zkVerifier';
import { resolveIssuerRegistry, type IssuerRegistryConfig } from './zk/issuerRegistry';
import {
  parseVerifyZkProofErrorBody,
  parseVerifyZkProofResponse,
  VerifyZkProofParseError,
} from './verifyZkProofResponse';

/** When true, uses fast hash-only stubs (no Semaphore, no Edge verification). */
const USE_HASH_STUB = import.meta.env.VITE_ZK_STUB === 'true';

/**
 * Resolve the active issuer registry once per module import. Returns `null`
 * for the documented "decoys / no issuer configured" path, in which case the
 * adapter sends no `issuer_group_id` and the Edge verifier skips the issuer
 * cross-check (existing behavior).
 */
function getIssuerRegistry(): IssuerRegistryConfig | null {
  return resolveIssuerRegistry(import.meta.env);
}

const VERIFY_EDGE_TIMEOUT_MS = 45_000;
const VERIFY_EDGE_MAX_ATTEMPTS = 3;

/** Same credential kind as Semaphore `scope` preimage (must match Edge `credential_type`). */
export const ZK_SESSION_CREDENTIAL_TYPE = 'session_attribute';

/**
 * Stages a verification run passes through. Mirrors {@link ProofTimelineStage}
 * in `src/components/VerificationProofTimeline.tsx` so the UI can advance the
 * visible timeline when the actual RPC has reached the corresponding step
 * — instead of running on a fixed animation cadence.
 */
export type RunVerificationStage = 'identity' | 'commitment' | 'proof' | 'submit' | 'verified';

export interface RunVerificationOptions {
  /** Called as the underlying flow advances. Errors thrown by the callback are swallowed. */
  onStage?: (stage: RunVerificationStage) => void;
}

function safeStage(opts: RunVerificationOptions | undefined, stage: RunVerificationStage): void {
  const cb = opts?.onStage;
  if (!cb) return;
  try {
    cb(stage);
  } catch {
    // Caller bug — never propagate into the verification path.
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableInvokeFailure(err: {
  message?: string;
  context?: { status?: number };
}): boolean {
  const status = err.context?.status;
  if (status === 429 || status === 503 || status === 504 || status === 502) return true;
  const m = err.message ?? '';
  if (/failed to fetch|networkerror|load failed/i.test(m)) return true;
  return false;
}

async function invokeVerifyWithTimeout(
  supabase: SupabaseClient<Database>,
  body: Record<string, unknown>,
): Promise<{ data: unknown; error: { message: string; context?: { status?: number } } | null }> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('VERIFY_TIMEOUT')), VERIFY_EDGE_TIMEOUT_MS),
  );
  return Promise.race([
    supabase.functions.invoke('verify-zk-proof', { body }),
    timeoutPromise,
  ]) as Promise<{
    data: unknown;
    error: { message: string; context?: { status?: number } } | null;
  }>;
}

/**
 * **Production path (default when `VITE_ZK_STUB` is unset or `false`):** generates a Semaphore proof in-browser and
 * verifies it via the `verify-zk-proof` Edge Function — this is the real ZK flow for demos and partners.
 * **Dev-only:** `VITE_ZK_STUB=true` swaps in a fast hash-only stub (not zero-knowledge); `ZkStubBanner` warns in the shell.
 */
export async function runVerification(
  supabase: SupabaseClient<Database>,
  credentialType: CredentialType,
  rawInput: string,
  options?: RunVerificationOptions,
): Promise<ZKProof> {
  if (USE_HASH_STUB) {
    addZkProofBreadcrumb('stub_hash', 'start', { credentialType });
    safeStage(options, 'identity');
    try {
      const { generateStubProof } = await import('./zkVerifier');
      safeStage(options, 'commitment');
      safeStage(options, 'proof');
      const proof = await generateStubProof(credentialType, rawInput);
      safeStage(options, 'submit');
      safeStage(options, 'verified');
      addZkProofBreadcrumb('stub_hash', 'success', { credentialType });
      return proof;
    } catch {
      addZkProofBreadcrumb('stub_hash', 'error', {
        credentialType,
        errorCode: 'stub_generate_failed',
      });
      throw new Error(
        'Verification failed (demo hash mode). Turn off VITE_ZK_STUB for production pilots.',
      );
    }
  }

  const issuer = getIssuerRegistry();
  const issuerEnforced = issuer !== null;

  addZkProofBreadcrumb('generate_local', 'start', { credentialType, issuerEnforced });
  safeStage(options, 'identity');
  const { generateSemaphoreProof } = await import('./zkVerifier');
  const { semaphoreProofToWireFormat } = await import('./zk/serializeSemaphoreProof');
  let semaphoreProof;
  try {
    safeStage(options, 'commitment');
    const rawProof = await generateSemaphoreProof(
      credentialType,
      rawInput.trim(),
      issuer ? { issuerGroupId: issuer.groupId, issuerManifestFetcher: issuer.fetcher } : undefined,
    );
    safeStage(options, 'proof');
    semaphoreProof = semaphoreProofToWireFormat(rawProof);
    addZkProofBreadcrumb('generate_local', 'success', { credentialType, issuerEnforced });
  } catch {
    addZkProofBreadcrumb('generate_local', 'error', {
      credentialType,
      errorCode: 'local_generate_failed',
      issuerEnforced,
    });
    throw new Error('Could not generate a verification proof in your browser.');
  }

  const body: {
    attribute_scope: string;
    credential_type: string;
    semaphore_proof: typeof semaphoreProof;
    issuer_group_id?: string;
  } = {
    attribute_scope: rawInput.trim(),
    credential_type: credentialType,
    semaphore_proof: semaphoreProof,
  };
  if (issuer) {
    body.issuer_group_id = issuer.groupId;
  }

  addZkProofBreadcrumb('invoke_verify_edge', 'start', { credentialType, issuerEnforced });
  safeStage(options, 'submit');

  for (let attempt = 0; attempt < VERIFY_EDGE_MAX_ATTEMPTS; attempt++) {
    try {
      const { data, error } = await invokeVerifyWithTimeout(supabase, body);

      if (!error) {
        try {
          const proof = parseVerifyZkProofResponse(data);
          addZkProofBreadcrumb('invoke_verify_edge', 'success', { credentialType, issuerEnforced });
          safeStage(options, 'verified');
          return proof;
        } catch (e) {
          if (e instanceof VerifyZkProofParseError) {
            addZkProofBreadcrumb('invoke_verify_edge', 'error', {
              credentialType,
              errorCode: 'response_invalid',
              issuerEnforced,
            });
            throw new Error('Verification service returned an unexpected response. Try again.');
          }
          throw e;
        }
      }

      const bodyErr = parseVerifyZkProofErrorBody(data);
      const msg = bodyErr?.message ?? error.message;

      const retry = attempt < VERIFY_EDGE_MAX_ATTEMPTS - 1 && isRetryableInvokeFailure(error);

      addZkProofBreadcrumb('invoke_verify_edge', 'error', {
        credentialType,
        errorCode: mapEdgeCodeToBreadcrumb(bodyErr?.errorCode),
        issuerEnforced,
      });

      if (retry) {
        await sleep(400 * 2 ** attempt);
        continue;
      }

      throw new Error(msg || 'Verification failed');
    } catch (e) {
      if (e instanceof Error && e.message === 'VERIFY_TIMEOUT') {
        addZkProofBreadcrumb('invoke_verify_edge', 'error', {
          credentialType,
          errorCode: 'invoke_timeout',
          issuerEnforced,
        });
        if (attempt < VERIFY_EDGE_MAX_ATTEMPTS - 1) {
          await sleep(400 * 2 ** attempt);
          continue;
        }
        throw new Error('Verification timed out. Check your connection and try again.');
      }
      throw e;
    }
  }

  throw new Error('Verification failed');
}

function mapEdgeCodeToBreadcrumb(code?: string): ZkProofBreadcrumbErrorCode {
  void code;
  return 'invoke_failed';
}
