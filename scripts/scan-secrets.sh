#!/usr/bin/env bash
# scripts/scan-secrets.sh
#
# PURPOSE
# -------
# Non-destructive scan of the repository for accidentally committed secrets,
# API keys, tokens, or other high-entropy strings.
#
# IMPORTANT: This script is INFORMATIONAL only. It does NOT rewrite git history.
# If secrets are found:
#   1. Rotate the affected credentials IMMEDIATELY (assume they're compromised).
#   2. Follow the remediation steps at the bottom of this script.
#   3. THEN consider history cleanup — but only after rotation.
#
# See docs/security/secrets-rotation.md for the full rotation runbook.
#
# USAGE
# -----
#   bash scripts/scan-secrets.sh              # scan working tree + git history
#   bash scripts/scan-secrets.sh --staged     # scan only staged files (pre-commit)
#   bash scripts/scan-secrets.sh --no-history # skip git history, working tree only
#
# PREREQUISITES
# -------------
# Install one of the following (script tries each in order):
#
#   Option A: gitleaks (recommended)
#     brew install gitleaks             # macOS
#     apt-get install -y gitleaks       # Debian/Ubuntu (or download from GitHub releases)
#     https://github.com/zricethezav/gitleaks/releases
#
#   Option B: trufflehog (alternative)
#     pip install trufflehog
#     https://github.com/trufflesecurity/trufflehog
#
#   Option C: git-secrets (lightweight)
#     brew install git-secrets          # macOS
#     https://github.com/awslabs/git-secrets

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCAN_STAGED=false
SKIP_HISTORY=false

# ─── Parse args ───────────────────────────────────────────────────────────────

for arg in "$@"; do
  case "$arg" in
    --staged)     SCAN_STAGED=true ;;
    --no-history) SKIP_HISTORY=true ;;
    --help|-h)
      echo "Usage: $0 [--staged] [--no-history]"
      echo "  --staged      Scan only staged files (for pre-commit hooks)"
      echo "  --no-history  Skip git log history; scan working tree only"
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

# ─── Helper: check if a command exists ───────────────────────────────────────

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# ─── Scan with gitleaks ───────────────────────────────────────────────────────

scan_with_gitleaks() {
  echo "→ Scanning with gitleaks..."

  if "$SCAN_STAGED"; then
    # Pre-commit: scan only staged changes.
    gitleaks protect --staged --source="$REPO_ROOT" --verbose
  elif "$SKIP_HISTORY"; then
    # Scan working tree only (no git history).
    gitleaks detect --no-git --source="$REPO_ROOT" --verbose
  else
    # Full history scan (default; can be slow on large repos).
    gitleaks detect --source="$REPO_ROOT" --verbose
  fi
}

# ─── Scan with trufflehog ────────────────────────────────────────────────────

scan_with_trufflehog() {
  echo "→ Scanning with trufflehog..."

  if "$SKIP_HISTORY"; then
    trufflehog filesystem "$REPO_ROOT" --only-verified
  else
    trufflehog git "file://$REPO_ROOT" --only-verified
  fi
}

# ─── Scan with git-secrets (basic pattern matching) ─────────────────────────

scan_with_git_secrets() {
  echo "→ Scanning with git-secrets..."
  cd "$REPO_ROOT"
  git secrets --scan
  if ! "$SKIP_HISTORY"; then
    git secrets --scan-history
  fi
}

# ─── Fallback: grep for common patterns ──────────────────────────────────────

