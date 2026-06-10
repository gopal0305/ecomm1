#!/usr/bin/env bash
set -euo pipefail

# Status wrapper.

require_root() {
  if [[ "$(id -u)" -ne 0 ]]; then
    echo "Run as root (sudo)." >&2
    exit 1
  fi
}

require_root

systemctl status --no-pager ecomm-backend.service ecomm-frontend.service || true

