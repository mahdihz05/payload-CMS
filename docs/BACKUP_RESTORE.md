# Backup and Restore

Back up PostgreSQL, public media, private media, and the ability to recreate environment secrets. Keep backups encrypted, access-controlled, tested, and outside Git. Choose retention and off-site replication appropriate to the site.

The commands below assume `deploy/.env.production` is populated and the stack uses `deploy/compose.yaml`.

## PostgreSQL Backup

```sh
mkdir -p backups
set -a; . deploy/.env.production; set +a
docker compose --env-file deploy/.env.production -f deploy/compose.yaml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-privileges \
  > "backups/postgres-$(date -u +%Y%m%dT%H%M%SZ).dump"
```

Check that the command exits zero, the file is non-empty, and `pg_restore --list` can read it. Copy the backup to encrypted off-site storage.

## PostgreSQL Restore

Restore into a new empty database first, never directly over a running production database:

```sh
docker compose --env-file deploy/.env.production -f deploy/compose.yaml exec -T postgres \
  createdb -U "$POSTGRES_USER" payload_restore
docker compose --env-file deploy/.env.production -f deploy/compose.yaml exec -T postgres \
  pg_restore -U "$POSTGRES_USER" -d payload_restore --no-owner --no-privileges \
  < backups/postgres-YYYYMMDDTHHMMSSZ.dump
```

Point a non-production application at the restored database, run `npm run migrate:status`, and verify users, Pages, forms, redirects, audit records, jobs, and representative public/admin behavior. Starter V1 was also validated by streaming `pg_dump --no-owner --no-privileges` into a separate database and checking content, forms, all migration records, and the SEO locale/path unique index.

## Media Backup

The operations profile uses the existing PostgreSQL Alpine image only as a small `tar` utility and mounts both named media volumes:

```sh
docker compose --env-file deploy/.env.production -f deploy/compose.yaml --profile operations run --rm backup \
  'tar -czf /backup/media.tgz -C /data/media . && tar -czf /backup/private-media.tgz -C /data/private-media .'
```

Private media backups must receive the same or stronger controls as form submissions. If a cloud storage adapter is used, use versioned provider-native backup/synchronization instead and test object metadata and private access after restore.

Restore only into empty replacement volumes during a controlled outage:

```sh
docker compose --env-file deploy/.env.production -f deploy/compose.yaml --profile operations run --rm backup \
  'tar -xzf /backup/media.tgz -C /data/media && tar -xzf /backup/private-media.tgz -C /data/private-media'
```

After restore, verify a public image, a private submission attachment as an authorized user, and denial for an anonymous user.

## Configuration Recovery

Do not put populated environment files in database/media archives or Git. Store the variable inventory and secret values in an approved secret manager with independent recovery access. Rotate credentials if a backup is exposed.

Always take a matched database and media backup immediately before production migrations. Application rollback uses the previous release plus restored matched state; do not rely on the destructive Starter V1 baseline down migration.
