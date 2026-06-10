#!/usr/bin/env bash
set -euo pipefail

# Setup wrapper: enable+start services after deploy.
# Use: sudo bash scripts/redhat/service_setup.sh

require_root() {
  if [[ "$(id -u)" -ne 0 ]]; then
    echo "Run as root (sudo)." >&2
    exit 1
  fi
}

require_root

systemctl daemon-reload
systemctl enable --now ecomm-backend.service
systemctl enable --now ecomm-frontend.service

echo "Services started."

