# Frontend

Vite + React client for the VeriSight deepfake image detector.

## Commands

```bash
npm install
npm run dev
npm run build
```

The app proxies `/predict`, `/api`, `/health`, and `/fetch-image` to `VITE_API_TARGET` during local development.
