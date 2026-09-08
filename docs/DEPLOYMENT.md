# Deployment

The production baseline is Docker Compose with PostgreSQL 17, a standalone Next.js/Payload web image, and a separate Payload scheduler image. Build dependencies are installed deterministically with `npm ci`; runtime secrets are supplied only through Compose environment variables and are not copied into either final image.

## First Deployment

1. Copy `deploy/env.production.example` to `deploy/.env.production` outside version control.
2. Replace every `CHANGE_ME` value, set the real HTTPS `NEXT_PUBLIC_SITE_URL`, and restrict the file to the deployment account.
3. Build, migrate, bootstrap once, and start:

```sh
docker compose --env-file deploy/.env.production -f deploy/compose.yaml build web scheduler
docker compose --env-file deploy/.env.production -f deploy/compose.yaml up -d postgres
docker compose --env-file deploy/.env.production -f deploy/compose.yaml run --rm scheduler npm run migrate
docker compose --env-file deploy/.env.production -f deploy/compose.yaml run --rm scheduler npm run bootstrap
docker compose --env-file deploy/.env.production -f deploy/compose.yaml up -d web scheduler
```

Bootstrap is safe to rerun, but it is an initialization command rather than part of routine web startup. Remove `PAYLOAD_ADMIN_PASSWORD` from the environment after the administrator exists.

## Upgrades

Create PostgreSQL and media backups first. Build both images, run migrations once through the scheduler image, then recreate web and scheduler. `deploy/update.sh` automates the backup-first fast-forward workflow for `DEPLOY_BRANCH` (default `main`). It never runs bootstrap during routine updates.

## Persistence

Compose persists `postgres_data`, `media`, and `private_media`. Do not replace or remove these volumes during normal deployment. Back up PostgreSQL and both media volumes together; see `BACKUP_RESTORE.md`.

## Health and Proxy

- `/healthz` proves that the HTTP process is alive without querying PostgreSQL.
- `/readyz` verifies Payload initialization and a database query; it returns `503` when unavailable.
- Compose exposes web only on `127.0.0.1:${WEB_PORT:-3001}`. Terminate HTTPS at a reverse proxy and forward the original host/protocol headers.
- The web and scheduler services use `restart: unless-stopped` and bounded JSON logs.

After deployment, verify `/admin`, every configured locale Home page, a nested Page, form submission, preview, `/robots.txt`, `/sitemap.xml`, every sitemap URL, scheduler logs, and database/media backups.
