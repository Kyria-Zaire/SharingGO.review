# Resolve Stripe CLI (winget) when "stripe" is not on PATH in the current terminal.
$StripeExe = Join-Path $env:LOCALAPPDATA `
  "Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe"

if (-not (Test-Path $StripeExe)) {
    $link = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links\stripe.exe"
    if (Test-Path $link) { $StripeExe = $link }
    else {
        Write-Host "Stripe CLI introuvable. Installez: winget install Stripe.StripeCli" -ForegroundColor Red
        Write-Host "Puis fermez et rouvrez le terminal (ou Cursor)." -ForegroundColor Yellow
        exit 1
    }
}

if ($args.Count -eq 0) {
    Write-Host "Usage: .\scripts\stripe-cli.ps1 listen --forward-to localhost:3000/api/webhooks/stripe"
    Write-Host "       .\scripts\stripe-cli.ps1 login"
    exit 0
}

& $StripeExe @args
exit $LASTEXITCODE
