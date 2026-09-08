# Upgrading

Starter releases use Semantic Versioning. Patch releases contain compatible fixes, minor releases add backward-compatible capabilities, and major releases may change configuration, content, API, or migration contracts.

## Release Upgrade

1. Read release notes and identify runtime, environment, and migration changes.
2. Create a PostgreSQL backup and back up both media stores.
3. Restore the backup into a non-production environment.
4. Install exactly from the lockfile with `npm ci`.
5. Run `npm run migrate:status`, then `npm run migrate`.
6. Regenerate Payload types only when schema development requires it.
7. Run lint, typecheck, unit, integration, production build, E2E, scheduler, and Docker smoke gates.
8. Deploy compatible code, apply migrations once, start web and scheduler, and verify readiness, public routes, jobs, robots, and sitemap.

Released migration files are immutable. Add a new migration for every later schema change. Significant Payload or Next.js major upgrades belong on a dedicated branch and require upstream release-note review, an empty-database test, a restored representative-database test, and updated documentation.

## Rollback

The Starter V1 baseline down migration removes the application schema and is destructive. Do not use it as a production rollback. Restore the pre-upgrade PostgreSQL backup and matching media backup, then deploy the previous compatible application release. Down migrations may be used only when they have been explicitly reviewed and tested for the exact release.

Starter V1 begins an independent public database lineage. It does not migrate an existing application database. Importing an existing site requires a separate, project-specific migration outside the core starter.
