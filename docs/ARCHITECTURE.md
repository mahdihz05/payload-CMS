# Architecture

One Node.js application hosts the localized public site, Payload Admin, Payload REST/GraphQL compatibility routes, forms endpoints, preview, revalidation, health checks, robots, and sitemap. PostgreSQL stores content, users, versions, jobs, redirects, submissions, and audit logs. A separate process executes Payload scheduled jobs.

## Content Flow

`content` is the Page/content collection. A localized `path` is the central public URL identity; Home uses an empty path and the catch-all Next.js route handles nested paths. Page `layout` contains one of seven typed blocks. The public loader selects active published content with fallback disabled, and preview performs authenticated draft selection without contaminating published caches.

Site identity belongs to Site Settings. Navigation belongs to the Navigation global. Visual tokens belong to Design Settings. Blocks own visible content but not document SEO.

## SEO Flow

The loader converts a Page, Site Settings, translation availability, and redirect state into a typed resolver input. The resolver is the authority for metadata, canonical URLs, robots, social metadata, alternates, sitemap eligibility, and schema input. Hooks validate route uniqueness, create redirects after published path moves, and invalidate tagged caches.

## Security Flow

Payload collection/field access functions enforce admin, editor, SEO, and viewer roles. Local API operations acting for a user set `overrideAccess:false`. Public forms validate configured fields, consent, file signatures/sizes, and request limits. Submission files use private storage and authenticated delivery. Audit hooks record mutations transactionally.

## Runtime and State

- `web`: standalone Next.js/Payload process.
- `postgres`: durable application database.
- `scheduler`: non-interactive Payload schedule discovery and job execution.
- `media`: public upload volume.
- `private_media`: private form-upload volume.

Migrations are source-controlled and run before application/scheduler startup. Bootstrap is separate from migrations. Health checks distinguish process liveness from Payload/database readiness.
