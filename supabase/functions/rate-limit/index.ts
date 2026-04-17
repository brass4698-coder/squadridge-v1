/**
 * Upstash Redis-backed rate limit (10 req / 60s per user + action).
 */
import { Redis } from 'https://esm.sh/@upstash/redis@1.34.3';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { corsHeadersFor } from '../_shared/cors.ts';

const WINDOW_SEC = 60;
const MAX_PER_WINDOW = 10;

Deno.serve(async (req) => {
  const ch = corsHeadersFor(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: ch });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const url = Deno.env.get('UPSTASH_REDIS_REST_URL');
  const token = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');
  if (!url || !token) {
    return new Response(JSON.stringify({ error: 'Rate limit unavailable' }), {
      status: 503,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !anonKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  let action = 'default';
  try {
    const body = (await req.json()) as { action?: string };
    if (typeof body?.action === 'string' && body.action.length > 0) {
      action = body.action.slice(0, 64);
    }
  } catch {
    // empty body
  }

  const redis = new Redis({ url, token });
  const key = `rate:${user.id}:${action}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, WINDOW_SEC);
  if (count > MAX_PER_WINDOW) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { ...ch, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ allowed: true }), {
    status: 200,
    headers: { ...ch, 'Content-Type': 'application/json' },
  });
});
