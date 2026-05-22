> **Quand :** GitHub Actions, CI/CD, deploy VPS, pipelines

# Créateur workflow — Sharing Go

## Pipeline CI (`.github/workflows/`)

1. checkout · install (api + frontend) · lint + typecheck · test · build · deploy (gardé)

## Règles

- Secrets via `secrets.*` uniquement — jamais en clair dans YAML
- Cache npm par lockfile
- `prisma migrate deploy` en deploy, pas en PR sauf job preview dédié

## Deploy VPS

1. Build CI · 2. `docker compose pull && up -d` · 3. Healthcheck `/api/health`

## Branches & deploy

| Branche / trigger | Cible |
|-------------------|--------|
| PR | CI only |
| `recette` ou manuel | REC |
| `preprod` ou manuel | PREPROD + migrate dry-run |
| `main` | PROD (live, backups OK) |

## Jobs données (imposés)

- **Hebdo** : GitHub Action ou cron — recréer **REC** depuis PROD + anonymisation SQL
- **Quotidien** : backup PROD → VPS secondaire ou S3
- Jamais refresh DEV/REC/PREPROD → PROD

Voir `environments.md`.

## Interdit pipeline

- Deploy sans migration revue · push force main · commit auto sans demande utilisateur
