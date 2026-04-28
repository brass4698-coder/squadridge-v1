/**
 * Run `npm run bundle:ingest-message` after changing `edgeHandler.ts` or redaction/crypto deps.
 */
import handler from './edge.bundle.mjs';

Deno.serve(handler);
