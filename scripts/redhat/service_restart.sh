#!/usr/bin/env bash
set -euo pipefail

# Restart wrapper.

require_root() {
  if [[ "$(id -u)" -ne 0 ]]; then
    echo "Run as root (sudo)." >&2
    exit 1
  fi
}

require_root

systemctl restart ecomm-backend.service ecomm-frontend.service

echo "Services restarted."

