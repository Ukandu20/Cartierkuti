# Production Hardening Changes

This document records the first production-readiness pass and why each change was necessary.

## Admin Authentication

The old admin flow used a shared secret stored in browser `sessionStorage` and sent as `x-admin-secret`. That made every protected write depend on one reusable raw secret. The backend now exposes `POST /api/admin/login`, verifies `ADMIN_USERNAME` plus a bcrypt `ADMIN_PASSWORD_HASH`, and returns a signed JWT. Protected endpoints verify `Authorization: Bearer <token>` with `JWT_SECRET` and `ADMIN_TOKEN_TTL`.

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
