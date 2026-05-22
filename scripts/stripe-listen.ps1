$Root = Split-Path -Parent $PSScriptRoot
Write-Host "Stripe webhook proxy - copy whsec_ to .env STRIPE_WEBHOOK_SECRET" -ForegroundColor Yellow
Set-Location $Root
$cli = Join-Path $PSScriptRoot "stripe-cli.ps1"
& $cli listen --forward-to localhost:3000/api/webhooks/stripe
