# Tunnel HTTPS ngrok → backend webhook (QA-01 — remplace stripe listen)
$Root = Split-Path -Parent $PSScriptRoot
$NgrokExe = Join-Path $env:LOCALAPPDATA `
  "Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"

if (-not (Test-Path $NgrokExe)) {
    $link = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links\ngrok.exe"
    if (Test-Path $link) { $NgrokExe = $link }
    else {
        Write-Host "ngrok introuvable. Installez: winget install ngrok.ngrok" -ForegroundColor Red
        exit 1
    }
}

Write-Host "ngrok webhook tunnel → localhost:3000" -ForegroundColor Yellow
Write-Host "Endpoint Stripe Dashboard: https://<subdomain>.ngrok-free.app/api/webhooks/stripe" -ForegroundColor Cyan
Write-Host "Event: checkout.session.completed" -ForegroundColor Cyan
Write-Host "Copiez le whsec_ dans .env STRIPE_WEBHOOK_SECRET puis recreate backend." -ForegroundColor Yellow
Set-Location $Root
& $NgrokExe http 3000
