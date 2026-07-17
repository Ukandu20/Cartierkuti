# Architecture Fixes Explained

This document explains every file changed during the architecture and reliability work. It is based on the current Git working-tree diff.

For each file:

- **What changed** describes the code or configuration that was edited.
- **Why** explains the problem the change addresses.
- **What it does now** describes the new behavior in simple terms.

## Main outcomes

The changes make project writes safer, move activity logging fully into the backend, validate untrusted input, protect private admin data, prevent destructive production seeding, remove duplicate frontend requests, improve resume handling, clean up dependencies, and add regression tests for the corrected behavior.

## Root documentation

### `README.md`

- **What changed:** The deployment notes now say that MongoDB is not exposed to the host by default. They also explain that production does not seed automatically and that `npm run seed:prod` must be started manually when starter data changes.
- **Why:** The previous production flow could start a seed job automatically. Since the old seed implementation deleted existing projects first, deploying the application could destroy live data.
- **What it does now:** A developer reading the setup guide sees the safer production rules before deploying or running a seed.

## Backend deployment and dependencies

### `backend/docker-compose.yml`

- **What changed:** MongoDB received a health check, the API now waits until MongoDB is healthy, and MongoDB's port is no longer published to the host.
- **Why:** Container startup order alone does not mean the database is ready. Publishing port `27017` also exposed the database outside the Docker network when the API was the only service that needed it.
- **What it does now:** The API starts only after MongoDB answers a health check, and MongoDB remains available to the internal Docker network without being exposed on the host.

### `backend/docker-compose.dev.yml`

- **What changed:** Added a MongoDB health check, made the development seed wait for a healthy database, and made the API wait for both MongoDB and the completed seed. Host `node_modules` mounts were replaced with a Docker-managed volume.
- **Why:** The seed or API could run before MongoDB was ready. Mounting host dependencies into a Linux container can also cause platform-specific module problems and overwrite dependencies installed in the image.
- **What it does now:** Development services start in a predictable order, and dependencies are kept in a Docker volume that matches the container environment.

### `backend/docker-compose.prod.yml`

- **What changed:** Removed the automatic production seed service. Added a MongoDB health check and made the API depend on a healthy database.
- **Why:** A production deployment must not rewrite data automatically. The API also needs database readiness, not merely a started MongoDB process.
- **What it does now:** Production startup only starts the application and database. Seeding is an explicit maintenance action.

### `backend/package.json`

- **What changed:** Removed `express-async-errors`, the direct `mongodb` driver dependency, and `nodemailer`.
- **Why:** The project already wraps async routes with `express-async-handler`, uses Mongoose instead of the raw driver, and does not send email from the backend. Keeping unused packages increases maintenance work, install size, and security exposure.
- **What it does now:** The backend declares only the packages it actually uses for these responsibilities.

### `backend/package-lock.json`

- **What changed:** The lockfile was regenerated after removing unused packages and applying dependency security updates.
- **Why:** A lockfile must match `package.json` and record exact dependency versions so installations are repeatable.
- **What it does now:** `npm ci` installs the cleaned and audited dependency tree consistently.

### `backend/scripts/dynamicseeder.js`

- **What changed:** Existing projects and activities are deleted only when the script receives the `--wipe` flag.
- **Why:** A helper script should not erase data merely because it was run. Destructive behavior should be explicit.
- **What it does now:** Normal runs add generated data without first clearing the database. Development Compose intentionally passes `--wipe` when a clean generated dataset is wanted.

### `backend/scripts/seeder.js`

- **What changed:** Replaced `deleteMany()` followed by `insertMany()` with `bulkWrite()` upserts keyed by each project's GitHub link.
- **Why:** Deleting the whole collection before seeding could erase live projects. Upserts can update known starter records without removing unrelated records.
- **What it does now:** Running the real-data seed updates matching projects or inserts missing ones while preserving other database content.

## Backend startup, configuration, and middleware

### `backend/src/app.js`

- **What changed:** Removed the global `express-async-errors` import and enabled `trust proxy` with one trusted proxy hop in production.
- **Why:** Async errors are already handled by explicit route wrappers. Production is expected to run behind a reverse proxy, and Express needs the proxy setting to read the correct client IP for rate limiting and request information.
- **What it does now:** Error handling has one clear mechanism, and production proxy information is interpreted correctly without trusting an unlimited proxy chain.

### `backend/src/config/cors.js`

