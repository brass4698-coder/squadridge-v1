import { describe, it, expect, vi } from 'vitest';

import { processIngestRequest, type IngestDeps } from './processIngestMessage';

const FAKE_KEY = { type: 'fake-aes' } as unknown as CryptoKey;

interface MakeDepsOptions {
  user?: { id: string } | null;
  userErr?: { message: string } | null;
  membership?: { user_id: string } | null;
  membErr?: { message: string } | null;
  squad?: { message_encryption_key: string | null; archived_at: string | null } | null;
  squadErr?: { message: string } | null;
  insertResult?: { row?: unknown; err?: { message: string; code?: string } | null };
  redactImpl?: (body: string, squadId: string, userId: string) => Promise<string>;
  rateLimit?: (jwt: string, action: string) => Promise<void>;
  importKeyImpl?: (b64u: string) => Promise<CryptoKey>;
}

function makeDeps(opts: MakeDepsOptions = {}): IngestDeps {
  const user = opts.user === undefined ? { id: 'user-1' } : opts.user;
  const userErr = opts.userErr ?? null;
  const membership = opts.membership === undefined ? { user_id: 'user-1' } : opts.membership;
  const membErr = opts.membErr ?? null;
  const squad =
    opts.squad === undefined
      ? { message_encryption_key: 'aes-key-base64url', archived_at: null }
      : opts.squad;
  const squadErr = opts.squadErr ?? null;
  const insertResult = opts.insertResult ?? {
    row: {
      id: 'msg-1',
      squad_id: 'squad-1',
      sender_id: 'user-1',
      payload_ciphertext: 'enc-out',
    },
    err: null,
  };

  const userSupabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: userErr }),
    },
    from: vi.fn((table: string) => {
      if (table === 'squad_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: membership, error: membErr }),
              }),
            }),
          }),
        };
      }
      if (table === 'squads') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: squad, error: squadErr }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected user-table: ${table}`);
    }),
  };

  const adminSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'messages') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: insertResult.row ?? null,
                  error: insertResult.err ?? null,
                }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected admin-table: ${table}`);
    }),
  };

  return {
    cors: { 'X-Test': '1' },
    userSupabase: userSupabase as unknown as IngestDeps['userSupabase'],
    adminSupabase: adminSupabase as unknown as IngestDeps['adminSupabase'],
    redact: opts.redactImpl ?? ((body) => Promise.resolve(`[redacted] ${body}`)),
    decode: (cipher) => Promise.resolve(`decoded:${cipher}`),
    encode: (plain) => Promise.resolve(`encoded:${plain}`),
    importKey: opts.importKeyImpl ?? (() => Promise.resolve(FAKE_KEY)),
    rateLimit: opts.rateLimit,
  };
}

