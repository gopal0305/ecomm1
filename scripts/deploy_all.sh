#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log(){ echo "[DEPLOY_ALL] $*"; }

log "Deploying full stack: backend then frontend (Apache httpd)."

"$ROOT_DIR/scripts/backend_deploy.sh"
"$ROOT_DIR/scripts/frontend_deploy.sh"

log "Deployment complete."
log "Frontend should be reachable via Apache http://<server>/"
log "Backend APIs should be reachable via http://<server>/api/..."

