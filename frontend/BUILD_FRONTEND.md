# Build/Compile: Frontend (React + Vite)

This document explains how to compile the frontend into a production build.

## Prerequisites
- Node.js **LTS** installed (Node 18+ recommended)
- npm (comes with Node)

## Project location
Repository root:
- `c:/OPT/ecomm1`

Frontend folder:
- `c:/OPT/ecomm1/frontend`

## Commands
### 1) Install dependencies
```bash
cd frontend
npm install
```

### 2) Build (compile for production)
```bash
npm run build
```

Expected output:
- `frontend/dist/` (Vite build output)

### 3) (Optional) Run a local production preview
```bash
npm run preview
```
Then open the shown local URL (typically `http://localhost:4173`).

## Development server (not a compile step)
```bash
npm run dev
```
The Vite dev server uses port **3000** with `strictPort: true`.

## Common issues
- **Node version mismatch**: ensure Node LTS (18+).
- **Build fails**: re-run `npm install` and review the error output.
- **CORS/API base URL runtime errors**: build succeeds, but the app may fail at runtime if API URL is misconfigured.

## What CI/CD should consider
- Run `npm ci` (if a `package-lock.json` exists) or `npm install`.
- Ensure `npm run build` succeeds.
- Treat `frontend/dist/` as the deployable artifact.

