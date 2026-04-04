# Build mobile.html from index.html
# Run: .\build-mobile.ps1

$ErrorActionPreference = "Stop"
Push-Location $PSScriptRoot

Write-Host "Building mobile.html from index.html..." -ForegroundColor Cyan

try {
    node build-mobile.js
    Write-Host "`nDone! mobile.html is now synced with index.html" -ForegroundColor Green
} catch {
    Write-Host "`nError: Make sure Node.js is installed" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Pop-Location
