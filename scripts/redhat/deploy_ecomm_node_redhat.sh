#!/usr/bin/env bash
set -euo pipefail

# This script assumes your Red Hat host already has Node.js/npm.
# It does not install system Node automatically.


# Deploy ecomm (code sync + build + systemd unit install).
# Start/stop/restart/status are handled by wrapper scripts:
#   - service_setup.sh (enable+start)
#   - service_start.sh
#   - service_stop.sh
#   - service_restart.sh
#   - service_status.sh
#
# React frontend is built to static files and served by a small Node static server.
# Apache/nginx is NOT configured here.
#
# systemd units installed:
#   - ecomm-backend.service
#   - ecomm-frontend.service
#
# Default ports:
#   - frontend: 4000 (or $FRONTEND_PORT)
#   - backend: 8080 (or $BACKEND_PORT)


# Repo root can be overridden for remote deploys where the script is not located in the repo checkout.
# Example: sudo REPO_ROOT=/path/to/checkout bash scripts/redhat/deploy_ecomm_node_redhat.sh
ROOT_DIR="${REPO_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

: "${APP_NAME:=ecomm}"
: "${DEPLOY_ROOT:=/data/ecomm}"
: "${NODE_BACKEND_DIR:=$DEPLOY_ROOT/node-backend}"
: "${FRONTEND_DIR:=$DEPLOY_ROOT/frontend}"
: "${FRONTEND_BUILD_DIR:=$FRONTEND_DIR/dist}"
: "${BACKEND_PORT:=8090}"

: "${FRONTEND_PORT:=4000}"

# DB settings (Postgres)
: "${DB_HOST:=127.0.0.1}"
: "${DB_PORT:=5432}"
: "${DB_NAME:=ecomm}"
: "${DB_USER:=ecomm}"
: "${DB_PASSWORD:=ecomm}"

# JWT + CORS
: "${JWT_ISSUER:=ecomm}"
: "${JWT_SECRET:=change-this-secret-to-a-long-random-string}"
: "${CORS_ALLOWED_ORIGINS:=http://localhost:${FRONTEND_PORT}}"

# Optional: run DB init script on deploy (idempotent if schema already exists)
: "${RUN_DB_INIT:=true}"

require_root() {
  if [[ "$(id -u)" -ne 0 ]]; then
    echo "Run as root (or via sudo)." >&2
    exit 1
  fi
}

log() { echo "[DEPLOY] $*"; }
err() { echo "[ERROR] $*" >&2; }

have_cmd() { command -v "$1" >/dev/null 2>&1; }

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

install_prereqs() {
  if ! have_cmd node || ! have_cmd npm; then
    err "node/npm not found. Install Node.js LTS before running this script."
    err "(This script avoids auto-install to prevent breaking system package policy.)"
    exit 1
  fi

  if is_redhat_like; then
    if have_cmd dnf; then
      dnf -y install httpd-tools || true
    elif have_cmd yum; then
      yum -y install httpd-tools || true
    fi
  fi

  # Java not needed for node backend; only keep best-effort for completeness.
}

ensure_dir() { mkdir -p "$1"; }

