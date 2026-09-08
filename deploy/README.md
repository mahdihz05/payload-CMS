# Production Deployment

The production baseline uses the `main` branch by default, Docker Compose project `payload-cms-starter`, and a web service exposed on loopback port `3001` for a reverse proxy.

## Update

Run from your chosen installation directory as a deployment user with Docker access:

```sh
cd /srv/payload-cms-starter
sh deploy/update.sh
```

The script creates a timestamped PostgreSQL backup, fast-forwards `DEPLOY_BRANCH` (default `main`), applies pending Payload migrations, rebuilds the Next.js standalone output and runtime image, recreates the web and scheduler containers, and waits for `/readyz`.

The script does not run the canonical seed during routine updates, so editor-managed production content is preserved.

## First Bootstrap

For a fresh database, start PostgreSQL and run the builder once with the seed between migration and build:

```sh
docker compose -f deploy/compose.yaml up -d postgres
docker compose -f deploy/compose.yaml build web scheduler
docker compose -f deploy/compose.yaml run --rm scheduler npm run migrate
docker compose -f deploy/compose.yaml run --rm scheduler npm run bootstrap
docker compose -f deploy/compose.yaml up -d web
docker compose -f deploy/compose.yaml up -d scheduler
```

Keep `deploy/.env.production` mode `0600`; it is Git-ignored and must never be committed.

## Scheduled Publishing

The `scheduler` service runs Payload schedule discovery and due jobs once per minute with `NODE_ENV=production`. It shares the migration-managed application source and `node_modules` volume created by the builder. Verify it after each deployment with `docker compose -f deploy/compose.yaml logs scheduler` and confirm due jobs complete in Payload job logs. Do not run job commands with development `NODE_ENV`, because Payload may attempt a development schema push.
