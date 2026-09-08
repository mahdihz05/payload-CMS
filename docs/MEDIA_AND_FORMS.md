# Media and Forms

## Media

The Media library accepts JPEG, PNG, WebP, and PDF files. Image uploads generate thumbnail, card, and hero sizes. ALT, title, and caption fields are localized. Anonymous reads are restricted to records with `isPublic=true`; authenticated CMS users may access private records according to their role.

Local uploads are stateful:

- public media: `frontend/media` in local Node development, `/app/media` in the production container;
- private form files: `frontend/private-media/form-submissions`, `/app/private-media/form-submissions` in the production container.

Compose uses persistent `media` and `private_media` volumes. Back up both with PostgreSQL and restore them before accepting traffic. A cloud storage adapter may replace local storage, but access and backup behavior must be retested.

## Forms

Editors and administrators configure forms and review submissions. The generic bootstrap creates a Contact form; no branded form is required. A Form block embeds an active form in any Page.

Submission validation rejects unknown fields, requires configured consent and required files, uses a honeypot, limits request/file sizes, validates file signatures, hashes client IPs with `IP_HASH_SECRET`, and records a retention expiry. Uploaded submission files are private and can be read only through authenticated form-management access.

Run `npm run test:integration` against migrated PostgreSQL and a production server on port `3000` to exercise the multipart submission route. Run `npm run test:core:integration` to verify localized public media, anonymous private-media filtering, and audit permissions.
