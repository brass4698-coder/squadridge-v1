#!/usr/bin/env bash
# =============================================================================
# scan-secrets.sh — local secret scanning utility
# =============================================================================
#
# SCAFFOLD — This script is a starting point for catching accidentally committed
# secrets before they reach GitHub. It is NOT a replacement for a proper secret
# manager or CI-level scanning (Dependabot, GitHub Secret Scanning, gitleaks).
#
# What this covers:
#   1. gitleaks scan (if installed) — comprehensive secret pattern matching.
#   2. Fallback grep scan — simple regex patterns for common secret shapes.
#   3. Instructions for what to do if a secret is found.
#
# How to use:
#   Run before pushing: bash scripts/scan-secrets.sh
#   Or integrate into pre-commit (see .husky/pre-commit).
#
# What to do if a secret is found:
#   1. DO NOT push. Do not try to amend or rewrite history in this PR.
#   2. Rotate the secret immediately — revoke the old key, generate a new one.
#   3. Contact the key provider (Supabase, Sentry, AWS, etc.) to confirm revocation.
#   4. After rotating, open a separate PR to document the incident in
#      docs/operations/incidents.md.
#   5. If the secret was already pushed to a remote branch:
#      - Treat the secret as compromised even if the branch was private.
#      - Consider git filter-repo or BFG to rewrite history on the main branch
#        (coordinate with all team members first — this rewrites shared history).
#      - GitHub Support can wipe cached views of the secret if needed.
#
# Limitations:
#   - grep patterns catch common shapes but not all. gitleaks is more complete.
#   - This script only scans tracked files in the current working tree.
#     Use 'gitleaks detect --source . --log-opts="HEAD~10..HEAD"' to scan recent commits.
#
# =============================================================================

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
EXIT_CODE=0

echo "=== SquadRidge secret scan ==="
echo "Scanning: $REPO_ROOT"
echo ""

# ---------------------------------------------------------------------------
# 1. gitleaks (preferred — install with: brew install gitleaks)
# ---------------------------------------------------------------------------

if command -v gitleaks &>/dev/null; then
  echo "[gitleaks] Running full scan..."
  if gitleaks detect --source "$REPO_ROOT" --no-banner --redact; then
    echo "[gitleaks] No secrets found."
  else
    echo ""
    echo "!!! gitleaks found potential secrets — see output above. DO NOT PUSH. !!!"
    echo "    Rotate any exposed credentials immediately."
    EXIT_CODE=1
  fi
else
  echo "[gitleaks] Not installed. Install with: brew install gitleaks"
  echo "           Falling back to grep patterns (less comprehensive)..."
  echo ""
fi

# ---------------------------------------------------------------------------
# 2. Grep fallback — common secret patterns
# ---------------------------------------------------------------------------

echo "[grep] Scanning for common secret patterns in tracked files..."

# Files to skip (build artifacts, lock files, this script itself)
EXCLUDE_PATTERN='node_modules|dist|\.git|package-lock\.json|\.snap|scripts/scan-secrets\.sh'

# Pattern list: (description, regex)
declare -a PATTERNS=(
  "AWS Access Key:AKIA[0-9A-Z]{16}"
  "AWS Secret Key:[0-9a-zA-Z/+]{40}"
  "Supabase Service Role:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\..*service_role"
  "Generic JWT:eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"
  "Sentry DSN:https://[0-9a-f]{32}@o[0-9]+\.ingest\.sentry\.io"
  "GitHub Token:gh[pousr]_[A-Za-z0-9]{36,}"
  "Private Key Header:-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----"
  "Slack Token:xox[baprs]-[A-Za-z0-9]{10,48}"
  "Stripe Secret:sk_(live|test)_[A-Za-z0-9]{24,}"
)

FOUND_PATTERNS=0

for entry in "${PATTERNS[@]}"; do
  desc="${entry%%:*}"
  pattern="${entry#*:}"
  matches=$(git ls-files "$REPO_ROOT" | grep -Ev "$EXCLUDE_PATTERN" | \
    xargs grep -lE "$pattern" 2>/dev/null || true)
  if [[ -n "$matches" ]]; then
    echo "  [WARN] Possible $desc found in:"
    echo "$matches" | sed 's/^/         /'
    FOUND_PATTERNS=1
    EXIT_CODE=1
  fi
done

if [[ "$FOUND_PATTERNS" -eq 0 ]]; then
  echo "[grep] No common secret patterns found."
fi

echo ""

# ---------------------------------------------------------------------------
# 3. Check for .env files that should not be committed
# ---------------------------------------------------------------------------

echo "[env] Checking for committed .env files with real values..."

# .env.example and .env.test are intentionally committed (placeholders only).
# Any other .env file should not be committed.
COMMITTED_ENV=$(git ls-files "$REPO_ROOT" | grep -E '^\.(env)([^.]|$)' | \
  grep -Ev '(\.example|\.test|\.e2e)$' || true)

if [[ -n "$COMMITTED_ENV" ]]; then
  echo "  [WARN] Found committed .env files (should only be .env.example, .env.test, .env.e2e):"
  echo "$COMMITTED_ENV" | sed 's/^/         /'
  EXIT_CODE=1
else
  echo "[env] No unexpected .env files committed."
fi

echo ""
echo "=== Scan complete ==="

if [[ "$EXIT_CODE" -ne 0 ]]; then
  echo ""
  echo "ACTION REQUIRED: Potential secrets detected."
  echo "  1. Do NOT push this branch."
  echo "  2. Rotate any exposed credentials immediately."
  echo "  3. See docs/security/secrets-rotation.md for rotation procedures."
  echo ""
fi

exit "$EXIT_CODE"