function postJson(body: Record<string, unknown>, headers: Record<string, string> = {}): Request {
  return new Request('https://example.test/functions/v1/ingest-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

const validBody = { squad_id: 'squad-1', payload_ciphertext: 'enc-in' };
const authHeader = { Authorization: 'Bearer jwt-token' };

describe('processIngestRequest', () => {
  it('returns 200 with inserted row on the happy path', async () => {
    const deps = makeDeps();
    const res = await processIngestRequest(postJson(validBody, authHeader), deps);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      message: {
        id: 'msg-1',
        squad_id: 'squad-1',
        sender_id: 'user-1',
        payload_ciphertext: 'enc-out',
      },
    });
  });

  it('happy path persists ciphertext-only shape — no plaintext / redacted-text columns', async () => {
    let capturedInsert: Record<string, unknown> | null = null;

    const deps = makeDeps();
    deps.adminSupabase = {
      from: vi.fn((table: string) => {
        if (table !== 'messages') throw new Error(`unexpected admin table ${table}`);
        return {
          insert: (row: Record<string, unknown>) => {
            capturedInsert = row;
            return {
              select: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: 'msg-1',
                      squad_id: 'squad-1',
                      sender_id: 'user-1',
                      payload_ciphertext: row.payload_ciphertext,
                    },
                    error: null,
                  }),
              }),
            };
          },
        };
      }),
    } as unknown as IngestDeps['adminSupabase'];

    const res = await processIngestRequest(postJson(validBody, authHeader), deps);
    expect(res.status).toBe(200);

    // The handler must write the ciphertext output of `encode(redact(decode(input)))`
    // and only the three structural columns (squad_id, sender_id, payload_ciphertext).
    // Real Postgres has no `plaintext` / `redacted_body` columns; this asserts the
    // handler keeps that contract even if a future change adds rows to the insert.
    expect(capturedInsert).not.toBeNull();
    expect(Object.keys(capturedInsert!).sort()).toEqual([
      'payload_ciphertext',
      'sender_id',
      'squad_id',
    ]);
    expect(capturedInsert).not.toHaveProperty('plaintext');
    expect(capturedInsert).not.toHaveProperty('redacted_body');
    expect(capturedInsert).not.toHaveProperty('content');

    // Response body mirrors the inserted row (the test mock returns it verbatim) and
    // must not include any plaintext-bearing field either.
    const responseJson = (await res.clone().json()) as { message: Record<string, unknown> };
    expect(Object.keys(responseJson.message).sort()).toEqual([
      'id',
      'payload_ciphertext',
      'sender_id',
      'squad_id',
    ]);
  });

  it('responds to OPTIONS preflight with 200 and CORS headers', async () => {
    const deps = makeDeps();
    const req = new Request('https://example.test/functions/v1/ingest-message', {
      method: 'OPTIONS',
    });
    const res = await processIngestRequest(req, deps);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Test')).toBe('1');
  });

  it('returns 405 for non-POST methods', async () => {
    const deps = makeDeps();
    const req = new Request('https://example.test/functions/v1/ingest-message', { method: 'GET' });
    const res = await processIngestRequest(req, deps);
    expect(res.status).toBe(405);
  });

  it('returns 401 when Authorization header is missing', async () => {
    const deps = makeDeps();
    const res = await processIngestRequest(postJson(validBody), deps);
    expect(res.status).toBe(401);
  });

  it('returns 401 when getUser fails', async () => {
    const deps = makeDeps({ user: null, userErr: { message: 'invalid' } });
    const res = await processIngestRequest(postJson(validBody, authHeader), deps);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid JSON', async () => {
    const deps = makeDeps();
    const req = new Request('https://example.test/functions/v1/ingest-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: '{not json',
    });
    const res = await processIngestRequest(req, deps);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid JSON');
  });

  it('returns 400 when fields are missing', async () => {
    const deps = makeDeps();
    const res = await processIngestRequest(postJson({ squad_id: '' }, authHeader), deps);
    expect(res.status).toBe(400);
  });

  it('returns 403 when caller is not a squad member', async () => {
    const deps = makeDeps({ membership: null });
    const res = await processIngestRequest(postJson(validBody, authHeader), deps);
    expect(res.status).toBe(403);
  });

  it('returns 400 when squad has no encryption key', async () => {
    const deps = makeDeps({ squad: { message_encryption_key: null, archived_at: null } });
    const res = await processIngestRequest(postJson(validBody, authHeader), deps);
    expect(res.status).toBe(400);
  });

  it('returns 403 when squad is archived', async () => {
    const deps = makeDeps({
      squad: { message_encryption_key: 'aes-key', archived_at: '2026-04-28T00:00:00Z' },
    });
    const res = await processIngestRequest(postJson(validBody, authHeader), deps);
    expect(res.status).toBe(403);
  });

  it('returns 500 when key import throws', async () => {
    const deps = makeDeps({ importKeyImpl: () => Promise.reject(new Error('bad key')) });
    const res = await processIngestRequest(postJson(validBody, authHeader), deps);
    expect(res.status).toBe(500);
  });

  it('returns 400 when redact rejects', async () => {
    const deps = makeDeps({
      redactImpl: () => Promise.reject(new Error('blocked phrase')),
    });
    const res = await processIngestRequest(postJson(validBody, authHeader), deps);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('blocked phrase');
  });

  it('returns 429 when rateLimit throws', async () => {
    const deps = makeDeps({
      rateLimit: () => Promise.reject(new Error('You\u2019re sending requests too quickly.')),
    });
    const res = await processIngestRequest(postJson(validBody, authHeader), deps);
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(typeof json.error).toBe('string');
  });

  it('returns 400 when admin insert errors', async () => {
    const deps = makeDeps({
      insertResult: { row: null, err: { message: 'fk violation', code: '23503' } },
    });
    const res = await processIngestRequest(postJson(validBody, authHeader), deps);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('fk violation');
    expect(json.code).toBe('23503');
  });
});
