# Creating a Site

## 1. Initialize

Use the repository as a GitHub template or clone it into a new project. Create environment configuration, start empty PostgreSQL, run migrations, and run the generic bootstrap. Confirm public Home and `/admin` before making site changes.

## 2. Set Identity

Set the canonical public origin in environment configuration. Update Site Settings with the site name, descriptions, logo, favicon, contact data, address, and optional external links. Do not add company constants to SEO helpers or shared components.

## 3. Configure Locales

Follow `LOCALIZATION.md`. Keep locale codes, language tags, direction, and default locale centralized. Regenerate types and create a migration for schema changes. Publish each translation deliberately; fallback is disabled.

## 4. Model Content

Use the existing Page collection unless a genuinely different lifecycle requires another collection. Compose Pages from the generic blocks and add site-specific blocks only when reusable visible content needs a typed schema. Add rendering, accessibility, type, migration, and output tests together.

Keep `path` as the single public URL identity. Do not hard-code database IDs. Navigation should reference stable paths or content relationships rather than copied site catalogs.

## 5. Preserve SEO Ownership

Page documents and the central resolver own title, description, canonical, robots, social metadata, alternates, redirects, sitemap eligibility, and schema. Blocks must not duplicate those controls. Add typed schema facts to the resolver contract rather than injecting arbitrary JSON-LD in visual components.

## 6. Integrations

Add analytics, chat, commerce, search, email, or storage as optional configured modules. The application must still build, migrate, bootstrap, and start when each integration is absent. Never commit provider tokens or production defaults.

## 7. Design

Replace the minimal public presentation with the site's visual system while retaining semantic headings, labels, keyboard access, responsive behavior, reduced-motion support, and visible focus. Do not couple typography to company identity; select fonts based on the configured writing systems.

## 8. Release

Run the complete local/CI gates, create and restore backups, test a clean clone, verify Docker, scan the public tree, deploy migrations before web/scheduler, and smoke all public/admin/SEO/form paths. Follow `UPGRADING.md` for later starter or framework updates.
