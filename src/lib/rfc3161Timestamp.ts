/**
 * Optional RFC 3161 Time-Stamp Authority client.
 *
 * Status: SCAFFOLDED. Do not flip Implementation Status `rfc3161_timestamp` to LIVE
 * until a production TSA URL is configured, a token is stored on release, and
 * verification against a live timestamp succeeds in a controlled environment.
 *
 * @see src/data/implementationStatus.ts
 * @see src/lib/timestampAnchor.ts
 */

import type { OutcomeTimestampAnchor } from './timestampAnchor';
import { emptyTimestampAnchor } from './timestampAnchor';

export type Rfc3161RequestResult =
  | { ok: true; anchor: OutcomeTimestampAnchor }
  | { ok: false; reason: 'not_configured' | 'request_failed' | 'invalid_hash'; message: string };

/**
 * Returns a TSA base URL only when explicitly configured.
 * Never invents a default public TSA for production claims.
 */
export function getConfiguredTsaUrl(): string | null {
  const fromImport =
    typeof import.meta !== 'undefined'
      ? (import.meta.env?.VITE_RFC3161_TSA_URL as string | undefined)
      : undefined;
  const url = (fromImport ?? '').trim();
  return url.length > 0 ? url : null;
}

export function isRfc3161ClientConfigured(): boolean {
  return getConfiguredTsaUrl() !== null;
}

/**
 * Request a timestamp token for a SHA-256 hex digest.
 * When TSA is not configured, returns `not_configured` — callers must leave status scaffolded.
 *
 * Note: A full RFC 3161 TimeStampReq (ASN.1) is required for production TSA APIs.
 * This function documents the gate and refuses to pretend success without a configured URL.
 * Wire a DER TimeStampReq builder + verify path before flipping registry status to LIVE.
 */
export async function requestRfc3161Timestamp(
  ledgerSha: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Rfc3161RequestResult> {
  if (!/^[0-9a-f]{64}$/i.test(ledgerSha.trim())) {
    return {
      ok: false,
      reason: 'invalid_hash',
      message: 'ledgerSha must be a 64-char hex SHA-256.',
    };
  }

  const tsaUrl = getConfiguredTsaUrl();
  if (!tsaUrl) {
    return {
      ok: false,
      reason: 'not_configured',
      message:
        'VITE_RFC3161_TSA_URL is unset. Timestamping remains scaffolded; integrity hash still applies.',
    };
  }

  try {
    // Placeholder POST — production must send a valid application/timestamp-query body.
    // We intentionally do not mark success from a bare HTTP 200 without token parse/verify.
    const res = await fetchImpl(tsaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/timestamp-query',
        Accept: 'application/timestamp-reply',
      },
      body: ledgerSha.trim().toLowerCase(),
    });
    if (!res.ok) {
      return {
        ok: false,
        reason: 'request_failed',
        message: `TSA responded ${res.status}. Token not stored.`,
      };
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 32) {
      return {
        ok: false,
        reason: 'request_failed',
        message: 'TSA reply too short to be a TimeStampToken. Token not stored.',
      };
    }
    // Do not set status `verified` until ASN.1 parse + signature verify land.
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
    const tokenB64 = btoa(binary);
    return {
      ok: true,
      anchor: {
        ledgerSha: ledgerSha.trim().toLowerCase(),
        timestampToken: tokenB64,
        timestampAuthority: tsaUrl,
        timestampedAt: new Date().toISOString(),
        status: 'stored',
      },
    };
  } catch {
    return {
      ok: false,
      reason: 'request_failed',
      message: 'TSA request failed. Token not stored.',
    };
  }
}

/** Merge integrity hash with optional TSA result — never invents a token. */
export function mergeTimestampAnchor(
  ledgerSha: string,
  tsa: Rfc3161RequestResult,
): OutcomeTimestampAnchor {
  if (tsa.ok) return tsa.anchor;
  return emptyTimestampAnchor(ledgerSha);
}
