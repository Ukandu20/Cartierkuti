# Cartierkuti Frontend

Vite/React frontend for the Cartierkuti portfolio.

## Environment

Create `.env.development`:

```env
VITE_API_URL=http://localhost:5000
VITE_SITE_URL=http://localhost:5173
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

## Commands

```powershell
npm install
npm run dev
npm test
npm run build
```

The app expects the backend API to expose JWT admin auth and project/resume endpoints documented in the root README.
