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

## Admin Usage

`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `ADMIN_RECOVERY_EMAIL` are one-time bootstrap values. On first authenticated use, the backend creates the singleton admin identity in MongoDB; the database is the source of truth after that point. Changing environment bootstrap values does not overwrite an existing account.

The admin UI logs in through `POST /api/admin/login`. After TOTP enrollment, login completes through `POST /api/admin/login/mfa`. Successful login returns a versioned JWT stored in `sessionStorage` as `adminToken`. Protected API writes require:

```http
Authorization: Bearer <token>
```

Credential changes require the current password and a TOTP or one-time recovery code. Password recovery uses a hashed, single-use token that expires after 15 minutes and is delivered only to `ADMIN_RECOVERY_EMAIL`. Username reminders are also delivered only to that address. Credential and MFA changes increment the account credential version, immediately invalidating all existing JWTs.

The previous `x-admin-secret` flow has been removed.

## Deployment Notes

- Netlify builds the frontend from `frontend/`.
- Backend Docker builds from `backend/Dockerfile`; MongoDB is not published to the host by default.
- Production startup never runs a destructive seed automatically. `npm run seed:prod` performs idempotent upserts and must be invoked explicitly when bundled starter data changes.
- Production must define `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_RECOVERY_EMAIL`, `JWT_SECRET`, `MFA_ENCRYPTION_KEY`, `RESEND_API_KEY`, `SECURITY_EMAIL_FROM`, `MONGODB_URI`, `CLIENT_URL`, Cloudinary values, and any EmailJS frontend values.
- `CLIENT_URL` is the fixed trusted origin used to construct password-reset links; do not derive it from request headers.
- Keep JWT, MFA, email-provider, and bootstrap credential secrets out of committed files.