scan_with_grep() {
  echo "→ No dedicated secrets scanner found. Falling back to basic grep patterns."
  echo "  Install gitleaks for a more thorough scan: https://github.com/zricethezav/gitleaks"
  echo ""

  local found=0
  local patterns=(
    # AWS
    'AKIA[0-9A-Z]{16}'
    'aws_secret_access_key\s*=\s*[A-Za-z0-9+/]{40}'
    # Generic API key patterns
    'api[_-]?key\s*[:=]\s*["\047][A-Za-z0-9_\-]{20,}'
    'secret[_-]?key\s*[:=]\s*["\047][A-Za-z0-9_\-]{20,}'
    # Supabase
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.'
    # Private keys
    'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY'
    # Sentry DSN
    'https://[a-f0-9]{32}@o[0-9]+\.ingest\.sentry\.io'
  )

  for pattern in "${patterns[@]}"; do
    # Search tracked files (not .git directory, not node_modules)
    if grep -rEn --include="*.ts" --include="*.tsx" --include="*.js" \
              --include="*.json" --include="*.env" --include="*.yaml" \
              --include="*.yml" --exclude-dir=".git" --exclude-dir="node_modules" \
              --exclude-dir="dist" --exclude-dir="coverage" \
              "$pattern" "$REPO_ROOT" 2>/dev/null; then
      echo "  ↑ Potential secret found (pattern: $pattern)"
      found=1
    fi
  done

  if [ "$found" -eq 0 ]; then
    echo "  No obvious patterns found. Run gitleaks for a thorough scan."
  fi

  return "$found"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

echo "=================================================="
echo "SquadRidge secrets scan"
echo "Repo: $REPO_ROOT"
echo "Mode: $([ "$SCAN_STAGED" = true ] && echo 'staged' || echo 'full') / $([ "$SKIP_HISTORY" = true ] && echo 'no-history' || echo 'with-history')"
echo "=================================================="
echo ""

SCAN_EXIT=0

if command_exists gitleaks; then
  scan_with_gitleaks || SCAN_EXIT=$?
elif command_exists trufflehog; then
  scan_with_trufflehog || SCAN_EXIT=$?
elif command_exists git-secrets; then
  scan_with_git_secrets || SCAN_EXIT=$?
else
  scan_with_grep || SCAN_EXIT=$?
fi

echo ""
echo "=================================================="

if [ "$SCAN_EXIT" -ne 0 ]; then
  echo "⚠️  POTENTIAL SECRETS DETECTED (exit code: $SCAN_EXIT)"
  echo ""
  echo "REMEDIATION STEPS"
  echo "-----------------"
  echo "1. ROTATE the affected credentials IMMEDIATELY — assume they are compromised."
  echo "   See docs/security/secrets-rotation.md for provider-specific rotation steps."
  echo ""
  echo "2. Revoke the old credentials in the issuing service:"
  echo "   - Supabase: Dashboard → Project Settings → API Keys → Regenerate"
  echo "   - Sentry:   Settings → Security → API Keys → Revoke"
  echo "   - AWS KMS:  IAM → Access Keys → Deactivate & Delete"
  echo ""
  echo "3. Update secrets in all deployment environments:"
  echo "   - Vercel/Netlify: environment variable settings"
  echo "   - Supabase Edge: supabase secrets set KEY=value"
  echo "   - GitHub Actions: repo → Settings → Secrets"
  echo ""
  echo "4. AFTER rotation, decide whether to clean history."
  echo "   git-filter-repo or BFG Repo-Cleaner can remove secrets from git history,"
  echo "   but this requires a force-push and ALL contributors to re-clone."
  echo "   Coordinate with your team before rewriting history."
  echo "   NOTE: This PR does NOT rewrite history. Rotation first, then decide."
  echo ""
  echo "5. Review .gitignore and .env.example to prevent future leaks."
  echo "   Add the leaked file pattern to .gitignore if needed."
  echo ""
  exit "$SCAN_EXIT"
else
  echo "✓ No secrets detected."
  echo ""
  echo "TIP: Run 'bash scripts/scan-secrets.sh' before every release."
  echo "     Add 'bash scripts/scan-secrets.sh --staged' to your pre-commit hook"
  echo "     for continuous protection. See .husky/pre-commit."
fi

echo "=================================================="
