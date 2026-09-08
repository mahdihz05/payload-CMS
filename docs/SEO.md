# Technical SEO

Page documents own SEO. Visual blocks must not set document-level titles, canonical URLs, robots directives, alternates, or structured data independently.

## Resolution

The central resolver combines the localized Page, Site Settings, workflow state, translation availability, and public origin. It emits:

- title and description fallbacks;
- self-canonical URLs, or a validated manual canonical override;
- index/follow directives;
- Open Graph and Twitter metadata;
- published locale alternates and `x-default`;
- eligible sitemap entries;
- validated Organization, WebSite, Breadcrumb, Service, Article, and visible FAQ schema where typed facts are sufficient.

Preview and draft responses are always `noindex,nofollow` and bypass the published result cache.

## Editor Controls

Use the Page document's SEO tab. Empty title and description fields fall back to the Page title and excerpt. The admin field descriptions include practical length limits and indexability consequences.

Do not enable a canonical override unless another absolute HTTP(S) URL is the authoritative copy. An override makes the page non-self-canonical and removes it from the sitemap. Disabling `robotsIndex` requests `noindex` and also removes the page from the sitemap. `robotsFollow` controls whether crawlers are asked to follow links on the page.

## Redirects

Published path changes create permanent locale-aware redirects automatically. SEO users can create and update redirects; only administrators can delete them. Keep source paths locale-relative, prefer `308` for permanent moves, use `307` only for temporary moves, and avoid chains, loops, or redirecting a path to itself. The collection validates these rules.

## Roles

- `admin`: full SEO, content, redirect, and role-management access.
- `editor`: manages Page content and publication workflow but cannot change protected SEO fields.
- `seo`: manages SEO fields and redirects but cannot change body content, public paths, or publication state.
- `viewer`: read-only access to permitted admin data.

Provision users in Payload Admin at `/admin`. Role restrictions are enforced by API/data access, not only hidden controls.

## Revalidation

Payload hooks invalidate page, locale, site, sitemap, and redirect cache tags after relevant changes. Optional external revalidation is disabled unless `REVALIDATION_SECRET` is set. Signed requests use `x-payload-timestamp` and `x-payload-signature`; never place the secret in client code.

## Verification

Run `npm run test:seo:integration` against migrated PostgreSQL, then build and run `npm run test:seo:e2e`. The production suite verifies locale metadata, preview policy, revalidation, redirects, robots, sitemap eligibility, schema, and every sitemap URL status.

Starter V1 does not include SEO scoring, AI SEO, a Search Console dashboard, or editor-side visual SERP/social preview cards.
