#!/usr/bin/env node
/**
 * Project Cursor hook: gate destructive shell commands.
 * Reads JSON from stdin; writes a permission decision to stdout.
 */
import { stdin } from 'node:process';

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

function decide(command) {
  const cmd = String(command ?? '');

  const denyPatterns = [
    /\bgit\s+push\s+[^\n]*--force\b/i,
    /\bgit\s+push\s+[^\n]*\s-f\b/i,
    /\bgit\s+push\s+[^\n]*\s--force-with-lease\b/i,
    /\bgit\s+reset\s+--hard\b/i,
    /\bgit\s+clean\s+[^\n]*-f/i,
    /\bgit\s+checkout\s+[^\n]*--theirs\b/i,
    /\bgit\s+filter-repo\b/i,
    /\bgit\s+filter-branch\b/i,
  ];

  for (const pattern of denyPatterns) {
    if (pattern.test(cmd)) {
      return {
        permission: 'deny',
        user_message:
          'Blocked destructive git command. SquadRidge policy: no force-push / hard reset / filter-history from the agent without an explicit human-run command.',
        agent_message:
          'A project hook denied a destructive git command. Ask the user to run it manually if truly required.',
      };
    }
  }

  const askPatterns = [
    /\bsupabase\s+db\s+push\b/i,
    /\bsupabase\s+db\s+reset\b/i,
    /\bsupabase\s+functions\s+deploy\b/i,
    /\brm\s+-rf\s+(\.|\/|src|supabase)\b/i,
    /\bRemove-Item\s+[^\n]*-Recurse\b/i,
  ];

  for (const pattern of askPatterns) {
    if (pattern.test(cmd)) {
      return {
        permission: 'ask',
        user_message: 'This command can change shared infrastructure or delete files. Review before continuing.',
        agent_message: 'A project hook requested confirmation for a high-impact shell command.',
      };
    }
  }

  return { permission: 'allow' };
}

const raw = await readStdin();
let input = {};
try {
  input = raw.trim() ? JSON.parse(raw) : {};
} catch {
  // Fail open on malformed input unless hooks.json sets failClosed.
  process.stdout.write(JSON.stringify({ permission: 'allow' }));
  process.exit(0);
}

process.stdout.write(JSON.stringify(decide(input.command)));
process.exit(0);