- **What changed:** Set CORS `credentials` to `false`.
- **Why:** Authentication uses an explicit bearer token, not cross-site cookies. Advertising credentialed CORS was unnecessary and made the browser security contract broader than required.
- **What it does now:** Approved origins can call the API and send the `Authorization` header, but the API does not claim to support cross-origin cookies or browser credentials.

### `backend/src/config/env.js`

- **What changed:** Added `validateEnvironment()` using Envalid. It validates the common runtime values and requires admin, JWT, client URL, and Cloudinary values in production.
- **Why:** Missing or malformed environment variables otherwise cause failures later, often only when a particular route is used.
- **What it does now:** The server checks critical configuration during startup and stops immediately with a useful configuration error when required production values are absent.

### `backend/src/logger.js`

- **What changed:** Logging is silent during tests, remains readable and detailed in development, and uses normal informational logging in production. Formatting was also made consistent with the rest of the backend.
- **Why:** Request logs made test output extremely noisy and hid useful failure messages.
- **What it does now:** Automated test output is focused on test results while development and production keep appropriate logs.

### `backend/src/middleware/auth.js`

- **What changed:** JWT verification now accepts only `HS256` tokens with the expected issuer and audience, in addition to checking the admin role.
- **Why:** Checking only the signature and role leaves the token contract less specific. Issuer, audience, and algorithm checks prevent accepting a correctly signed token intended for a different purpose.
- **What it does now:** Admin routes accept only tokens created for the Cartierkuti admin interface by the Cartierkuti API.

### `backend/src/middleware/errorhandler.js`

- **What changed:** Removed the indirect `http-errors` dependency for 404 errors and creates a normal error with status `404`. Production responses for server errors now hide internal messages and validation details.
- **Why:** The project did not need an extra package for a simple not-found error. Returning stack details or database/internal messages in production can expose implementation information.
- **What it does now:** Clients still receive useful 4xx errors, while unexpected production failures return a safe `Internal Server Error` message and full details remain in server logs.

### `backend/src/server.js`

- **What changed:** Calls `validateEnvironment()` before connecting to MongoDB and starting the server.
- **Why:** Defining validation without running it would not protect startup.
- **What it does now:** Invalid configuration prevents the application from starting in a half-configured state.

## Backend models

### `backend/src/models/activity.model.js`

- **What changed:** Replaced the unused `userId` reference with a simple `actor` string. Added indexes for newest-first activity queries and type-plus-date queries.
- **Why:** There is no User model behind the old reference, and admin identity is currently a username from the JWT. Activity screens frequently sort and filter by timestamp and type.
- **What it does now:** Audit records store who performed the action in a form the application actually has, and common activity queries can use database indexes.

### `backend/src/models/archive.model.js`

- **What changed:** Added an index on `originalId` and descending `deletedAt`.
- **Why:** Archive lookups commonly search for one original project and display the newest archive first.
- **What it does now:** Those archive queries can be served more efficiently as the archive grows.

### `backend/src/models/project.model.js`

- **What changed:** Removed hidden activity-writing Mongoose hooks. Reviews now default to an empty array and are limited to 500 per project.
- **Why:** The hooks wrote audit entries for any `save` or `findOneAndUpdate`, including unrelated changes such as view counters, and they could fail silently. An unlimited embedded review array would eventually make project documents large and slow.
- **What it does now:** Activity logging happens explicitly in the project service, view updates do not create false audit entries, and embedded reviews have a defined safety limit.

### `backend/src/models/resume.model.js`

- **What changed:** Added an immutable, unique `key` with the value `primary`.
- **Why:** Calling `findOne()` without a stable identifier can create or update different resume records during concurrent requests.
- **What it does now:** The database enforces one well-known primary resume document.

## Backend services and routes

### `backend/src/services/project.service.js` — new file

- **What changed:** Added one service containing project creation, update, archive/delete, and their activity records. Each operation includes compensating rollback logic.
- **Why:** Routes previously performed some database work, Mongoose hooks performed other work, and the frontend performed additional audit writes. That split could create duplicate activities or leave partially completed operations.
- **What it does now:** A route makes one backend call. The service changes the project and writes exactly one audit record. If the audit or archive step fails, it attempts to restore the previous database state and logs any rollback failure.

### `backend/src/routes/activities.router.js`

- **What changed:** Removed the public-facing activity creation route and the complex production project-prefilter. The read route now requires admin authentication, validates all query parameters, supports bounded pagination, uses lean results, and treats a date-only end date as the end of that day.
- **Why:** Clients should not be able to invent audit events. Activity history is admin information, and unchecked limits or invalid dates could cause errors or expensive queries.
- **What it does now:** Only backend project operations create activity records. Authenticated admins can read validated, paginated activity history with predictable date filtering.

