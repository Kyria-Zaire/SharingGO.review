# S1-T4 - Lance les preuves E2E Stripe (CTO)
# Usage: .\scripts\run-s1-t4-e2e.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$envPath = Join-Path $Root ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "Fichier .env introuvable." -ForegroundColor Red
    exit 1
}

$content = Get-Content $envPath -Raw
if ($content -match 'STRIPE_SECRET_KEY=pk_') {
    Write-Host ""
    Write-Host "ERREUR: STRIPE_SECRET_KEY contient pk_test_ (cle publique)." -ForegroundColor Red
    Write-Host "Utilisez la Secret key (sk_test_...) : Dashboard -> Developers -> API keys -> Reveal secret key"
    Write-Host ""
    exit 1
}

$badSecret = $content -match 'STRIPE_SECRET_KEY=sk_test_\r?\n' -or $content -match 'STRIPE_SECRET_KEY=sk_test_\s*$'
$badWebhook = $content -match 'STRIPE_WEBHOOK_SECRET=whsec_\r?\n' -or $content -match 'STRIPE_WEBHOOK_SECRET=whsec_\s*$'

if ($badSecret -or $badWebhook) {
    Write-Host ""
    Write-Host "Cles Stripe requises avant E2E:" -ForegroundColor Yellow
    Write-Host "  1. STRIPE_SECRET_KEY=sk_test_... (secret key, pas pk_test_)"
    Write-Host "  2. .\scripts\stripe-listen.ps1  (terminal dedie)"
    Write-Host "  3. whsec_... -> STRIPE_WEBHOOK_SECRET dans .env"
    Write-Host "  4. docker compose -f docker-compose.dev.yml up -d --force-recreate backend"
    Write-Host "  5. Relancer ce script"
    Write-Host ""
    exit 1
}

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + `
    [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "Verification backend..." -ForegroundColor Cyan
try {
    $null = Invoke-RestMethod -Uri "http://localhost:3000/health" -TimeoutSec 5
} catch {
    Write-Host "Backend non joignable sur :3000" -ForegroundColor Red
    exit 1
}

Write-Host "Lancement script E2E Node..." -ForegroundColor Cyan
node backend/scripts/s1-t4-stripe-e2e.mjs
exit $LASTEXITCODE
