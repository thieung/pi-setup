#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_DIR="${HOME}/.local/bin"
mkdir -p "$BIN_DIR"

ln -sfn "$ROOT/bin/pi-profile" "$BIN_DIR/pi-profile"

cat <<EOF
Installed:
  $BIN_DIR/pi-profile

Add to PATH if needed:
  export PATH="\$HOME/.local/bin:\$PATH"

Usage:
  pi-profile pi
  pi-profile pi-dev
  pi-profile list
EOF