### `backend/src/routes/admin.router.js`

- **What changed:** Login tokens now include the fixed issuer and audience expected by the auth middleware. Login responses include an exact `expiresAt` timestamp. The login rate limiter is skipped in tests.
- **Why:** The frontend previously guessed expiration from its own fixed duration, which could disagree with the JWT configuration. Repeated integration-test logins could also hit the rate limiter.
- **What it does now:** The frontend can end the session when the actual server-issued token expires, and tests remain deterministic without weakening production rate limiting.

### `backend/src/routes/project.router.js`

- **What changed:** This route now uses the project service for create, update, and delete operations. Image uploads check actual JPEG, PNG, GIF, or WebP file signatures. Project lists select only the fields they need and include only review stars, not full review comments. Archive and review queries are validated and paginated. Reviews are returned newest-first, capped at 500, and a successful submission returns the saved review with HTTP `201`.
- **Why:** The route contained multi-step mutation logic, image validation trusted only the browser-provided MIME type, list responses could expose and transfer all review text, and unbounded review/archive queries would become slower over time. The frontend also needed the real saved review rather than an optimistic local copy.
- **What it does now:** Project writes are consistent and audited, forged image uploads are rejected before Cloudinary, list payloads are smaller, archive/review reads are bounded, and review clients receive the database-created review ID and date.

### `backend/src/routes/resume.router.js`

- **What changed:** Added a stable `primary` resume lookup with backward compatibility for an older document without a key. Public GET no longer creates a database record. Resume updates and uploads target the same singleton. PDF uploads must begin with the real PDF signature `%PDF-`.
- **Why:** A public read should not mutate the database, concurrent upserts could create multiple resume records, and MIME type alone can be forged.
- **What it does now:** Reads are side-effect free, all admin writes consistently update the primary resume, existing legacy data remains discoverable, and fake PDF content is rejected.

## Backend validation and tests

### `backend/src/validation/schemas.js`

- **What changed:** Reused a shared Mongo ObjectId validator and added strict schemas for archive, activity, and review query parameters. Dates must be parseable, page sizes are bounded, and activity start dates cannot be later than end dates. Removed the client activity-write schema.
- **Why:** Query strings are untrusted input just like request bodies. Invalid IDs, dates, or huge limits could cause errors or excessive work. Client-written activities are no longer part of the architecture.
- **What it does now:** Routes receive converted, validated page and limit values and reject unknown or invalid query fields with a clear `400` response.

### `backend/tests/api.test.js`

- **What changed:** Updated project creation and review expectations to HTTP `201`. Added checks for create/update/delete activity records, archive creation, rollback when activity logging fails, no activity noise from view counters, image and PDF signature validation, bounded review queries, strict review bodies, and protected activity history.
- **Why:** These are the contracts most likely to regress because they span routes, models, services, and database state.
- **What it does now:** The integration suite proves both the successful behavior and important failure behavior of the new architecture.

### `backend/tests/cors.test.js`

- **What changed:** The approved-origin test now expects no `Access-Control-Allow-Credentials` header.
- **Why:** This matches the deliberate switch to bearer-token CORS without cross-origin cookies.
- **What it does now:** The test protects the narrower CORS policy instead of expecting the old credentialed policy.

## Frontend dependencies and build files

### `frontend/package.json`

- **What changed:** Removed unused or obsolete Chakra CLI/toast, Font Awesome, placeholder utility, old EmailJS, toaster, and unused type packages. Added the maintained `@emailjs/browser` package and upgraded Swiper to version 14.
- **Why:** The UI uses Chakra's current toaster, `react-icons`, and browser EmailJS directly. Unused packages increase bundle/install size and vulnerability exposure. The Swiper update resolves dependency audit issues.
- **What it does now:** The frontend dependency list matches the code that is actually imported and uses maintained package versions.

### `frontend/package-lock.json`

- **What changed:** Regenerated after dependency removals, the EmailJS replacement, the Swiper upgrade, and audit fixes.
- **Why:** Exact transitive versions must match the new dependency declaration.
- **What it does now:** Clean installs reproduce the tested frontend dependency tree, which currently audits with no known vulnerabilities.

### `frontend/index.html`

