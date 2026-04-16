/**
 * Same handler as `verify-zk-proof` (Semaphore v4 proof + server verification).
 * @deprecated Prefer invoking `verify-zk-proof`; kept for older clients.
 */
import { handleZkProofPost } from '../_shared/handleZkProofVerification.ts';

Deno.serve(handleZkProofPost);
