# Production Hardening Changes

This document records the first production-readiness pass and why each change was necessary.

## Admin Authentication

The old admin flow used a shared secret stored in browser `sessionStorage` and sent as `x-admin-secret`. That made every protected write depend on one reusable raw secret. Bootstrap credentials now create a singleton database-backed admin identity. Login supports TOTP and one-time recovery codes, protected endpoints verify versioned JWTs, and credential changes immediately invalidate every prior token.

Password recovery uses random 256-bit tokens whose SHA-256 hashes are stored in MongoDB with a 15-minute TTL. Tokens are single-use and delivered to a fixed recovery email through the backend. Username recovery returns the same public response for known and unknown addresses and sends reminders only out of band. Security events record authentication and recovery activity without passwords, reset tokens, MFA secrets, or recovery codes.

This improves production posture because the browser stores a short-lived token instead of the raw admin secret, the server can reject expired or malformed tokens, and deployment secrets can be rotated independently.

## Request Validation

Project, resume, review, activity, upload, and ObjectId inputs now pass through Zod validation before they reach Mongoose. The schemas reject malformed URLs, invalid arrays, bad ratings, invalid ObjectIds, oversized text, unknown write fields, non-image uploads, and oversized uploads.

This was necessary because Mongoose schemas alone do not give clear API-level contracts and can still allow unwanted or malformed data to reach persistence logic.

## Frontend/Backend Data Contract

Project data is normalized once on the frontend. The normalizer maps backend `_id` to frontend `id`, preserves `_id`, normalizes `featured`, and exposes real timestamp fields from `createdDate` and `lastUpdatedDate`.

This removes drift between `_id`/`id`, `featured`/`isFeatured`, and `date`/Mongoose timestamps. The result is safer favorite handling, view tracking, sorting, featured ribbons, and admin updates.

## Tests

Backend API tests now cover admin login/verify, protected writes, project CRUD, validation failures, bad ObjectIds, review validation, and resume updates. Frontend tests now use Vitest, React Testing Library, route smoke tests, Navbar assertions, and project normalization tests.

The old frontend tests were Create React App leftovers and did not describe the current UI. The new tests are tied to the actual Vite/React stack and the production auth/data contract.

## SEO and Content

Placeholder canonical and Open Graph URLs now use `VITE_SITE_URL`. The contact page uses the actual portfolio identity, and the broken `/blog` navigation link was removed because no route exists for it.

This prevents users and crawlers from seeing placeholder metadata or dead navigation.

## Admin Dashboard Split

The admin page now has extracted login and dashboard stats components while preserving the existing state ownership and UI behavior. This is intentionally moderate: it starts reducing the monolith without turning this hardening pass into a full dashboard rebuild.

## Logging and CI

Browser API debug logs are limited to development mode. CI now installs both apps, runs backend and frontend tests, builds the frontend, and only then proceeds to Docker/deployment jobs. Production seed/deploy configuration now references the new JWT credential secrets instead of `ADMIN_SECRET`.

These changes make regressions visible before deployment and avoid leaking noisy request/response details in production consoles.

## Production Readiness Follow-up

The admin project dialog now validates the write contract before calling `/api/projects`. Required fields are `title`, `description`, `category`, `status`, `externalLink`, `githubLink`, at least one `language`, and at least one `tag`. Optional URL fields such as `liveDemoLink` and `imageUrl` are validated only when present. The UI-only `date` field is intentionally omitted from project writes because `createdDate` and `lastUpdatedDate` are backend-managed Mongoose timestamps.

Backend validation, auth, upload, and not-found responses now use stable `{ message }` payloads, with validation-style failures returning `{ message: "Validation failed", errors: [{ path, message }] }` where a field path is available. The frontend maps that shape into inline project form errors and toast messages while keeping failed save/delete dialogs open.

Playwright E2E coverage now exercises admin login success and failure, project create/edit/delete flows, frontend validation that blocks invalid submits, portfolio category aliases such as `Machine Learning/AI` and `AI/ML`, and mobile-visible project card actions. CI installs Playwright Chromium and runs `npm run test:e2e` after frontend unit tests.

Required production secrets are:

- `MONGODB_URI`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_RECOVERY_EMAIL`
- `JWT_SECRET`
- `ADMIN_TOKEN_TTL`
- `MFA_ENCRYPTION_KEY`
- `RESEND_API_KEY`
- `SECURITY_EMAIL_FROM`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`
- `GHCR_TOKEN`

Developer workflow note: this repository currently lives in a OneDrive-backed directory, which has already made `.git` lock-file writes unreliable. Moving the checkout to a non-synced path such as `C:\dev\Cartierkuti` will reduce intermittent Git and file watcher issues.
