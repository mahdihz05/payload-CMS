# Environment

Use the tracked `.env.example` for local development and `deploy/env.production.example` as the production checklist. Never commit a populated `.env`, `.env.local`, or `deploy/.env.production`.

| Variable | Classification | Required | Purpose |
|---|---|---:|---|
| `DATABASE_URI` | secret, runtime, CI, production | yes | PostgreSQL connection string. |
| `PAYLOAD_SECRET` | secret, runtime, CI, production | yes | Payload signing/encryption secret; at least 32 characters in production. |
| `IP_HASH_SECRET` | secret, production, CI | production | Independent salt for privacy-preserving form-submission IP hashes; at least 32 characters. Development may use `PAYLOAD_SECRET`. |
| `NEXT_PUBLIC_SITE_URL` | public, production, CI | production | Absolute canonical origin. Local development defaults to `http://localhost:3000`; production has no fallback. |
| `DEPLOYMENT_ENV` | production | no | Set to `staging` to emit site-wide crawler blocking; use `production` for an indexable deployment. |
| `POSTGRES_DB` | deployment | Compose | PostgreSQL database name. |
| `POSTGRES_USER` | deployment | Compose | PostgreSQL role. |
| `POSTGRES_PASSWORD` | secret, deployment | Compose | PostgreSQL password. |
| `PAYLOAD_ADMIN_EMAIL` | bootstrap | no | Creates the first administrator only when paired with `PAYLOAD_ADMIN_PASSWORD`. |
| `PAYLOAD_ADMIN_PASSWORD` | secret, bootstrap | no | First administrator password; minimum 12 characters. |
| `STARTER_SITE_NAME` | bootstrap | no | Initial site identity; defaults to `Payload CMS Starter`. |
| `REVALIDATION_SECRET` | secret, integration | no | Enables signed `POST /api/revalidate` requests. Leave unset to disable that integration. |
| `PORT` | runtime | no | HTTP port; defaults to `3000`. |
| `WEB_PORT` | deployment | no | Loopback host port for the Compose web service; defaults to `3001`. |
| `DEPLOY_BRANCH` | deployment | no | Branch used by `deploy/update.sh`; defaults to `main`. |
| `SCHEDULER_INTERVAL_MS` | scheduler | no | Delay between job cycles; defaults to 60000 and must be at least 1000. |
| `RUN_PAYLOAD_INTEGRATION` | test-only | no | Set to `1` to include PostgreSQL integration tests. |
| `RUN_SEO_E2E` | test-only | no | Set to `1` to run production HTTP SEO tests. |
| `FORM_E2E_PORT` | test-only | no | Port used by the self-contained forms integration server; defaults to `3000`. |
| `FORM_E2E_BASE_URL` | test-only | no | Injected by the forms test runner for its production HTTP target. |
| `SEO_E2E_BASE_URL` | test-only | no | URL used by the SEO HTTP tests. |
| `SEO_E2E_PORT` | test-only | no | Port used by the E2E application process; defaults to `3100`. |
| `SEO_INVENTORY_SITE_URL` | maintenance | no | Optional origin override for the SEO inventory command. |

Generate independent random values for each production secret. Do not use the placeholders or local Compose password in production. Optional integrations must remain absent unless their corresponding secret is deliberately configured.
