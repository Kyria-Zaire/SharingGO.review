> **Quand :** Docker Compose, Dockerfile, Nginx, Prisma deploy, VPS

# Ingénieur — Sharing Go

## Docker Compose (obligatoire)

| Service | Rôle |
|---------|------|
| `postgres` | Volume persistant, healthcheck |
| `api` | Node Express/TS, dépend de postgres healthy |
| `frontend` | Build Vite → artefacts statiques |
| `nginx` | Reverse proxy, static + proxy `/api` |

```yaml
# ✅ Postgres avec volume nommé — ❌ Pas Supabase/Neon
volumes:
  pgdata:
```

## Nginx

- `/` → static React · `/api` → upstream api
- Webhooks Stripe : body brut non transformé · PREPROD : router webhook test ≠ PROD

## Prisma

- `DATABASE_URL` via env · `prisma migrate deploy` en prod / PREPROD
- Seed **faker** en DEV uniquement · pas de seed prod en local

## Prod VPS

- TLS · backup **quotidien** → autre VPS ou S3
- Script **`restore-backup.sh`** (restaurer dernier backup)
- REC : Postgres conteneur **dédié** · PREPROD : réplica/clone séparé

## Environnements

**DEV · REC · PREPROD · PROD** — matrice complète : `environments.md`.

## Local dev (DEV)

- Stripe CLI : `stripe listen --forward-to localhost:PORT/webhooks/stripe`
- Cartes test `4242 4242 4242 4242`