sync_code() {
  # Copy source trees into $DEPLOY_ROOT (simple + robust; keeps deployment self-contained)
  # Preflight checks (fail clearly if ROOT_DIR is wrong / not accessible)
  log "Using ROOT_DIR=$ROOT_DIR"
  log "Source check: frontend/package.json=$ROOT_DIR/frontend/package.json"
  log "Source check: node-backend/package.json=$ROOT_DIR/node-backend/package.json"

  if [[ ! -f "$ROOT_DIR/frontend/package.json" ]]; then
    err "Frontend source sync failed: missing $ROOT_DIR/frontend/package.json"
    err "If the script runs on a different host, set REPO_ROOT to the correct repo checkout path."
    err "Debug: ls -la \"$ROOT_DIR\" (frontend dir check)"
    err "(expected: $ROOT_DIR/frontend/package.json)"
    ls -la "$ROOT_DIR" || true
    ls -la "$ROOT_DIR/frontend" || true
    exit 1
  fi


  if [[ ! -f "$ROOT_DIR/node-backend/package.json" ]]; then
    err "Backend source sync failed: missing $ROOT_DIR/node-backend/package.json"
    err "If the script runs on a different host, set REPO_ROOT to the correct repo checkout path."
    exit 1
  fi

  log "Syncing frontend -> $FRONTEND_DIR"
  rm -rf "$FRONTEND_DIR"
  mkdir -p "$FRONTEND_DIR"
  if have_cmd rsync; then
    rsync -a --delete "$ROOT_DIR/frontend/" "$FRONTEND_DIR/"
  else
    # fallback to cp -a (less robust for deletes)
    cp -a "$ROOT_DIR/frontend/." "$FRONTEND_DIR/"
  fi

  # Sanity check: frontend/package.json must exist before building
  if [[ ! -f "$FRONTEND_DIR/package.json" ]]; then
    err "Frontend source sync failed: missing $FRONTEND_DIR/package.json"
    exit 1
  fi

  log "Syncing node-backend -> $NODE_BACKEND_DIR"
  rm -rf "$NODE_BACKEND_DIR"
  mkdir -p "$NODE_BACKEND_DIR"
  if have_cmd rsync; then
    rsync -a --delete "$ROOT_DIR/node-backend/" "$NODE_BACKEND_DIR/"
  else
    cp -a "$ROOT_DIR/node-backend/." "$NODE_BACKEND_DIR/"
  fi

  # Sanity check: node-backend/package.json must exist before installing deps
  if [[ ! -f "$NODE_BACKEND_DIR/package.json" ]]; then
    err "Backend source sync failed: missing $NODE_BACKEND_DIR/package.json"
    exit 1
  fi
}



build_frontend() {
  log "Building frontend static assets..."
  (cd "$FRONTEND_DIR" && npm ci --silent || npm install)
  (cd "$FRONTEND_DIR" && npm run build)

  if [[ ! -d "$FRONTEND_BUILD_DIR" ]]; then
    err "Frontend build did not produce dist/ at $FRONTEND_BUILD_DIR"
    exit 1
  fi
}

install_backend_deps() {
  log "Installing backend dependencies..."
  (cd "$NODE_BACKEND_DIR" && npm ci --silent || npm install)
}

fix_frontend_env_copy_scope_bug_if_any() {
  # No-op placeholder.
  # Kept for compatibility with older versions of this script.
  true
}


maybe_init_db() {
  if [[ "$RUN_DB_INIT" != "true" ]]; then
    log "Skipping DB init (RUN_DB_INIT=$RUN_DB_INIT)"
    return 0
  fi

  log "Initializing DB schema + sample data (if scripts are configured)..."

  # node-backend init-db script uses backend/src/main/resources/... from Spring Boot,
  # but for node-backend it expects schema under backend/src/main/resources.
  # Since this repo still contains those schema.sql files under ./backend,
  # we run init-db after syncing (it will read from ./backend relative to repo root).

  # Provide env required by node-backend init
  export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
  export DB_USER
  export DB_PASSWORD
  export DB_HOST
  export DB_PORT
  export DB_NAME

  # Many environments may not need init; still run best-effort.
  (cd "$NODE_BACKEND_DIR" && npm run init-db) || {
    err "DB init failed (continuing). Check Postgres connectivity and schema files.";
  }
}

write_backend_env() {
  local env_file="$DEPLOY_ROOT/${APP_NAME}-backend.env"
  ensure_dir "$DEPLOY_ROOT"

  cat > "$env_file" <<EOF
# Generated by deploy_ecomm_node_redhat.sh
NODE_ENV=production

PORT=${BACKEND_PORT}

# Postgres connection (node-backend expects DATABASE_URL)
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}