- **What changed:** Corrected the description metadata, cleaned the `<html>` tag, and removed obsolete Create React App comments and commands from the Vite template.
- **Why:** The old custom meta name was not a standard page description, and the comments referred to `%PUBLIC_URL%` and `npm start`, neither of which describes this Vite project.
- **What it does now:** Search engines receive a standard description, and the entry file contains only relevant Vite-era markup.

### `frontend/vite.config.mjs`

- **What changed:** Unrecognized dependencies are no longer forced into one generic `vendor` chunk. Explicit React, Chakra, icons, motion, API, and Swiper groups remain.
- **Why:** The catch-all vendor chunk pulled code from lazy pages into a large shared file and weakened route-level code splitting.
- **What it does now:** Rollup can place remaining modules with the pages that use them, while important stable libraries still receive predictable cacheable chunks.

## Frontend application and shared services

### `frontend/src/App.jsx`

- **What changed:** Removed the extra `64px` top padding and changed the main area's minimum height to account for the actual `90px` navigation area.
- **Why:** The navbar already occupies layout space, so the old padding created an unnecessary gap and used a height that did not match the component.
- **What it does now:** Page content begins in the correct position and the footer layout uses the remaining viewport height more accurately.

### `frontend/src/utils/apiConfig.js` — new file

- **What changed:** Added one place that normalizes `VITE_API_URL`, requires it for Axios, and builds either absolute or relative API URLs for links.
- **Why:** API URL handling was duplicated and sometimes produced strings such as `undefined/api/...` when a relative link was acceptable.
- **What it does now:** Request clients get a clear startup error when their backend origin is missing, while browser links such as resume downloads can safely fall back to `/api/...`.

### `frontend/src/utils/axiosConfig.js`

- **What changed:** Uses the shared API configuration helper and treats `/api/activities` as an authenticated read route.
- **Why:** The activity API is now private, so GET requests need the same bearer token as archive and token-verification reads.
- **What it does now:** Admin activity requests automatically include the session token, and all Axios base-URL validation comes from one module.

### `frontend/src/services/resumeService.js` — new file

- **What changed:** Added a shared in-memory resume cache, including reuse of an already-running request and an explicit invalidation function.
- **Why:** The navbar hook and About page could request the same public resume at the same time. Duplicate requests add latency and can display inconsistent intermediate states.
- **What it does now:** Resume consumers share one result and one in-flight request. Admin saves invalidate the cache so the next public read receives fresh data.

### `frontend/src/hooks/useResumeDownload.js`

- **What changed:** Uses the shared resume service instead of making its own Axios request and uses `apiUrl()` to create the download URL.
- **Why:** This removes duplicate resume requests and prevents a missing environment value from appearing as `undefined` inside a link.
- **What it does now:** The hook shares cached resume data and produces either a valid configured API link, a relative API link, or the bundled fallback PDF.

### `frontend/src/pages/About/About.jsx`

- **What changed:** Uses `getPublicResume()` from the shared service instead of fetching the resume independently.
- **Why:** The About page and navbar often mount together and previously duplicated the same network request.
- **What it does now:** Both areas use one consistent cached resume response.

## Frontend admin area

### `frontend/src/pages/Admin/AdminDashboard.jsx`

- **What changed:** Removed frontend-created activity requests after project create, update, and delete. The dashboard now performs one project mutation and then refreshes server data. It also receives the auth hook's logout function and passes it to the header.
- **Why:** The old two-request workflow could save a project but fail to save its activity, or create duplicate activity records alongside model hooks. Audit records also should not be trusted to the browser.
- **What it does now:** The backend owns the whole mutation and audit operation. The dashboard has a visible path to end the admin session.

### `frontend/src/pages/Admin/components/AdminOverviewHeader.jsx`

- **What changed:** Added a red, ghost-style Log out button and logout icon, plus an `onLogout` prop.
- **Why:** The authentication hook could clear a session, but the dashboard did not provide an obvious user action for it.
- **What it does now:** An admin can explicitly remove the stored token and return to the logged-out state.

### `frontend/src/pages/Admin/hooks/useAdminActivities.js`

- **What changed:** Removed stale activity restoration from `localStorage`. Added safe response normalization and error handling that clears the list and returns success or failure.
- **Why:** Cached activity history could be outdated, survive beyond an admin session, and briefly expose old admin data. Unhandled request failures could also leave misleading results on screen.
- **What it does now:** Activity history always comes from the authenticated backend, and failed requests leave a predictable empty state.

### `frontend/src/pages/Admin/hooks/useAdminAuth.js`

