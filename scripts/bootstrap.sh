#!/usr/bin/env bash
set -euo pipefail

command -v node >/dev/null || { echo "node is required" >&2; exit 1; }
command -v pi >/dev/null || {
  echo "pi is not installed. Install Pi first, then rerun bootstrap." >&2
  exit 1
}

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
"$ROOT/scripts/install.sh"

node "$ROOT/scripts/materialize-profile.mjs" pi >/dev/null
node "$ROOT/scripts/materialize-profile.mjs" pi-dev >/dev/null

echo "Profiles ready: pi, pi-dev"
