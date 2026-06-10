#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$ROOT_DIR/scripts/common.sh"

# ---- Defaults (override via env vars) ----
: "${APP_NAME:=ecomm}"
: "${DEPLOY_ROOT:=/opt/ecomm}"
: "${FRONTEND_DIR:=$DEPLOY_ROOT/frontend}"
: "${APACHE_DOCROOT:=/var/www/html}"
: "${APACHE_SERVER_NAME:=localhost}"
: "${APACHE_HTTP_PORT:=80}"
: "${BACKEND_BASE_URL:=http://127.0.0.1:8080}"
: "${FRONTEND_API_PREFIX:=/api}"

require_root

log "Installing/building frontend and deploying via Apache httpd (static + optional reverse proxy)."

build_frontend() {
  local repo_frontend_dir="$ROOT_DIR/frontend"

  if [[ ! -d "$repo_frontend_dir" ]]; then
    err "frontend directory not found at $repo_frontend_dir"
    exit 1
  fi

  log "Installing Node.js dependencies and building frontend..."

  if ! have_cmd node; then
    err "node not found. Install Node.js LTS before running this script."
    exit 1
  fi
  if ! have_cmd npm; then
    err "npm not found. Install Node.js LTS before running this script."
    exit 1
  fi

  # Ensure clean build output
  (cd "$repo_frontend_dir" && npm ci --silent || npm install)
  (cd "$repo_frontend_dir" && npm run build)

  if [[ ! -d "$repo_frontend_dir/dist" ]]; then
    err "frontend build did not produce dist/"
    exit 1
  fi
}

install_apache_modules() {
  if is_redhat_like; then
    log "Installing Apache modules for reverse proxy (mod_proxy/mod_proxy_http/mod_headers)..."
    if have_cmd dnf; then
      dnf -y install httpd \
        mod_proxy \
        mod_proxy_http \
        mod_headers || dnf -y install httpd || true
      dnf -y install mod_proxy mod_proxy_http mod_headers || true
    elif have_cmd yum; then
      yum -y install httpd \
        mod_proxy \
        mod_proxy_http \
        mod_headers || true
    fi
  fi
}

configure_apache() {
  log "Configuring Apache for ${APP_NAME}..."

  ensure_dir "$FRONTEND_DIR"

  local dist_dir="$ROOT_DIR/frontend/dist"
  local target_dir="$FRONTEND_DIR/dist"
  rm -rf "$target_dir"
  mkdir -p "$target_dir"
  cp -a "$dist_dir/." "$target_dir/"

  # Create a site config
  local site_conf="/etc/httpd/conf.d/${APP_NAME}.conf"

  cat > "$site_conf" <<EOF
# ${APP_NAME} - static frontend + backend API proxy
ServerName ${APACHE_SERVER_NAME}

DocumentRoot ${APACHE_DOCROOT}

Alias / ${target_dir}
<Directory "${target_dir}">
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>

# Frontend SPA fallback (serve index.html)
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ /index.html [L]

# API proxy
ProxyPass ${FRONTEND_API_PREFIX} ${BACKEND_BASE_URL}
ProxyPassReverse ${FRONTEND_API_PREFIX} ${BACKEND_BASE_URL}

Header always set Access-Control-Allow-Origin "*"
EOF

  # Enable mod_rewrite if needed
  if ! grep -q "LoadModule rewrite_module" /etc/httpd/conf.modules.d/* 2>/dev/null; then
    # best effort: depends on distro packaging
    true
  fi

  log "Restarting Apache..."
  systemctl enable httpd >/dev/null 2>&1 || true
  systemctl restart httpd

  log "Apache deployed frontend to: $target_dir"
  log "Apache configured API proxy: ${FRONTEND_API_PREFIX} -> ${BACKEND_BASE_URL}"
}

main() {
  install_apache_modules
  build_frontend
  configure_apache
}

main "$@"

