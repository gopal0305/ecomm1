#!/usr/bin/env bash
set -euo pipefail

# Start wrapper.

require_root() {
  if [[ "$(id -u)" -ne 0 ]]; then
    echo "Run as root (sudo)." >&2
    exit 1
  fi
}

require_root

systemctl start ecomm-backend.service ecomm-frontend.service

echo "Services started."

