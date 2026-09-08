# Payload CMS Starter

A production-oriented Payload CMS and Next.js starter using PostgreSQL, typed block-based pages, localization, technical SEO, redirects, RBAC, forms, drafts/previews, scheduled publishing, Docker, and automated tests.

This is an independent starter built with Payload CMS and Next.js. It is not an official Payload project or theme.

## Why This Starter

The repository provides reusable infrastructure commonly needed by content-driven websites: Payload Admin, localized Page/Block composition, media and forms, data-level permissions, audit logs, drafts and versions, secure preview, scheduled publishing, database migrations, technical SEO, Docker deployment, recovery guidance, and CI. Its public UI is intentionally minimal so each derived site can implement its own design.

## Stack

| Component | Version / requirement |
|---|---|
| Payload CMS | 3.88.x |
| Next.js | 16.3.2 |
| React | 19.2.8 |
| TypeScript | 5.x |
| PostgreSQL | 17 |
| Node.js | 22 |
| npm | 10 |
| Docker | Docker Engine with Compose v2 |

## Features

### CMS

- Localized Pages rendered from typed blocks
- Hero, Rich Text, Feature Grid, FAQ, Testimonials, CTA, and Form blocks
- Public/private Media with localized ALT text and generated image sizes
- Configurable Forms, submissions, private file uploads, consent, and retention
- Admin, editor, SEO, and viewer roles enforced at data/API level
- Audit logs for collection and global changes
- Drafts, autosave, versions, preview, and scheduled publishing
- Site Settings, Design Settings, and Navigation globals

### SEO

- Centralized metadata resolver and URL contract
- Self-canonical URLs and validated manual overrides
- Robots/indexability rules tied to workflow and sitemap eligibility
- Open Graph and Twitter metadata
- Published-translation `hreflang` and `x-default`
- Automatic redirects after published path changes
- Resolver-driven sitemap and environment-aware robots.txt
- Organization, WebSite, Breadcrumb, Service, Article, and visible FAQ schema when typed facts are sufficient
- Authenticated preview forced to `noindex,nofollow`
- Dedicated SEO role and cache/revalidation hooks

### Localization

English (`en`), Persian (`fa`), and UAE Arabic (`ar-ae`) are configured by default. English is the default locale; Persian and Arabic are RTL. Payload fallback is disabled so unpublished or missing translations are not silently substituted. To change the locale set, update the centralized locale config and localized bootstrap copy, regenerate types, create a migration, and rerun localization/SEO tests. See [Localization](docs/LOCALIZATION.md).

### Developer and Operations

- Source-controlled neutral baseline plus preserved SEO migrations
- Idempotent generic bootstrap and optional disposable demo seed
- Deterministic lockfile installs
- Standalone web and scheduler Docker targets
- PostgreSQL and media backup/restore procedures
- GitHub Actions, CodeQL, and Dependabot configuration

## Repository Structure

```text
.
├── .github/                 # CI, CodeQL, Dependabot
├── deploy/                  # production Docker and Compose baseline
├── docs/                    # architecture and operations guides
├── frontend/
│   ├── scripts/             # scheduler runtime
│   ├── src/app/             # public, admin, API, health routes
│   ├── src/components/      # generic renderers and forms
│   ├── src/lib/             # config, CMS loaders, SEO, validation
│   ├── src/migrations/      # Payload PostgreSQL migrations
│   └── src/payload/         # collections, globals, hooks, access, blocks
└── docker-compose.yml       # local PostgreSQL
```

## Quick Start

### Local Node and Docker PostgreSQL

```powershell
git clone https://github.com/mahdihz05/payload-CMS.git
Set-Location payload-CMS
Copy-Item .env.example frontend/.env
docker compose up -d postgres
Set-Location frontend
npm ci
npm run migrate
npm run bootstrap
npm run dev
```

Open:

- Public site: <http://localhost:3000/en>
- Payload Admin: <http://localhost:3000/admin>
- Readiness: <http://localhost:3000/readyz>

For macOS/Linux, replace `Copy-Item .env.example frontend/.env` with `cp .env.example frontend/.env` and `Set-Location` with `cd`.

