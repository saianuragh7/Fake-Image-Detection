$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

Write-Host "Starting API on http://127.0.0.1:8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000"

Write-Host "Starting frontend on http://127.0.0.1:5173"
Set-Location "$root\frontend"
npm run dev -- --host 127.0.0.1