JWT_ISSUER=${JWT_ISSUER}
JWT_SECRET=${JWT_SECRET}

CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
EOF

  chmod 600 "$env_file"
  echo "$env_file"
}

write_frontend_env() {
  local env_file="$DEPLOY_ROOT/${APP_NAME}-frontend.env"
  ensure_dir "$DEPLOY_ROOT"

  cat > "$env_file" <<EOF
# Generated by deploy_ecomm_node_redhat.sh
NODE_ENV=production
FRONTEND_PORT=${FRONTEND_PORT}
EOF

  chmod 600 "$env_file"
  echo "$env_file"
}

write_node_static_server_if_missing() {
  # Add a tiny Node server to serve React build output without Apache.
  # It is created inside the deploy root so systemd can run reliably.
  local server_path="$DEPLOY_ROOT/ecomm-frontend-static-server.mjs"
  if [[ -f "$server_path" ]]; then
    return 0
  fi

  log "Creating static frontend server: $server_path"
  cat > "$server_path" <<'EOF'
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const FRONTEND_PORT = process.env.FRONTEND_PORT ? Number(process.env.FRONTEND_PORT) : 4000;
const FRONTEND_DIST = process.env.FRONTEND_DIST || path.join(__dirname, 'frontend', 'dist');

app.use(express.static(FRONTEND_DIST, { index: false }));

// SPA fallback (avoid app.get('*', ...) which can break with some Express/router versions)
app.use((req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

app.listen(FRONTEND_PORT, () => {
  console.log(`Frontend static server listening on :${FRONTEND_PORT} (dist: ${FRONTEND_DIST})`);
});
EOF


  # Ensure express exists for the static server.
  # We'll install it into deploy root via a lightweight npm init.
  if [[ ! -f "$DEPLOY_ROOT/package.json" ]]; then
    (cd "$DEPLOY_ROOT" && npm init -y >/dev/null 2>&1)
  fi

  (cd "$DEPLOY_ROOT" && npm install express >/dev/null 2>&1)
}

install_systemd_units() {
  local backend_env_file="$1"
  local backend_unit="/etc/systemd/system/ecomm-backend.service"

  cat > "$backend_unit" <<EOF
[Unit]
Description=${APP_NAME} Node/Express backend
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=${NODE_BACKEND_DIR}
EnvironmentFile=${backend_env_file}

# Ensure graceful shutdown
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=3

# Logs go to journald
StandardOutput=journal
StandardError=journal

# Hardening (best-effort; adjust if your system policies disallow)
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

  local frontend_env_file="$2"
  local frontend_unit="/etc/systemd/system/ecomm-frontend.service"
  write_node_static_server_if_missing

  cat > "$frontend_unit" <<EOF
[Unit]
Description=${APP_NAME} React frontend (static)
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=${DEPLOY_ROOT}
EnvironmentFile=${frontend_env_file}

# Tell server where to find built output
Environment=FRONTEND_DIST=${FRONTEND_BUILD_DIR}

ExecStart=/usr/bin/node ${DEPLOY_ROOT}/ecomm-frontend-static-server.mjs
Restart=always
RestartSec=3

StandardOutput=journal
StandardError=journal

NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

  log "Installing systemd units"
  systemctl daemon-reload

  log "Reloaded systemd units (services not started/enabled here)"
}



main() {
  require_root
  install_prereqs



  sync_code
  build_frontend
  install_backend_deps
  maybe_init_db

  local backend_env_file
  backend_env_file="$(write_backend_env)"
  local frontend_env_file
  frontend_env_file="$(write_frontend_env)"

  install_systemd_units "$backend_env_file" "$frontend_env_file"

  log "Deployment complete."
  log "Backend: http://localhost:${BACKEND_PORT}/health"
  log "Frontend: http://localhost:${FRONTEND_PORT}/"
}

main "$@"