Set both `PAYLOAD_ADMIN_EMAIL` and `PAYLOAD_ADMIN_PASSWORD` before bootstrap to create the first administrator. Use non-example credentials even for shared development environments.

### Full Docker

```sh
cp deploy/env.production.example deploy/.env.production
# Replace every CHANGE_ME value and set the real NEXT_PUBLIC_SITE_URL.
docker compose --env-file deploy/.env.production -f deploy/compose.yaml build web scheduler
docker compose --env-file deploy/.env.production -f deploy/compose.yaml up -d postgres
docker compose --env-file deploy/.env.production -f deploy/compose.yaml run --rm scheduler npm run migrate
docker compose --env-file deploy/.env.production -f deploy/compose.yaml run --rm scheduler npm run bootstrap
docker compose --env-file deploy/.env.production -f deploy/compose.yaml up -d web scheduler
```

The production-like web service is available at `http://127.0.0.1:3001` by default.

## Environment

Start from [`.env.example`](.env.example). Production operators should also review [`deploy/env.production.example`](deploy/env.production.example) and [Environment](docs/ENVIRONMENT.md).

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URI` | yes | PostgreSQL connection string |
| `PAYLOAD_SECRET` | yes | Payload secret; 32+ characters in production |
| `IP_HASH_SECRET` | production | Independent form IP-hash salt; 32+ characters |
| `NEXT_PUBLIC_SITE_URL` | production | Absolute canonical public origin |
| `PAYLOAD_ADMIN_EMAIL` | bootstrap admin | Optional first administrator email |
| `PAYLOAD_ADMIN_PASSWORD` | bootstrap admin | Optional first administrator password, 12+ characters |
| `STARTER_SITE_NAME` | no | Initial site identity |
| `REVALIDATION_SECRET` | no | Enables signed external revalidation |
| `DEPLOYMENT_ENV` | no | Use `staging` to block crawlers |

Production rejects missing or weak required secrets and known placeholder values. Optional integrations are disabled when unset.

## Bootstrap and Demo

`npm run bootstrap` creates or updates the minimum generic system data:

- an administrator only when secure credentials are supplied;
- Site and Design Settings;
- Home/Contact navigation;
- localized Home and Contact Pages;
- a generic Contact Form.

The command is idempotent and safe to rerun; it does not create duplicate documents. `npm run seed` is an alias for bootstrap.

`npm run seed:demo` optionally creates one localized About page demonstrating Hero and FAQ blocks. The document key is `demo-about`; delete that Page when no longer needed. Core startup and tests do not require demo data.

## Admin and Roles

Payload Admin is at `/admin`.

| Role | Actual scope |
|---|---|
| `admin` | Full configuration, users, content, SEO, forms, media, redirects, audit reads |
| `editor` | Content, publication, forms, submissions, and media; SEO fields are also allowed |
| `seo` | SEO fields and redirect drafts; cannot change body, path, publication state, forms, or media |
| `viewer` | Read-only authenticated content access; no mutations |

Only administrators can update users/globals, read audit logs, activate/delete protected redirects, or perform other administrator-only actions. API/data-level tests verify these boundaries.

## Creating a New Website

```text
Use template or clone
-> set site identity and environment
-> configure locales
-> migrate and bootstrap
-> replace demo content
-> create or adjust Blocks where needed
-> implement the visual theme
-> test
-> deploy
```

See [Creating a Site](docs/CREATING_A_SITE.md). Keep document SEO centralized; visual blocks must not reimplement canonical, robots, alternates, or other document metadata. Keep site-specific integrations optional and configuration-driven.

## Page and Blocks

Home is a Page with an empty locale-relative path. Other Pages use paths such as `about` or `products/example`; the catch-all route supports nested paths. Navigation comes from the Navigation global.

To add a block, define a typed Payload block in `frontend/src/payload/blocks.ts`, register it in `contentBlocks`, add rendering in `frontend/src/components/block-renderer.tsx`, regenerate types, create a migration, and add schema/output tests. Blocks own visible content only.

## SEO

See [Technical SEO](docs/SEO.md). By default, each published Page receives a self-canonical URL. Manual canonical overrides must be absolute and explicitly enabled; overridden and noindex pages leave the sitemap. Preview is always noindex. Hreflang is emitted only for active, valid, published translations. Published path changes create redirects.

## Forms and Media

Create Forms in Payload Admin and embed them with a Form block. Submissions and private attachments are available to form managers. Public Media supports localized ALT and persistent image variants. See [Media and Forms](docs/MEDIA_AND_FORMS.md) for validation, access, storage, and persistence behavior.

## Tests

From `frontend`:

| Command | Coverage / prerequisite |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | Next route generation and TypeScript |
| `npm test` | Unit/component tests; no database required |
| `npm run test:core:integration` | PostgreSQL RBAC/media/audit integration |
| `npm run test:integration` | Self-contained production HTTP forms/file integration; requires a completed build and PostgreSQL |
| `npm run test:seo:integration` | PostgreSQL routing/resolver/RBAC/preview/scheduler integration |
| `npm run test:seo:e2e` | Self-contained production SEO/redirect/sitemap HTTP suite; requires a completed build and PostgreSQL |
| `npm run check` | Lint, typecheck, unit tests, production build |

Use disposable test credentials and `NODE_ENV=production` for database integration suites. CI provisions empty PostgreSQL and performs migration/bootstrap first.

## Database and Migrations

For a fresh database, run `npm run migrate` before bootstrap. Check status with `npm run migrate:status`. During schema development, regenerate Payload types and create a new migration with:

```sh
npm run generate:types
npm run migrate:create -- describe_the_change
```

Released migrations are immutable. Back up PostgreSQL and media before every production schema upgrade. See [Upgrading](docs/UPGRADING.md).

## Docker and Deployment

See [Deployment](docs/DEPLOYMENT.md). The stack contains PostgreSQL, a standalone web image, a scheduler image, and persistent public/private media volumes. `/healthz` reports process liveness and `/readyz` verifies Payload/database readiness.

## Scheduled Publishing

Production must run `npm run jobs:scheduler` continuously. The scheduler discovers due publications, runs queued jobs, logs each cycle, handles termination signals, and retries later after continuous-mode failures. See [Scheduled Publishing](docs/SCHEDULER.md).

## Backup and Restore

Back up PostgreSQL plus both media stores as one recoverable state. Restore into a non-production environment and verify before relying on a backup. See [Backup and Restore](docs/BACKUP_RESTORE.md).

## Updating and Security

See [Upgrading](docs/UPGRADING.md) and [Security](docs/SECURITY.md). Releases use SemVer. Dependabot opens grouped update pull requests without auto-merge; CodeQL performs static analysis. Never commit populated environment files or credentials, rotate any exposed secret immediately, and review production access controls. Apply security updates deliberately and rerun migrations, access, build, E2E, Docker, and recovery gates.

## CI and GitHub

`Starter CI` validates clean install, PostgreSQL migrations, bootstrap idempotency, lint, typecheck, unit and integration tests, forms, production build, localization, SEO, redirects, preview, schema, sitemap status, scheduled publishing, and Docker build/smoke. `CodeQL` analyzes JavaScript/TypeScript on main, pull requests, and a weekly schedule.

## Production Checklist

- Generate independent secure secrets and remove bootstrap credentials after use.
- Set the exact HTTPS `NEXT_PUBLIC_SITE_URL` and review crawler environment.
- Configure PostgreSQL backup and tested restore.
- Persist and back up public/private media.
- Apply migrations before starting new code or scheduler.
- Run exactly the intended scheduler topology and monitor job failures.
- Configure liveness/readiness probes.
- Terminate HTTPS at a trusted reverse proxy.
- Require green CI and CodeQL review.
- Smoke public/admin/forms/preview/redirects after deployment.
- Verify robots.txt, sitemap.xml, and all sitemap URLs.

## License

No software license has been declared for this repository. The owner must make the licensing decision explicitly.

Built with [Payload CMS](https://payloadcms.com/) and [Next.js](https://nextjs.org/).
