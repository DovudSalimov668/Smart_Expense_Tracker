$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"

Write-Host ""
Write-Host "Starting Smart Expense frontend..." -ForegroundColor Cyan
Write-Host "Frontend: http://127.0.0.1:5173" -ForegroundColor Green
Write-Host ""

Push-Location $frontend
try {
  if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    & npm.cmd install
  }

  & npm.cmd run dev -- --host 127.0.0.1 --port 5173
} finally {
  Pop-Location
}
