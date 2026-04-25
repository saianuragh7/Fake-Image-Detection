# Verisight Frontend

Production-ready React + Vite frontend for Verisight, an AI-image forensics product. The app includes a polished landing page, upload-based detection workflow, scan detail pages, analytics dashboard, and a resilient in-browser mock API for static demos.

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Wouter routing
- TanStack Query
- shadcn/Radix UI components
- Recharts analytics
- Framer Motion interactions

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Quality Gates

```bash
npm run lint
npm run build
npm run preview
```

`npm run lint` runs strict TypeScript checks. `npm run build` outputs the production bundle to `dist/`.

## API Mode

By default the app uses a browser-side mock API for `/api/*`, so the site works on Vercel, Netlify, or any static host without a backend.

To connect a live backend:

```env
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://api.your-domain.com
```

For local proxy development:

```env
VITE_USE_MOCK_API=false
VITE_API_PROXY_TARGET=http://localhost:8080
```

The API contract is documented in `openapi.yaml`.

## Deploy

Vercel is preferred. The included `vercel.json` builds with `npm run build`, serves `dist/`, and rewrites non-API routes to `index.html` for client-side routing.

Netlify is also supported through `netlify.toml`.
