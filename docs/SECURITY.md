# Security and Maintenance

## Supported Runtime

Starter V1 supports Node.js 22 and npm 10. The lockfile is authoritative; use `npm ci` in CI, image builds, and deployments. Framework major upgrades are deliberate release work, never incidental dependency cleanup.

## Secrets

Never commit populated environment files, credentials, database dumps, private uploads, session data, or signing tokens. Generate independent random production values for Payload, IP hashing, PostgreSQL, and optional revalidation. Rotate a secret immediately if it appears in source, logs, screenshots, archives, or client output.

Production configuration rejects missing/short security secrets and known `CHANGE_ME` placeholders. Keep admin bootstrap credentials only until the initial user exists. Review proxy trust and forwarded-header handling for the deployment environment.

## Access Controls

Payload roles are enforced at collection and field/API levels. Re-test admin, editor, SEO, and viewer behavior after Payload upgrades. Preview requires an authenticated Payload user. Private media and submission files require authenticated form-management access. External revalidation is disabled when its secret is absent and otherwise requires a fresh signed request.

## Dependency Updates

Dependabot opens weekly frontend and monthly GitHub Actions pull requests. Compatible Payload packages and Next/React packages are grouped; framework majors are ignored by routine automation. Automatic merge is not configured. Every update requires review and relevant migration, build, integration, E2E, Docker, and fresh-clone gates.

Review `npm audit --omit=dev`, GitHub advisories, Payload and Next.js security notices, and CodeQL results. Triage exploitability rather than applying forced upgrades blindly. Patch critical reachable issues promptly on a dedicated fix branch and publish a SemVer patch release with verification evidence.

## Framework Upgrades

For a Payload or Next.js major upgrade, follow `UPGRADING.md`: read upstream migration notes, restore representative data, update related packages together, regenerate types, create additive migrations, test empty and restored databases, and run every release gate. Never edit a released migration.

## Reporting

Use GitHub's private vulnerability reporting feature when enabled by the repository owner. Do not disclose exploitable details in a public issue before a fix is available. The owner should configure security notifications, branch protection, required CI checks, and private vulnerability reporting in repository settings.

No software license is declared by Starter V1 unless the repository owner adds one explicitly.
