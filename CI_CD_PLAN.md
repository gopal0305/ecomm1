# CI/CD Plan (Draft) — Frontend build + server deployment

This document is intended to be a planning artifact for setting up GitHub Actions.

## Assumptions
- Frontend: React + Vite
- Build command: `npm run build` produces `frontend/dist/`
- Deployment target: **server deployment** (copy/static serve or containerized serve)

## CI (Build + Test)
### Stage 1 — Checkout and build frontend
1. Checkout repository
2. Setup Node.js
3. Install dependencies
   - Use `npm ci` if `frontend/package-lock.json` exists
   - Otherwise use `npm install`
4. Run build
   - `npm run build` (in `frontend/`)
5. Validate artifact
   - ensure `frontend/dist/` exists

### Stage 2 — Artifact upload
- Upload `frontend/dist/` as a build artifact.

## CD (Deploy to server) — server deployment approach
Because “server deployment” can mean multiple setups, here are the common options you can implement later:

### Option A: Copy `dist/` to an existing server directory (static hosting)
1. CI builds `frontend/dist/`
2. CD step copies `dist/` to the server (e.g., via SSH/SCP)
3. Server/reverse proxy reloads configuration (if needed)

### Option B: Container deployment
1. CI builds frontend (`dist/`)
2. CI builds a container image that serves static files
3. Push image to registry
4. Server pulls and restarts container

### Option C: Integrate frontend build into backend deploy
If you serve frontend through the backend (or same deployment unit):
1. Build backend
2. Place `dist/` into backend’s static resource directory (if configured)
3. Deploy backend artifact

## Environment/Secrets to plan for
Add GitHub Actions secrets for CD (depending on chosen option):
- SSH host/user/key OR deployment API tokens
- Deployment path (server directory)
- Optional: Node version, API base URL, etc. (as build-time env if needed)

## Next implementation step
- Add `.github/workflows/` workflows:
  - `frontend-ci.yml` (build + artifact)
  - `frontend-cd.yml` (server deploy)

Notes: this repository currently did not confirm existing workflow files yet.
When you’re ready, I can generate the exact YAML workflows once you confirm:
- which server deployment option you want (A/B/C)
- the server connection method (SSH? container registry? etc.)

