#!/usr/bin/env bash
# scripts/scan-git-secrets.sh
#
# Scans the full git history for accidentally committed secrets using gitleaks.
# If secrets are found, prints instructions for key rotation and history rewrite.
#
# Usage:
#   chmod +x scripts/scan-git-secrets.sh
#   ./scripts/scan-git-secrets.sh
#
# Requirements:
#   - gitleaks: https://github.com/gitleaks/gitleaks
#     Install: brew install gitleaks  OR  go install github.com/gitleaks/gitleaks/v8@latest
#     Or use the Docker image: docker run --rm -v "$(pwd):/repo" ghcr.io/gitleaks/gitleaks:latest detect --source /repo
#
# This script is safe to run on any branch. It does not modify the repository.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GITLEAKS_REPORT="${REPO_ROOT}/tmp/gitleaks-report.json"

echo "=== SquadRidge git secret scan ==="
echo "Repo: ${REPO_ROOT}"
echo ""

# Check gitleaks is available
if ! command -v gitleaks &>/dev/null; then
  echo "ERROR: gitleaks not found."
  echo ""
  echo "Install options:"
  echo "  macOS/Linux: brew install gitleaks"
  echo "  Go:          go install github.com/gitleaks/gitleaks/v8@latest"
  echo "  Docker:      docker run --rm -v \"\$(pwd):/repo\" ghcr.io/gitleaks/gitleaks:latest detect --source /repo --config /repo/.gitleaks.toml"
  echo ""
  echo "Alternatively, use truffleHog:"
  echo "  pip install truffleHog"
  echo "  trufflehog git file://. --only-verified"
  exit 1
fi

mkdir -p "${REPO_ROOT}/tmp"

echo "Running gitleaks against full git history..."
echo "(This may take a minute on large histories)"
echo ""

GITLEAKS_EXIT=0
gitleaks detect \
  --source "${REPO_ROOT}" \
  --config "${REPO_ROOT}/.gitleaks.toml" \
  --report-format json \
  --report-path "${GITLEAKS_REPORT}" \
  --log-level warn \
  || GITLEAKS_EXIT=$?

if [ "${GITLEAKS_EXIT}" -eq 0 ]; then
  echo "✅ No secrets detected in git history."
  echo ""
  echo "Tip: add a pre-commit hook or CI step to run gitleaks on every commit:"
  echo "  gitleaks protect --staged --config .gitleaks.toml"
  exit 0
fi

# Secrets found
echo ""
echo "⚠️  SECRETS DETECTED — action required!"
echo ""
echo "Report written to: ${GITLEAKS_REPORT}"
echo ""
cat "${GITLEAKS_REPORT}" 2>/dev/null | python3 -c "
import sys, json
try:
    findings = json.load(sys.stdin)
    for f in findings:
        print(f\"  [{f.get('RuleID','?')}] {f.get('File','?')}:{f.get('StartLine','?')} — {f.get('Description','?')}\")
    print(f\"\n  Total findings: {len(findings)}\")
except Exception as e:
    print(f'  (Could not parse JSON report: {e})')
" || true

echo ""
echo "=== REMEDIATION STEPS ==="
echo ""
echo "1. IMMEDIATELY rotate any exposed credentials:"
echo "   - Supabase: Dashboard → Settings → API Keys → Regenerate"
echo "   - Sentry DSN: Sentry Dashboard → Settings → Client Keys → Revoke"
echo "   - Upstash Redis: Upstash Console → Database → Rotate token"
echo "   - Any other key found: rotate in the respective service dashboard"
echo ""
echo "2. Remove secrets from git history using git-filter-repo (recommended):"
echo "   a. Install: pip install git-filter-repo"
echo "   b. Remove the file entirely:"
echo "      git filter-repo --path <secret-file> --invert-paths"
echo "   c. Or replace the secret value:"
echo "      git filter-repo --replace-text <(echo 'EXPOSED_KEY==>REDACTED')"
echo "   d. Force-push to remote (requires branch protection bypass — coordinate with team):"
echo "      git push origin --force --all"
echo "      git push origin --force --tags"
echo ""
echo "   Alternative (BFG Repo Cleaner):"
echo "   https://rtyley.github.io/bfg-repo-cleaner/"
echo ""
echo "3. Notify all collaborators to re-clone the repository after history rewrite."
echo ""
echo "4. Audit all systems that may have used the exposed credentials for unauthorised access."
echo ""
echo "5. Add the secret patterns to .gitleaks.toml allowlist ONLY if they are confirmed"
echo "   placeholders/non-sensitive. Never allowlist real credentials."
echo ""
echo "See docs/security/secrets-rotation.md for the full key rotation runbook."
exit 1
