# Cartierkuti Portfolio

Full-stack personal portfolio for Preston Ukandu. The frontend is a Vite/React app deployed as a static site, and the backend is an Express/Mongo API for projects, resume content, activities, admin operations, and uploads.

## Structure

- `frontend/` - React, Vite, Chakra UI, portfolio pages, admin UI.
- `backend/` - Express, Mongoose, JWT admin auth, validation, Docker config.
- `docs/production-hardening.md` - security and readiness changes made during the production hardening pass.

## Backend Setup

Create `backend/.env.development`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cartierkuti
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt hash>
ADMIN_RECOVERY_EMAIL=<private recovery email>
JWT_SECRET=<long random secret>
ADMIN_TOKEN_TTL=30m
MFA_ENCRYPTION_KEY=<independent long random secret>
RESEND_API_KEY=<server-side Resend API key>
SECURITY_EMAIL_FROM=Cartierkuti Security <security@your-verified-domain.example>
```

Generate a password hash:

```powershell
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('your-password', 12).then(console.log)"
```

Run the backend:

```powershell
cd backend
npm install
npm run dev
```

## Frontend Setup

Create `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:5000
VITE_SITE_URL=http://localhost:5173
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

Run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Tests and Build

```powershell
cd backend
npm test

cd ../frontend
npm test
npm run build
```

`npm run audit:performance` in `frontend/` builds the production app and measures cold desktop/mobile loads locally with Playwright. It writes `frontend/performance-results/audit.json`. The audit uses fixture APIs, tiny images, and blocked external fonts to isolate JavaScript and layout costs; it is not live-site or Lighthouse data.

Public project, category, and résumé requests share a 60-second in-memory cache and deduplicate in-flight requests. Successful admin writes invalidate the affected cached data. Category defaults are initialized at backend startup, so category-list reads perform no upserts. Project images served by Cloudinary use responsive widths and automatic format/quality; signed and other-provider URLs are preserved. Résumé downloads stream through the API, with versioned download links and a five-minute public cache lifetime.

The Chakra theme includes only the recipes used by this app. When adding a new Chakra widget, add its recipe to `frontend/src/components/Theme/themePreset.js` if required. Hashed `/assets/*` files use an immutable one-year cache on Netlify.

## Admin Usage

