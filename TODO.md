- [ ] Re-work deploy script so it does NOT stop/enable/start systemd services.
- [ ] Update backend port default in `scripts/redhat/deploy_ecomm_node_redhat.sh` from 8080 to 8090.
- [ ] Locate schema SQL and update DB init script to use correct file path `node-backend/src/db/schema.sql`.
- [ ] Determine whether `src/db/sample-data.sql` exists; if not, ensure init script handles missing sample data (or wire correct path).
- [ ] Verify runtime: start services and confirm backend listens on 8090 and frontend logs in journald.

- [x] Fix deploy script frontend sync failure: add REPO_ROOT override + preflight checks so missing source paths fail clearly before copying.


