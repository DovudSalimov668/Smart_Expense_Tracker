$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$venvPython = Join-Path $backend ".venv\Scripts\python.exe"
$rootVenvPython = Join-Path $root ".venv\Scripts\python.exe"

if (Test-Path $venvPython) {
  $python = $venvPython
} elseif (Test-Path $rootVenvPython) {
  $python = $rootVenvPython
} else {
  $python = "python"
}

Write-Host ""
Write-Host "Starting Smart Expense backend..." -ForegroundColor Cyan
Write-Host "Backend: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host ""

Push-Location $backend
try {
  & $python manage.py migrate
  & $python manage.py runserver 127.0.0.1:8000
} finally {
  Pop-Location
}