`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `ADMIN_RECOVERY_EMAIL` are one-time bootstrap values. On first authenticated use, the backend creates the singleton admin identity in MongoDB; the database is the source of truth after that point. Changing environment bootstrap values does not overwrite an existing account.

The admin UI logs in through `POST /api/admin/login`. After TOTP enrollment, login completes through `POST /api/admin/login/mfa`. Successful login returns a versioned JWT stored in `sessionStorage` as `adminToken`. Protected API writes require:

```http
Authorization: Bearer <token>
```

Credential changes require the current password and a TOTP or one-time recovery code. Password recovery uses a hashed, single-use token that expires after 15 minutes and is delivered only to `ADMIN_RECOVERY_EMAIL`. Username reminders are also delivered only to that address. Credential and MFA changes increment the account credential version, immediately invalidating all existing JWTs.

The previous `x-admin-secret` flow has been removed.

### Public Project Browsing

Home uses `GET /api/projects/selected?limit=3`, prioritizing featured projects and then views. Portfolio uses `GET /api/projects/browse?page=1&limit=9&category=all&search=&sort=date`. Browse supports `date`, `title`, and `views` sorting, literal search text, and category slugs including legacy aliases. Its response includes the current `projects` page, filtered `total`, `totalProjects`, populated `categories` with counts, and the collection's `featuredProject`. Public cards receive `avgStars` and `reviewCount` instead of review arrays; the existing review endpoint supplies paginated feedback when opened.

The selected endpoint accepts at most 3 entries and browse accepts at most 24 per page. The existing `GET /api/projects` array response remains compatible with the admin dashboard and older clients. Public query results are cached for 60 seconds, with at most 60 entries; successful project, review, or category writes invalidate the relevant variants. Search requests wait 250 ms after typing and changed filters reset pagination together. Deploy these backend routes before the frontend for bounded downloads. If an older backend returns a missing-route response (404 or an invalid project ID for these route names), the frontend temporarily uses the cached legacy list with local filtering and pagination. Other API errors still display Retry.

### Project Visibility

In Admin > Projects, use the project's actions menu to **Hide from website** or **Show on website**. The editor also provides **Show on public website** under Publishing. Hidden projects remain editable, with their images, reviews, views, and featured setting preserved. Use **Filter by visibility** to find hidden projects. Existing projects default to public.

The admin dashboard reads the authenticated `GET /api/projects/admin` endpoint. Public lists, selected work, category counts, search, individual project reads, reviews, and view tracking exclude projects with `visible: false`. Successful visibility changes invalidate the browser's public project cache; other visitors' cached lists expire within 60 seconds. Deploy the backend before the frontend to enable the protected admin list and visibility enforcement. Hiding removes a project from this website; previously shared external links and image URLs are unchanged.

### About Page Content

The About editor separates education into institution, program name, program level, start date, finish date, and status. Dates accept a year or year and month. For In progress, the finish field becomes an optional expected finish; leaving it empty displays Present. Education sits alongside the introduction, followed by experience, ahead of metrics and working principles. Highlights appear as wrapping tags throughout the page and preview. The program is displayed as a heading; level and status appear as badges. Existing `degree` and `period` values remain readable.

The Page text tab edits the main heading, section labels and introductions, working approaches (add or remove up to 12), skill group names, personal and gallery headings, contact invitation, button text, browser title, and search description. These are saved in `pageContent`. Existing pages retain their previous copy until edited; cleared optional copy stays cleared. The preview shares the public page renderer. Empty personal-data collections stay empty, and unavailable data never produces sample jobs, education, qualifications, or skills. Deploy the backend schema update before the frontend.

“Outside my work” supports optional Language, Learning, Interest, and Volunteering cards with a status, descriptive proficiency level, and personal note. The experience gallery supports photos, accessible descriptions, captions or stories, dates, locations, and featured entries. Both collections support reordering, removal with undo, visibility controls, and public preview. Empty or fully hidden sections disappear from the public page.

Gallery photos accept JPEG, PNG, WebP, or GIF up to 2 MB. Uploads are kept separate from the published page until Save About page is selected. Unsaved photo references are retained with the browser draft; explicit discard cleans them up. Removed or replaced photos are cleaned up after a successful save. The gallery initially shows six photos, prioritizes featured entries, and loads additional photos through View more. Full-size photos load only when opened.

Public `GET /api/resume` excludes hidden education, personal cards, and gallery entries. The editor uses protected `GET /api/resume/admin` to load all entries, including hidden ones. Gallery uploads and cleanup use authenticated `POST`/`DELETE /api/resume/gallery-image`; cleanup rejects assets still referenced by the saved About page. Deploy the updated backend before the frontend.

## Deployment Notes

- About-page saves use `PUT /api/resume`: JSON for text-only updates, or multipart with a JSON `content` field and optional `resume` PDF (maximum 5 MB). The PDF uploads to a unique asset before content and file metadata publish together in one database update. Failed uploads preserve the published page; failed saves retain the editor draft and staged file for retry. Deploy the backend supporting this contract before deploying the frontend.
- Project edits use a mutation identifier to detect overlapping admin writes. Audit failures restore only the edited fields when that mutation is still current, preserving concurrent views and reviews. Conflicting edits or deletions return HTTP 409 and require reloading.
- Netlify builds the frontend from `frontend/`.
- Backend Docker builds from `backend/Dockerfile`; MongoDB is not published to the host by default.
- Production startup never runs a destructive seed automatically. `npm run seed:prod` performs idempotent upserts and must be invoked explicitly when bundled starter data changes.
- Production must define `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_RECOVERY_EMAIL`, `JWT_SECRET`, `MFA_ENCRYPTION_KEY`, `RESEND_API_KEY`, `SECURITY_EMAIL_FROM`, `MONGODB_URI`, `CLIENT_URL`, Cloudinary values, and any EmailJS frontend values.
- `CLIENT_URL` is the fixed trusted origin used to construct password-reset links; do not derive it from request headers.
- Keep JWT, MFA, email-provider, and bootstrap credential secrets out of committed files.
