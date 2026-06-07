# Backup Build/Compile Document (Frontend) — for CI/CD planning

This is a “backup”/extended set of notes you can keep alongside the primary build docs.

## Quick start (verified commands from repo scripts)
From repo root:
```bash
cd frontend
npm install
npm run build
```

Artifacts:
- `dist/`

## What commands map to in the project
From `frontend/package.json`:
- `npm run dev` → `vite`
- `npm run build` → `vite build`
- `npm run preview` → `vite preview`
- `npm run lint` → `eslint .`

From `frontend/vite.config.ts`:
- React plugin enabled
- dev server port `3000` and `strictPort: true`

## CI checklist (what to validate)
1. Dependency install step completes
   - Prefer `npm ci` if `package-lock.json` exists
2. Build step completes
   - `npm run build`
3. Output directory exists
   - `frontend/dist/index.html` should be present
4. Lint (optional)
   - `npm run lint`

## Troubleshooting
### 1) “dist folder missing after build”
- Verify build actually ran: look for Vite build summary.
- Ensure you executed `npm run build` in `frontend/`.

### 2) npm install/network errors
- Re-run `npm install`.
- Ensure npm can reach the registry.

### 3) Runtime failures after successful build
Vite build usually succeeds even if API calls fail at runtime.
- Check API base URL/ENV configuration used by the frontend.

## Backup note about GitHub connectivity
Since GitHub connectivity was corrected, the CI/CD steps below should be run again in your GitHub environment once you add workflows.

## Server deployment note (high level)
When deploying to a server (not static host), typically you either:
- copy `frontend/dist/` into a server’s static directory, or
- serve it via an existing reverse proxy (e.g., Nginx), or
- bake it into a container.

This repository currently focuses on producing the correct `dist/` artifact.

