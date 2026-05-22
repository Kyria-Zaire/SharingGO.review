# Lance l'environnement de développement Docker
Set-Location $PSScriptRoot\..
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example"
}
docker compose -f docker-compose.dev.yml up --build
