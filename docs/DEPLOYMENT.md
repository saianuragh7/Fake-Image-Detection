# Deployment Guide

## Recommended topology

- Frontend: Vercel or Netlify using the `frontend/` directory
- Backend: Render using the root `Dockerfile`
- Model checkpoint: provide a downloadable URL through `MODEL_URL` or mount a file via `MODEL_PATH`

## Backend on Render

1. Create a new Web Service from this repository.
2. Select `Docker` runtime and keep the repo root as the service root.
3. Set `MODEL_URL` to a public checkpoint URL or set `MODEL_PATH` to a mounted path.
4. Add `CORS_ALLOW_ORIGINS` with your frontend domain.
5. Deploy and verify `GET /health`.

## Frontend on Vercel

1. Import the repository.
2. Set the root directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_API_TARGET` to your backend URL for preview builds if needed.

## Notes

- The repository intentionally excludes large checkpoints and datasets.
- Runtime scan history is stored under `.cache/scans/` by default and should stay out of git.
