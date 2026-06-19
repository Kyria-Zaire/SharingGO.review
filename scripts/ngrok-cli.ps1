# Resolve ngrok (winget) when "ngrok" is not on PATH in the current terminal.
$NgrokExe = Join-Path $env:LOCALAPPDATA `
  "Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"

if (-not (Test-Path $NgrokExe)) {
    $link = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links\ngrok.exe"
    if (Test-Path $link) { $NgrokExe = $link }
    else {
        Write-Host "ngrok introuvable. Installez: winget install ngrok.ngrok" -ForegroundColor Red
        Write-Host "Puis fermez et rouvrez le terminal (ou Cursor)." -ForegroundColor Yellow
        exit 1
    }
}

if ($args.Count -eq 0) {
    Write-Host "Usage: .\scripts\ngrok-cli.ps1 config add-authtoken <TOKEN>"
    Write-Host "       .\scripts\ngrok-cli.ps1 config check"
    Write-Host "       .\scripts\ngrok-cli.ps1 http 3000"
    exit 0
}

& $NgrokExe @args
exit $LASTEXITCODE
