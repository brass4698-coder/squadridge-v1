#!/usr/bin/env node
/**
 * Project Cursor hook: block prompt submission when it looks like raw secrets were pasted.
 * Does not block discussions about secret handling.
 */
import { stdin } from 'node:process';

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

/** @param {string} prompt */
function findSecretLeak(prompt) {
  const checks = [
    {
      name: 'PEM private key',
      re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    },
    {
      name: 'AWS access key',
      re: /\bAKIA[0-9A-Z]{16}\b/,
    },
    {
      name: 'GitHub token',
      re: /\bghp_[A-Za-z0-9]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
    },
    {
      name: 'Supabase service-role style JWT',
      // Long JWT-shaped blobs; common when someone pastes service_role.
      re: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/,
    },
    {
      name: 'Stripe live secret',
      re: /\bsk_live_[A-Za-z0-9]{16,}\b/,
    },
    {
      name: 'Generic bearer assignment',
      re: /\b(?:SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY)\s*=\s*['"]?[A-Za-z0-9._\-]{24,}/,
    },
  ];

  for (const check of checks) {
    if (check.re.test(prompt)) return check.name;
  }
  return null;
}

const raw = await readStdin();
let input = {};
try {
  input = raw.trim() ? JSON.parse(raw) : {};
} catch {
  process.stdout.write(JSON.stringify({ continue: true }));
  process.exit(0);
}

const leak = findSecretLeak(String(input.prompt ?? ''));
if (leak) {
  process.stdout.write(
    JSON.stringify({
      continue: false,
      user_message: `Prompt blocked: looks like a real ${leak} was pasted. Remove the secret and reference env var names or .env.example placeholders instead.`,
    }),
  );
  process.exit(0);
}

process.stdout.write(JSON.stringify({ continue: true }));
process.exit(0);