- **What changed:** Stores and removes `adminExpiresAt`, restores sessions using that server timestamp, schedules logout from it, and exposes the clear-session function as `logout`.
- **Why:** The old fixed browser timeout could disagree with the JWT's configured lifetime and there was no dashboard logout control.
- **What it does now:** Browser session timing follows the token issued by the server, with the old fixed duration retained only as a compatibility fallback.

### `frontend/src/pages/Admin/hooks/useAdminProjects.js`

- **What changed:** Invalidates the shared resume cache after resume content is saved or a new PDF is uploaded.
- **Why:** Without invalidation, public components could continue showing the old cached resume after an admin update.
- **What it does now:** The next public resume request fetches the newly saved information.

## Frontend contact and portfolio

### `frontend/src/pages/Contact/Contact.jsx`

- **What changed:** Replaced deprecated `emailjs-com` with `@emailjs/browser` and changed toaster options from `status` to Chakra's current `type` property.
- **Why:** The old package is no longer the maintained browser client, and the wrong toaster property could prevent correct success/error styling.
- **What it does now:** Contact submissions use the maintained EmailJS SDK and display correctly typed notifications.

### `frontend/src/pages/Portfolio/Portfolio.jsx`

- **What changed:** Extracted sorting to a tested utility. View-counter failures are caught so they do not create unhandled promise rejections. New tabs use `noopener,noreferrer`. The Chakra Select now uses its required array value shape and reads the first selected value.
- **Why:** The old select contract could fail to display or update the chosen sort. New windows should not receive access to the opening page, and a non-critical analytics request should not break link navigation.
- **What it does now:** Sorting behaves predictably, external links open more safely, and users can still visit a project even if the view-count request fails.

### `frontend/src/pages/Portfolio/ProjectDetails.jsx`

- **What changed:** Review reads support the new paginated response. Submissions now send only `stars` and trimmed `comment`, prevent duplicate clicks, wait for the backend response, insert the saved review, and use the current toaster API. Review keys prefer the database ID.
- **Why:** The old component sent a client-created `date` that the strict API rejects and showed an optimistic review even if saving failed. It could also submit more than once while waiting.
- **What it does now:** The UI displays only reviews confirmed by the database, shows accurate success/failure feedback, and exposes a loading state during submission.

### `frontend/src/utils/projectSorting.js` — new file

- **What changed:** Added a pure helper for sorting projects by newest date, most views, or title.
- **Why:** Keeping sorting inside the large page component made the behavior harder to test directly.
- **What it does now:** The page calls a small reusable function that returns a sorted copy without changing the original project array.

## Frontend tests

### `frontend/src/components/Navbar/Navbar.test.jsx`

- **What changed:** The expected uploaded-resume download URL is now the valid relative `/api/resume/file/download` path.
- **Why:** Tests do not provide a production API origin, and the new URL helper deliberately creates a relative link in that situation instead of an invalid `undefined` URL.
- **What it does now:** The test verifies the same safe fallback behavior used by the application.

### `frontend/src/pages/Portfolio/ProjectDetails.test.jsx` — new file

- **What changed:** Added a component test that chooses five stars, submits a comment with surrounding spaces, and verifies the exact API body and rendered persisted review.
- **Why:** The review request mismatch was a real frontend/backend contract bug and needed direct regression coverage.
- **What it does now:** The suite fails if the component sends forbidden fields, stops trimming comments, or returns to rendering an unsaved optimistic review.

### `frontend/src/utils/projectSorting.test.js` — new file

- **What changed:** Added parameterized tests for date, view-count, and title sorting, plus a check that the input array is not mutated.
- **Why:** Sorting controls are easy to break when UI-library event shapes or page logic changes.
- **What it does now:** The three supported sort modes and immutability behavior are documented and protected by tests.

## Verification performed

The completed change set was checked with:

- Backend integration tests: 16 passed.
- Frontend unit and component tests: 20 passed.
- Playwright browser tests: 14 passed across desktop and mobile projects.
- Frontend production build: passed.
- Backend JavaScript syntax checks: passed.
- Backend and frontend dependency audits: no known vulnerabilities reported.
- Git whitespace/error check: passed.

Docker Compose could not be executed in the verification environment because Docker was not installed. The Compose files were reviewed as configuration, but they should still be run through `docker compose config` and started on a machine with Docker before the next deployment.

The production build still warns that the Chakra vendor chunk is larger than 500 KB before compression. It is approximately 152 KB after gzip. This is not a build failure, but deeper Chakra/provider restructuring would be needed if reducing that shared UI chunk becomes a priority.
