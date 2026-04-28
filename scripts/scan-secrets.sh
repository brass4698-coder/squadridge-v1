#!/usr/bin/env bash
# scripts/scan-secrets.sh
#
# Scan the repository for accidentally committed secrets.
# Designed to run as a pre-commit hook or in CI.
#
# Usage:
#   bash scripts/scan-secrets.sh          # scan staged files
#   bash scripts/scan-secrets.sh --all    # scan entire working tree
#
# Dependencies (auto-detected, warnings only if missing):
#   - git-secrets (https://github.com/awslabs/git-secrets)
#   - truffleHog  (https://github.com/trufflesecurity/trufflehog)
#   - gitleaks    (https://github.com/gitleaks/gitleaks)
#
# Status: SCAFFOLD — the patterns below are a starting set.
# Extend BLOCKED_PATTERNS as you add new secret types.

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
SCAN_ALL="${1:-}"
FAILED=0

echo "=== SquadRidge secrets scan ==="
echo "Root: $ROOT"
echo ""

# ---------------------------------------------------------------------------
# Pattern-based scan (no external tools required)
# ---------------------------------------------------------------------------

# Patterns that should never appear in committed files.
BLOCKED_PATTERNS=(
  # AWS
  'AKIA[0-9A-Z]{16}'
  'aws_secret_access_key\s*=\s*[A-Za-z0-9+/]{40}'
  # Generic high-entropy keys
  'sk_live_[a-zA-Z0-9]+'
  'sk_test_[a-zA-Z0-9]+'
  'xox[baprs]-[0-9A-Za-z\-]+'
  # Private keys
  '-----BEGIN (RSA|EC|OPENSSH|PGP) PRIVATE KEY-----'
  # Supabase service-role JWT prefix
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[^"'"'"' ]+\.[^"'"'"' ]+'
  # Generic password assignments
  'password\s*[:=]\s*["\'"'"'][^"'"'"']{8,}["\'"'"']'
  # Generic API key assignments
  'api_key\s*[:=]\s*["\'"'"'][^"'"'"']{16,}["\'"'"']'
)

EXCLUDE_PATHS=(
  '.git'
  'node_modules'
  'dist'
  'coverage'
  '.env.example'
  'scripts/scan-secrets.sh'  # This file contains the patterns themselves
)

build_exclude_args() {
  local args=()
  for p in "${EXCLUDE_PATHS[@]}"; do
    args+=("--exclude-dir=$p" "--exclude=$p")
  done
  echo "${args[@]}"
}

echo "--- Pattern scan ---"
for pattern in "${BLOCKED_PATTERNS[@]}"; do
  # shellcheck disable=SC2046
  if grep -rE "$pattern" \
       --exclude-dir=.git \
       --exclude-dir=node_modules \
       --exclude-dir=dist \
       --exclude-dir=coverage \
       --exclude='*.example' \
       --exclude='scan-secrets.sh' \
       "$ROOT" 2>/dev/null | grep -v "^Binary"; then
    echo "FAIL: Pattern matched: $pattern"
    FAILED=1
  fi
done

if [ "$FAILED" -eq 0 ]; then
  echo "PASS: No secret patterns found."
fi
echo ""

# ---------------------------------------------------------------------------
# git-secrets (optional)
# ---------------------------------------------------------------------------

if command -v git-secrets &>/dev/null; then
  echo "--- git-secrets ---"
  git-secrets --scan 2>&1 && echo "PASS: git-secrets clean" || { echo "FAIL: git-secrets found issues"; FAILED=1; }
  echo ""
else
  echo "INFO: git-secrets not installed — skipping (install: https://github.com/awslabs/git-secrets)"
  echo ""
fi

# ---------------------------------------------------------------------------
# gitleaks (optional)
# ---------------------------------------------------------------------------

if command -v gitleaks &>/dev/null; then
  echo "--- gitleaks ---"
  if [ "$SCAN_ALL" = "--all" ]; then
    gitleaks detect --source="$ROOT" --no-git 2>&1 && echo "PASS: gitleaks clean" || { echo "FAIL: gitleaks found leaks"; FAILED=1; }
  else
    gitleaks protect --staged 2>&1 && echo "PASS: gitleaks staged clean" || { echo "FAIL: gitleaks found staged leaks"; FAILED=1; }
  fi
  echo ""
else
  echo "INFO: gitleaks not installed — skipping (install: https://github.com/gitleaks/gitleaks)"
  echo ""
fi

# ---------------------------------------------------------------------------
# Result
# ---------------------------------------------------------------------------

if [ "$FAILED" -ne 0 ]; then
  echo "=== SCAN FAILED — do not commit ==="
  exit 1
else
  echo "=== SCAN PASSED ==="
  exit 0
fi
