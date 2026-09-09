---
name: site-delivery
description: Use when building, redesigning, planning, or reviewing a website from a frontend codebase, Figma URL, reference site URL, screenshots, or product brief. Guides discovery through design, implementation, SEO, QA, and handoff.
---

# Site Delivery

Turn incomplete website inputs into a maintainable, production-ready site. Work from evidence in the target repository; a reference site or Figma file is not permission to copy its text, assets, brand identity, or source code.

## Modes

Choose the current mode before editing:

| Mode | Output |
| --- | --- |
| Discover | constraints, inventory, and implementation brief |
| Design | page map, design system, responsive behavior, and acceptance criteria |
| Build | minimal code changes and verification |
| Review | findings ordered by severity and concrete next steps |

Default to Discover when the deliverable is unclear. Do not begin a broad redesign until the user approves the design direction.

## Intake And Discovery

Collect only what cannot be safely discovered: target repository, source material (Figma URL, reference URL, screenshots, frontend, or brief), required pages, audience, locales/RTL, brand assets, content ownership, and delivery constraints.

1. Read project instructions, manifests, routes, styles, components, environment examples, and tests before proposing work.
2. Identify framework, styling, data source, CMS, localization, responsive conventions, and documented test/build/deploy paths.
3. For a reference site, inspect public information architecture, hierarchy, interactions, and accessibility. Do not copy text, assets, brand identity, protected content, or source code.
4. For Figma, map pages, components, variables, typography, spacing, breakpoints, assets, and states. Load `figma-use` before programmatic Figma inspection or edits. Preserve an existing design system.
5. Ask one concise question only when its answer materially changes scope, branding, content, or architecture.

## Design Contract

For non-trivial work, define before implementation:

- Goal, audience, and primary conversion action.
- Sitemap and purpose of each page.
- Editable content model, data source, loading, empty, and error states.
- Typography, color roles, spacing, imagery, motion, components, and states.
- Mobile, tablet, desktop, locale, and RTL behavior.
- SEO: metadata ownership, canonical, indexability, structured data, sitemap, redirects, and locale alternates.
- Acceptance criteria and verification plan.

Avoid generic card grids, arbitrary gradients, placeholder marketing copy, and cloned visual identities.

## Implementation Rules

1. Preserve repository architecture, naming, visual language, and dependencies. Make the smallest correct change.
2. For React/Next.js work load `vercel-react-best-practices`. For Payload schema, hook, access, migration, or API work load `payload` first.
3. Implement semantic HTML, keyboard use, focus visibility, labels, alt-text strategy, reduced motion, and responsive behavior with the feature.
4. Keep SEO in the centralized metadata layer; visual blocks must not duplicate canonical, robots, sitemap, or structured-data logic.
5. Never commit secrets, populated environment files, customer data, copied site assets, or unlicensed fonts. Never overwrite user changes, reset history, force-push, or move release tags without explicit instruction.

## Verification

Run the narrowest relevant checks, then the documented gates:

- formatter, lint, typecheck, unit tests, and build;
- browser behavior on desktop and mobile using `webapp-testing` when needed;
- loading, empty, error, long-content, and RTL states where applicable;
- metadata, canonical, robots, sitemap, locale alternates, and structured data;
- CI, deployment configuration, and fresh-start instructions.

If any test or build fails, load `systematic-debugging` before changing code. Report external blockers separately and never claim an unrun gate passed.

## Completion

Report user-visible result, files changed, verification results, remaining blockers, and exact next steps. Mark a delivery READY only when agreed acceptance criteria and relevant gates pass.

## Examples

- "Use site-delivery to turn this Figma URL into the existing Next.js app."
- "Use site-delivery to design an original Persian landing page from this reference site."
- "Use site-delivery with this frontend and brief to plan CMS, pages, SEO, and implementation."
