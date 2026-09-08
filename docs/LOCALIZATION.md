# Localization

Locale policy is centralized in `frontend/src/lib/site-config.ts`. Starter V1 ships with English (`en`), Persian (`fa`), and UAE Arabic (`ar-ae`); English is the default locale. Persian and Arabic render right-to-left.

To add, remove, or change a locale:

1. Update `localeCodes`, `localeConfig`, and `defaultLocale` in `frontend/src/lib/site-config.ts`.
2. Add any locale-specific interface and bootstrap copy in `frontend/src/lib/locales.ts`, `frontend/src/scripts/seed-payload.ts`, and `frontend/src/scripts/seed-demo.ts`.
3. Add the corresponding Payload admin translation language in `frontend/src/payload.config.ts` when one is available. This is separate from content localization.
4. Run `npm run generate:types` and create a database migration with `npm run migrate:create -- describe_locale_change`.
5. Run lint, typecheck, unit tests, integration tests, and the production SEO smoke suite.

Payload fallback is disabled. A public translation is available only when its localized path and content are active and published. The SEO resolver emits `hreflang` only for those available translations, and `x-default` points to the configured default locale when that translation is available.

Fonts are selected by writing system rather than company identity. `frontend/src/app/fonts.ts` loads Latin and Arabic-script families; replace or remove those families when changing the locale set, then verify layout direction and loading behavior.
