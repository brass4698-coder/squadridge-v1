/**
 * Verifies a Semaphore proof server-side (`verifyProof`) and persists commitments + nullifier.
 * Request body: { attribute_scope, credential_type, semaphore_proof }.
 */
import { handleZkProofPost } from '../_shared/handleZkProofVerification.ts';

Deno.serve(handleZkProofPost);
