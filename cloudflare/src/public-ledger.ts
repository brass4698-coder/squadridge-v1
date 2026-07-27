/**
 * Stub Worker: public ledger artifact fetch + SHA-256 verification.
 *
 * NOT production. Does not replace Supabase `outcome_records` / Vite `/ledger`.
 * See docs/adr/006-cloudflare-workers-room-record.md and ../README.md.
 */

import { chainStepSha256, sha256Hex } from './hash';
import type { HashVerifyResult, PublicLedgerArtifact, PublicLedgerEnv } from './types';

export { sha256Hex, chainStepSha256 };
export type { PublicLedgerArtifact, HashVerifyResult, PublicLedgerEnv };

export async function verifyArtifact(artifact: PublicLedgerArtifact): Promise<HashVerifyResult> {
  if (!artifact.recordId || !artifact.canonicalText || !artifact.contentSha256) {
    return { ok: false, reason: 'missing_fields' };
  }

  const computed = await sha256Hex(artifact.canonicalText);
  if (computed !== artifact.contentSha256.toLowerCase()) {
    return { ok: false, reason: 'content_mismatch' };
  }

  if (artifact.chainSha256 === undefined) {
    return { ok: true, contentSha256: computed, chainOk: null };
  }

  const expectedChain = await chainStepSha256(artifact.prevChainSha256, computed);
  if (expectedChain !== artifact.chainSha256.toLowerCase()) {
    return { ok: false, reason: 'chain_mismatch' };
  }

  return { ok: true, contentSha256: computed, chainOk: true };
}

async function handleVerify(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const artifact = body as PublicLedgerArtifact;
  const result = await verifyArtifact(artifact);
  return json(result, result.ok ? 200 : 422);
}

async function handleGetRecord(recordId: string, env: PublicLedgerEnv): Promise<Response> {
  if (!env.LEDGER_BUCKET) {
    return json(
      {
        error: 'r2_not_bound',
        message:
          'Stub Worker: bind LEDGER_BUCKET in wrangler.toml for public artifacts only. Production ledger remains Supabase.',
        recordId,
      },
      501,
    );
  }

  const object = await env.LEDGER_BUCKET.get(`records/${recordId}.json`);
  if (!object) {
    return json({ error: 'not_found', recordId }, 404);
  }

  const artifact = JSON.parse(await object.text()) as PublicLedgerArtifact;
  const verification = await verifyArtifact(artifact);
  return json({ artifact, verification });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export default {
  async fetch(request: Request, env: PublicLedgerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({
        ok: true,
        mode: env.SQUADRIDGE_LEDGER_MODE ?? 'stub',
        productionDefault: false,
        note: 'Supabase + Vite remain the live stack',
      });
    }

    if (request.method === 'POST' && url.pathname === '/verify') {
      return handleVerify(request);
    }

    const recordMatch = url.pathname.match(/^\/records\/([^/]+)$/);
    if (request.method === 'GET' && recordMatch) {
      return handleGetRecord(decodeURIComponent(recordMatch[1]), env);
    }

    return json(
      {
        error: 'not_found',
        routes: ['GET /health', 'POST /verify', 'GET /records/:recordId'],
      },
      404,
    );
  },
};
