#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000 &
API_PID=$!

cleanup() {
  kill "$API_PID" >/dev/null 2>&1 || true
}

trap cleanup EXIT

cd "$ROOT_DIR/frontend"
npm run dev -- --host 127.0.0.1
