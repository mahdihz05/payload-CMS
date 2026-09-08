#!/bin/sh
set -eu

repo_dir="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$repo_dir"

test -f deploy/.env.production
set -a
. deploy/.env.production
set +a

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p backups
docker compose -f deploy/compose.yaml up -d postgres
dump_file="backups/postgres-${timestamp}.sql"
docker compose -f deploy/compose.yaml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$dump_file"
gzip -9 "$dump_file"

deploy_branch="${DEPLOY_BRANCH:-main}"
git fetch origin "$deploy_branch"
git checkout "$deploy_branch"
git pull --ff-only origin "$deploy_branch"

docker compose -f deploy/compose.yaml build web scheduler
docker compose -f deploy/compose.yaml run --rm scheduler npm run migrate
docker compose -f deploy/compose.yaml up -d web scheduler

ready=0
for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3001/readyz >/dev/null; then
    ready=1
    break
  fi
  sleep 5
done
test "$ready" = "1"
docker compose -f deploy/compose.yaml ps
