- [x] Inspect backend WishlistService compilation errors
- [x] Update WishlistService to remove missing requireCurrentUser() method and fix unauthorized logic
- [x] Fix incorrect return type in WishlistService.toResponse (remove unreachable/incorrect user lookup)
- [x] Compile/package backend to confirm CI passes compilation

- [ ] Prepare Red Hat deployment scripts (frontend + backend)
  - [x] Add scripts/common.sh
  - [x] Add scripts/backend_deploy.sh
  - [x] Add scripts/frontend_deploy.sh
  - [x] Add scripts/deploy_all.sh
  - [x] Add DEPLOY_REDHAT.md

- [ ] Validate on a Red Hat VM
- [ ] (Optional) Add systemd unit for backend

