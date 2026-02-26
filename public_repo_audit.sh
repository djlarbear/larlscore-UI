#!/usr/bin/env bash
set -euo pipefail

# Audit the PUBLIC UI repo working tree for anything that should never be committed.
# Run from repo root.

ROOT="$(pwd)"

fail() { echo "FAIL: $1" >&2; exit 2; }

# Disallowed file globs / paths
DISALLOWED=(
  ".env"
  ".env.local"
  ".env.*.local"
  "**/*.key"
  "**/id_rsa"
  "**/*.pem"
  "**/*.db"
  "**/*.sqlite"
  "**/*.log"
  "betting"
  "memory"
  ".openclaw"
)

# Disallowed content markers
MARKERS_REGEX='(THE_ODDS_API_KEY|ODDSAPI_KEY|api[_-]?key\s*=|BEGIN PRIVATE KEY|ssh-rsa|-----BEGIN)'

# 1) Path-based checks (fast)
for p in "${DISALLOWED[@]}"; do
  # use bash globstar if available
  if [[ "$p" == "**"* ]]; then
    shopt -s globstar nullglob
    matches=( $p )
    shopt -u globstar nullglob
    if (( ${#matches[@]} > 0 )); then
      fail "Disallowed files present: $p"
    fi
  else
    if [ -e "$p" ]; then
      fail "Disallowed path present: $p"
    fi
  fi
done

# 2) Content marker scan (excluding deps)
# Exclude this script from matching its own regex.
if grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude=public_repo_audit.sh -E "$MARKERS_REGEX" . >/dev/null 2>&1; then
  echo "Potential secret marker(s) found:" >&2
  grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude=public_repo_audit.sh -E "$MARKERS_REGEX" . | head -80 >&2
  exit 3
fi

echo "OK: public repo audit passed"
