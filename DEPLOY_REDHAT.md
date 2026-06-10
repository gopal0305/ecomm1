# ecomm — Red Hat Linux deployment

This repo contains deployment scripts under `scripts/`.

## What the scripts do
- `scripts/backend_deploy.sh`
  - Builds backend JAR with Maven
  - Copies it to `/opt/ecomm/backend/ecomm-backend.jar`
  - Writes an env file with DB/JWT/CORS settings
  - Starts backend with `nohup java -jar ...` (NOT systemd; per current selection)

- `scripts/frontend_deploy.sh`
  - Builds frontend with Vite (React)
  - Installs/uses Apache `httpd`
  - Deploys `frontend/dist/` to `/opt/ecomm/frontend/dist/`
  - Configures Apache to:
    - serve the SPA at `/`
    - proxy `/api` to the backend (`BACKEND_BASE_URL`)

- `scripts/deploy_all.sh`
  - Runs backend deploy then frontend deploy.

## Prerequisites (Red Hat)
Install/verify:
- Java 17 (JRE/JDK)
- Maven
- Node.js LTS + npm
- PostgreSQL server (or at least reachable network access)
- Apache httpd (the script installs httpd best-effort, but you should ensure modules exist)

## Required configuration
The backend connects to PostgreSQL using these env vars (script defaults shown):

- `DB_URL` (default: `jdbc:postgresql://127.0.0.1:5432/ecomm`)
- `DB_USERNAME` (default: `ecomm`)
- `DB_PASSWORD` (default: `ecomm`)
- `JWT_SECRET` **must be changed** (default placeholder is insecure)
- `CORS_ALLOWED_ORIGINS` (default: `http://localhost:3000`)

Also, because the frontend is served by Apache on port 80, update CORS allowed origins to your real frontend origin.

## Deploy steps
### 1) Configure environment variables (example)
Run as root (or use sudo):

```bash
export DB_URL='jdbc:postgresql://127.0.0.1:5432/ecomm'
export DB_USERNAME='ecomm'
export DB_PASSWORD='YOUR_PASSWORD'
export JWT_SECRET='PUT_A_LONG_RANDOM_SECRET_HERE'
export CORS_ALLOWED_ORIGINS='http://your-domain-or-ip'
```

### 2) Run full deploy
```bash
sudo bash scripts/deploy_all.sh
```

### 3) Test
- Frontend: `http://<server>/`
- Backend API through proxy: `http://<server>/api/products`

## Notes
- Backend is started with `nohup` and logs to:
  - `/opt/ecomm/backend/backend.log`
- If you want systemd later, the backend deploy script can be extended to create a service.
- The frontend script sets `Header always set Access-Control-Allow-Origin "*"` in Apache.


