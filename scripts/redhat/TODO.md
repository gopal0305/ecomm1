# Red Hat deploy/start (Node + React)

- [ ] Decide deployment layout (/opt/ecomm) and ports (frontend + backend + API path)
- [ ] Create systemd unit for Node backend (node-backend) using environment file
- [ ] Create systemd unit for frontend (serve built React) or run via Vite in production mode
- [ ] Create deploy script: install deps, build frontend, install node-backend deps
- [ ] Create DB init hook: run `npm run init-db` (optional, idempotent)
- [ ] Create start/stop/status helpers (via systemctl)
- [ ] Add README with usage and required environment variables

