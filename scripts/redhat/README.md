# Red Hat deploy/start scripts (Node backend + React frontend)

## What this deploys
- **Backend**: `node-backend` (Express + PostgreSQL + JWT)
- **Frontend**: React built output served as **static SPA** (no Apache/nginx)

Both are managed by **systemd**:
- `ecomm-backend.service`
- `ecomm-frontend.service`

## Usage
### 1) Deploy code + build + install systemd unit files

```bash
sudo bash scripts/redhat/deploy_ecomm_node_redhat.sh
```

Override environment variables (recommended):

```bash
sudo DB_HOST=127.0.0.1 \
     DB_PORT=5432 \
     DB_NAME=ecomm \
     DB_USER=ecomm \
     DB_PASSWORD=ecomm \
     JWT_SECRET='change-me' \
     JWT_ISSUER=ecomm \
     BACKEND_PORT=8080 \
     FRONTEND_PORT=4000 \
     CORS_ALLOWED_ORIGINS='http://localhost:4000' \
     RUN_DB_INIT=true \
     bash scripts/redhat/deploy_ecomm_node_redhat.sh
```

### 2) Start services (enable+start)

```bash
sudo bash scripts/redhat/service_setup.sh
```

## Start/stop/status/restart wrappers
- `sudo bash scripts/redhat/service_start.sh`
- `sudo bash scripts/redhat/service_stop.sh`
- `sudo bash scripts/redhat/service_status.sh`
- `sudo bash scripts/redhat/service_restart.sh`

## Verify
```bash
sudo systemctl status ecomm-backend ecomm-frontend
```

Test:
- Backend health: `curl http://localhost:8080/health`
- Frontend: `http://localhost:4000/`


## Notes
- This script copies `frontend/` and `node-backend/` into `/opt/ecomm`.
- It does **not** configure Apache/nginx.
- DB init runs `npm run init-db` best-effort via the node backend.

