#!/usr/bin/env bash
set -euo pipefail

log() { echo "[INFO] $*"; }
warn() { echo "[WARN] $*"; }
err() { echo "[ERROR] $*" >&2; }

require_root() {
  if [[ "$(id -u)" -ne 0 ]]; then
    err "This script should be run as root (or via sudo)."
    exit 1
  fi
}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

deploy_user_or_root() {
  # If a deployment user is provided and exists, use it; else fall back to root.
  local u="${1:-}"
  if [[ -n "$u" ]] && id "$u" >/dev/null 2>&1; then
    echo "$u"
  else
    echo "root"
  fi
}

ensure_dir() {
  local d="$1"
  mkdir -p "$d"
}

# Basic OS detection for Red Hat family.
is_redhat_like() {
  if [[ -f /etc/os-release ]]; then
    # shellcheck disable=SC1091
    . /etc/os-release
    if echo "${ID_LIKE:-}" | grep -qiE "rhel|fedora|centos"; then
      return 0
    fi
    if echo "${ID:-}" | grep -qiE "rhel|fedora|centos"; then
      return 0
    fi
  fi
  return 1
}

